/**
 * WebRTC signaling transport using Firestore.
 *
 * Signaling layout (inside the rooms collection):
 *   rooms/{roomId}/calls/{callId}                          — call metadata
 *   rooms/{roomId}/calls/{callId}/participants/{uid}        — SDP, media state, ICE candidates
 *   rooms/{roomId}/calls/{callId}/iceCandidates/{uid}_{ts}  — real-time ICE candidate exchange
 *
 * Topology: full mesh (every participant holds an RTCPeerConnection to every
 * other participant).  Works well for ≤ 6 users — beyond that an SFU is needed.
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db, auth } from "./firebase";

/* ─── STUN servers (free, public) ─── */
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

/* ─── Event emitter for call lifecycle events (toasts, auto-disconnect) ─── */
const listeners = new Set();

function emit(event, data) {
  for (const fn of listeners) {
    try { fn(event, data); } catch (_) {}
  }
}

function onCallEvent(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/* ─── Module-level state (shared across the app; one call at a time) ─── */
const state = {
  callActive: false,
  callDocId: null,
  roomId: null,
  localStream: null,
  peerConnections: {},   // { [peerUid]: RTCPeerConnection }
  remoteStreams: {},      // { [peerUid]: MediaStream }
  peerMediaState: {},    // { [peerUid]: { audio, video } }
  screenStream: null,     // the screen-share MediaStream (for cleanup)
  unsubParticipants: null,
  unsubIce: null,
  iceListeners: new Set(), // peerUids we already listen ICE for
};

/* ───────────────────────────── helpers ───────────────────────────── */

function myUid() {
  return auth.currentUser?.uid;
}

function getCallDocRef(roomId, callId) {
  return doc(db, "rooms", roomId, "calls", callId);
}

function getParticipantsRef(roomId, callId) {
  return collection(db, "rooms", roomId, "calls", callId, "participants");
}

function getIceRef(roomId, callId, peerUid) {
  return doc(
    db,
    "rooms",
    roomId,
    "calls",
    callId,
    "iceCandidates",
    `${peerUid}_${Date.now()}`
  );
}

/* ───────────────────── media helpers ───────────────────── */

function getAudioTrack(stream) {
  return stream?.getAudioTracks?.()[0] || null;
}

function getVideoTrack(stream) {
  return stream?.getVideoTracks?.()[0] || null;
}

function toggleMic(stream) {
  const track = getAudioTrack(stream);
  if (!track) return false;
  track.enabled = !track.enabled;
  return track.enabled;
}

function _toggleCameraTrack(stream) {
  const track = getVideoTrack(stream);
  if (!track) return false;
  track.enabled = !track.enabled;
  return track.enabled;
}

/* ───────────────────── media state persistence ───────────────────── */

async function updateMediaState(roomId, callId, uid, mediaState) {
  try {
    const ref = doc(getParticipantsRef(roomId, callId), uid);
    await setDoc(ref, { mediaState }, { merge: true });
  } catch (err) {
    console.error("Error updating media state:", err);
  }
}

/* ───────────────────── peer connection factory ───────────────────── */

function createPeerConnection(peerUid, roomId, callId) {
  if (state.peerConnections[peerUid]) return state.peerConnections[peerUid];

  const pc = new RTCPeerConnection(ICE_SERVERS);
  state.peerConnections[peerUid] = pc;

  // Attach local tracks
  if (state.localStream) {
    state.localStream.getTracks().forEach((track) => {
      pc.addTrack(track, state.localStream);
    });
  }

  // Receive remote tracks — fires on initial track AND on renegotiation
  pc.ontrack = (event) => {
    // Prefer the stream from the event; fall back to the transceiver's
    // receiver track (some browsers don't re-fire ontrack for replaceTrack).
    const stream = event.streams?.[0];
    if (stream) {
      state.remoteStreams[peerUid] = stream;
    } else if (event.track) {
      // Build a stream from the receiver track so the UI always gets an update
      let existing = state.remoteStreams[peerUid];
      if (!existing) {
        existing = new MediaStream();
        state.remoteStreams[peerUid] = existing;
      }
      // Avoid duplicate tracks
      if (!existing.getTracks().some((t) => t.id === event.track.id)) {
        existing.addTrack(event.track);
      }
    }
    if (typeof state._onRemoteStreamsChange === "function") {
      state._onRemoteStreamsChange({ ...state.remoteStreams });
    }
  };

  // ICE candidate exchange — write to Firestore
  pc.onicecandidate = async (event) => {
    if (!event.candidate || !state.callActive) return;
    try {
      await setDoc(getIceRef(roomId, callId, peerUid), {
        candidate: event.candidate.toJSON(),
        from: myUid(),
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.error("Error sending ICE candidate:", err);
    }
  };

  // Cleanup on connection failure
  pc.onconnectionstatechange = () => {
    if (["failed", "closed"].includes(pc.connectionState)) {
      console.warn(`Peer ${peerUid} connection state: ${pc.connectionState}`);
      removePeer(pc, peerUid);
      emit("peer-disconnected", { peerUid });
    }
  };

  return pc;
}

function removePeer(pc, peerUid) {
  try { pc.close(); } catch (_) {}
  delete state.peerConnections[peerUid];
  delete state.remoteStreams[peerUid];
  delete state.peerMediaState[peerUid];
  if (typeof state._onRemoteStreamsChange === "function") {
    state._onRemoteStreamsChange({ ...state.remoteStreams });
  }
}

/* ───────────────────── signaling helpers ───────────────────── */

async function sendOffer(pc, peerUid, roomId, callId) {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  // Write to OUR document so the peer's listener picks it up
  // (the listener skips own-doc changes, so writing to peer's doc never worked)
  const ref = doc(getParticipantsRef(roomId, callId), myUid());
  await setDoc(ref, {
    [`offers.${peerUid}`]: { sdp: offer.sdp, type: offer.type },
  }, { merge: true });
}

async function sendAnswer(pc, peerUid, roomId, callId) {
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  const selfRef = doc(getParticipantsRef(roomId, callId), myUid());
  await setDoc(selfRef, {
    answer: { sdp: answer.sdp, type: answer.type },
  }, { merge: true });
}

/* ─── ICE candidate listener (idempotent per peerUid) ─── */

function listenForIce(roomId, callId, peerUid) {
  const key = `${callId}:${peerUid}`;
  if (state.iceListeners.has(key)) return;
  state.iceListeners.add(key);

  const iceCollectionRef = collection(db, "rooms", roomId, "calls", callId, "iceCandidates");
  onSnapshot(iceCollectionRef, async (snap) => {
    for (const change of snap.docChanges()) {
      if (change.type !== "added") continue;
      const data = change.doc.data();
      if (data.from === myUid()) continue;
      if (!change.doc.id.startsWith(peerUid)) continue;

      const pc = state.peerConnections[peerUid];
      if (!pc) continue;

      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (err) {
        console.error("Error adding ICE candidate:", err);
      }
    }
  });
}

/* ─── Participant snapshot listener — handles all signaling ─── */

function setupParticipantListener(roomId, callId, isCaller) {
  state.unsubParticipants = onSnapshot(
    getParticipantsRef(roomId, callId),
    async (snap) => {
      const currentUid = myUid();

      for (const change of snap.docChanges()) {
        const peerUid = change.doc.id;
        const data = change.doc.data();

        /* ── REMOVED: peer left the call ── */
        if (change.type === "removed") {
          // Close their peer connection if it exists
          if (state.peerConnections[peerUid]) {
            removePeer(state.peerConnections[peerUid], peerUid);
            emit("peer-left", {
              peerUid,
              displayName: data.displayName || "Unknown",
            });
          }

          // If no participants remain (or only us), leave the call
          const remaining = snap.docs.filter((d) => d.id !== currentUid);
          if (remaining.length === 0) {
            emit("call-ended", { reason: "All participants left" });
            await leaveCall();
          }
          continue;
        }

        // Ignore our own document changes
        if (peerUid === currentUid) continue;

        // Track remote media state
        if (data.mediaState) {
          state.peerMediaState[peerUid] = data.mediaState;
        }

        /* ── OFFER received from a peer (stored as offers.{ourUid} in their doc) ── */
        if (data.offers && data.offers[currentUid]) {
          const offer = data.offers[currentUid];
          let pc = state.peerConnections[peerUid];
          if (!pc) {
            // New peer — create connection and answer
            pc = createPeerConnection(peerUid, roomId, callId);
            await pc.setRemoteDescription(
              new RTCSessionDescription(offer)
            );
            await sendAnswer(pc, peerUid, roomId, callId);
            emit("peer-joined", {
              peerUid,
              displayName: data.displayName || "Unknown",
            });
          } else if (pc.signalingState === "stable") {
            // Renegotiation — peer sent a new offer (e.g. screen share)
            // After initial connection both peers are in "stable", not "have-remote-offer"
            await pc.setRemoteDescription(
              new RTCSessionDescription(offer)
            );
            await sendAnswer(pc, peerUid, roomId, callId);
          }

          // Read any ICE candidates the peer already stored
          await readExistingIceCandidates(roomId, callId, peerUid);
          // Listen for future ICE candidates
          listenForIce(roomId, callId, peerUid);
        }

        /* ── ANSWER received to our offer ── */
        if (data.answer && state.peerConnections[peerUid]) {
          const pc = state.peerConnections[peerUid];
          if (pc.signalingState === "have-local-offer") {
            await pc.setRemoteDescription(
              new RTCSessionDescription(data.answer)
            );
          }
          // Listen for their ICE candidates
          listenForIce(roomId, callId, peerUid);
        }
      }
    }
  );
}

/* ─── Read ICE candidates that a peer stored before we subscribed ─── */

async function readExistingIceCandidates(roomId, callId, peerUid) {
  try {
    const iceCollectionRef = collection(db, "rooms", roomId, "calls", callId, "iceCandidates");
    const snap = await getDocs(iceCollectionRef);
    const pc = state.peerConnections[peerUid];
    if (!pc) return;

    for (const iceDoc of snap.docs) {
      const data = iceDoc.data();
      if (data.from === myUid()) continue;
      if (!iceDoc.id.startsWith(peerUid)) continue;

      try {
        await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
      } catch (_) {}
    }
  } catch (err) {
    console.error("Error reading existing ICE candidates:", err);
  }
}

/* ─── Public API ───────────────────── */

/**
 * Start or join a call in the given room.
 *
 * @param {string} roomId
 * @param {function} onRemoteStreams  — callback({ [uid]: MediaStream })
 * @param {{ audio?: boolean, video?: boolean }} initialMedia
 * @returns {Promise<{ callId: string }>}
 */
async function joinCall(roomId, onRemoteStreams, initialMedia = { audio: true, video: true }) {
  if (state.callActive) return { callId: state.callDocId };

  state.roomId = roomId;
  state._onRemoteStreamsChange = onRemoteStreams;
  state.iceListeners.clear();

  // 1. Get user media
  try {
    state.localStream = await navigator.mediaDevices.getUserMedia({
      audio: initialMedia.audio !== false,
      video: initialMedia.video !== false,
    });
  } catch (err) {
    console.error("Failed to get user media:", err);
    let msg = "Could not access camera or microphone.";
    if (err.name === "NotAllowedError") {
      msg = "Camera/microphone permission denied. Please allow access in your browser settings and try again.";
    } else if (err.name === "NotFoundError") {
      msg = "No camera or microphone found. Please connect a device and try again.";
    } else if (err.name === "NotReadableError") {
      msg = "Camera or microphone is already in use by another application.";
    }
    throw new Error(msg);
  }

  // Verify we got at least one track
  if (state.localStream.getTracks().length === 0) {
    throw new Error("No media tracks returned. Please check your camera and microphone settings.");
  }

  state.callActive = true;

  // 2. Check for an existing call to join
  const callsRef = collection(db, "rooms", roomId, "calls");
  const existing = await getDocs(callsRef);

  if (!existing.empty) {
    // ── Join existing call ──
    const callDoc = existing.docs[0];
    state.callDocId = callDoc.id;
    const currentUid = myUid();

    // Check for stale call (no other active participants after a reload)
    const participantsSnap = await getDocs(getParticipantsRef(roomId, callDoc.id));
    const otherParticipants = participantsSnap.docs.filter((d) => d.id !== currentUid);

    if (otherParticipants.length === 0) {
      // Stale call — clean up and create a new one
      try { await deleteDoc(getCallDocRef(roomId, callDoc.id)); } catch (_) {}
      state.callDocId = null;
    } else {
      // Create PC to every existing participant and send an offer
      for (const pDoc of otherParticipants) {
        const peerUid = pDoc.id;
        const pc = createPeerConnection(peerUid, roomId, callDoc.id);

        if (pc.signalingState === "stable") {
          await sendOffer(pc, peerUid, roomId, callDoc.id);
        }

        // If they already have an answer, apply it
        const pData = pDoc.data();
        if (pData.answer && pc.signalingState === "have-local-offer") {
          await pc.setRemoteDescription(new RTCSessionDescription(pData.answer));
        }

        // Read any ICE candidates they already stored
        await readExistingIceCandidates(roomId, callDoc.id, peerUid);
        // Listen for future ICE candidates
        listenForIce(roomId, callDoc.id, peerUid);
      }

      // Register self
      await setDoc(
        doc(getParticipantsRef(roomId, callDoc.id), currentUid),
        {
          uid: currentUid,
          displayName: auth.currentUser.displayName || "Anonymous",
          photoURL: auth.currentUser.photoURL || null,
          mediaState: {
            audio: !!getAudioTrack(state.localStream)?.enabled,
            video: !!getVideoTrack(state.localStream)?.enabled,
          },
          joinedAt: serverTimestamp(),
        }
      );

      // Listen for new participants, answers, track changes, removals
      setupParticipantListener(roomId, callDoc.id, false);
    }
  }

  // If no existing call (or stale call was cleaned up), create a new one
  if (!state.callDocId) {
    // ── Create a new call ──
    const callDocRef = doc(callsRef);
    await setDoc(callDocRef, {
      createdBy: myUid(),
      createdAt: serverTimestamp(),
    });
    state.callDocId = callDocRef.id;

    // Register self
    await setDoc(
      doc(getParticipantsRef(roomId, callDocRef.id), myUid()),
      {
        uid: myUid(),
        displayName: auth.currentUser.displayName || "Anonymous",
        photoURL: auth.currentUser.photoURL || null,
        mediaState: {
          audio: !!getAudioTrack(state.localStream)?.enabled,
          video: !!getVideoTrack(state.localStream)?.enabled,
        },
        joinedAt: serverTimestamp(),
      }
    );

    // Listen for incoming participants, answers, track changes, removals
    setupParticipantListener(roomId, callDocRef.id, true);
  }

  return { callId: state.callDocId };
}

/* ─── Media controls ─── */

function toggleMicrophone() {
  const enabled = toggleMic(state.localStream);
  if (state.callActive && state.roomId && state.callDocId) {
    updateMediaState(state.roomId, state.callDocId, myUid(), {
      audio: enabled,
      video: !!getVideoTrack(state.localStream)?.enabled,
    });
  }
  return enabled;
}

function toggleCamera() {
  const enabled = _toggleCameraTrack(state.localStream);
  if (state.callActive && state.roomId && state.callDocId) {
    updateMediaState(state.roomId, state.callDocId, myUid(), {
      audio: !!getAudioTrack(state.localStream)?.enabled,
      video: enabled,
    });
  }
  return enabled;
}

/* ─── Screen share ─── */

async function startScreenShare(roomId, callId) {
  // Check browser support
  if (!navigator.mediaDevices?.getDisplayMedia) {
    throw new Error("Screen sharing is not supported in this browser.");
  }

  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: { cursor: "always" },
      audio: false,
    });
    const screenTrack = screenStream.getVideoTracks()[0];
    if (!screenTrack) {
      throw new Error("No video track returned from screen share.");
    }
    state.screenStream = screenStream;

    // Replace video track in every peer connection
    for (const [peerUid, pc] of Object.entries(state.peerConnections)) {
      const sender = pc
        .getSenders()
        .find((s) => s.track?.kind === "video");
      if (sender) {
        await sender.replaceTrack(screenTrack);
      }
    }

    // Force renegotiation so remote peers receive the new track via ontrack
    for (const [peerUid, pc] of Object.entries(state.peerConnections)) {
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        // Write renegotiation offer to OUR doc under offers.{peerUid}
        const ref = doc(getParticipantsRef(roomId, callId), myUid());
        await setDoc(ref, {
          [`offers.${peerUid}`]: { sdp: offer.sdp, type: offer.type },
        }, { merge: true });
      } catch (err) {
        console.error("Error renegotiating after screen share start:", err);
      }
    }

    // Detect when the user stops sharing via the browser's native stop button
    screenTrack.onended = () => {
      stopScreenShare(state.roomId, state.callDocId);
    };

    return screenStream;
  } catch (err) {
    console.error("Screen share failed:", err);
    throw err;
  }
}

async function stopScreenShare(roomId, callId) {
  const cameraTrack = getVideoTrack(state.localStream);

  // Stop screen share tracks (guard against double-stop from browser native button + app button)
  if (state.screenStream) {
    state.screenStream.getTracks().forEach((t) => {
      if (t.readyState === "live") t.stop();
    });
    state.screenStream = null;
  }

  // Replace video track back to camera in every peer connection
  for (const [peerUid, pc] of Object.entries(state.peerConnections)) {
    const sender = pc
      .getSenders()
      .find((s) => s.track?.kind === "video");
    if (sender && cameraTrack) {
      await sender.replaceTrack(cameraTrack);
    }
  }

  // Force renegotiation so remote peers get the camera track back
  for (const [peerUid, pc] of Object.entries(state.peerConnections)) {
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      const ref = doc(getParticipantsRef(roomId, callId), myUid());
      await setDoc(ref, {
        [`offers.${peerUid}`]: { sdp: offer.sdp, type: offer.type },
      }, { merge: true });
    } catch (err) {
      console.error("Error renegotiating after screen share stop:", err);
    }
  }
}

/* ─── Leave call ─── */

async function leaveCall() {
  if (!state.callActive) return;

  const { roomId, callDocId } = state;
  const uid = myUid();

  // Prevent re-entrance
  state.callActive = false;

  // Unsubscribe from Firestore listeners
  try { state.unsubParticipants?.(); } catch (_) {}
  try { state.unsubIce?.(); } catch (_) {}
  state.unsubParticipants = null;
  state.unsubIce = null;
  state.iceListeners.clear();

  // Close all peer connections
  for (const [peerUid, pc] of Object.entries(state.peerConnections)) {
    removePeer(pc, peerUid);
  }

  // Stop screen share tracks
  if (state.screenStream) {
    state.screenStream.getTracks().forEach((t) => t.stop());
    state.screenStream = null;
  }

  // Stop local media tracks
  if (state.localStream) {
    state.localStream.getTracks().forEach((track) => {
      if (track.readyState === "live") track.stop();
    });
  }

  // Remove self from Firestore participants
  if (roomId && callDocId && uid) {
    try {
      await deleteDoc(
        doc(db, "rooms", roomId, "calls", callDocId, "participants", uid)
      );
    } catch (_) {}

    // If no participants remain, delete the call doc
    try {
      const remaining = await getDocs(
        getParticipantsRef(roomId, callDocId)
      );
      if (remaining.empty) {
        await deleteDoc(getCallDocRef(roomId, callDocId));
      }
    } catch (_) {}
  }

  // Reset state
  state.callDocId = null;
  state.roomId = null;
  state.localStream = null;
  state.peerConnections = {};
  state.remoteStreams = {};
  state.peerMediaState = {};
  state._onRemoteStreamsChange = null;
}

/* ─── Accessors ─── */

function getLocalStream() {
  return state.localStream;
}

function getRemoteStreams() {
  return state.remoteStreams;
}

function getCallState() {
  return {
    callActive: state.callActive,
    callDocId: state.callDocId,
    roomId: state.roomId,
  };
}

function getScreenStream() {
  return state.screenStream;
}

/* ─── Export everything ─── */

export {
  joinCall,
  leaveCall,
  toggleMicrophone,
  toggleCamera,
  startScreenShare,
  stopScreenShare,
  getLocalStream,
  getRemoteStreams,
  getCallState,
  getScreenStream,
  onCallEvent,
};
