import {
  addDoc,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db, auth } from "./firebase";

const createRoom = async ({ title, description, language, isPrivate, createdBy }) => {
  try {
    const roomRef = await addDoc(collection(db, "rooms"), {
      title,
      description,
      language,
      isPrivate,
      createdBy: {
        uid: auth.currentUser.uid,
        displayName: auth.currentUser.displayName,
        photoURL: auth.currentUser.photoURL,
      },
      members: [auth.currentUser.uid],
      code: "",
      noteContent: "",
      createdAt: serverTimestamp(),
      lastActivity: serverTimestamp(),
    });
    return roomRef.id;
  } catch (error) {
    console.error("Error creating room:", error);
    throw error;
  }
};

const getRoom = async (roomId) => {
  try {
    const docSnap = await getDoc(doc(db, "rooms", roomId));
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.log(`No room found for ID: ${roomId}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching room:", error);
    throw error;
  }
};

const joinRoom = async (roomId, user) => {
  // TODO: implement
};

const sendRoomMessage = async (roomId, message) => {
  // TODO: implement
};

const saveRoomNote = async (roomId, note) => {
  // TODO: implement
};

const updateRoomCode = async (roomId, code, language) => {
  // TODO: implement
};

const heartbeatPresence = async (roomId, user) => {
  if (!roomId || !user?.uid) return;
  try {
    const presenceRef = doc(db, "rooms", roomId, "presence", user.uid);
    await setDoc(presenceRef, {
      uid: user.uid,
      displayName: user.displayName || "Anonymous",
      lastSeen: serverTimestamp(),
    }, { merge: true });
  } catch (error) {
    console.error("Error heartbeat:", error);
  }
};

const deleteRoom = async (roomId) => {
  try {
    // Delete the room document
    await deleteDoc(doc(db, "rooms", roomId));
    // Optionally, you might want to delete subcollections (messages, notes, presence)
    // For simplicity, we are relying on Firestore's TTL or manual cleanup in production.
    // In a real app, you would delete subcollections in a batch or use Cloud Functions.
    return true;
  } catch (error) {
    console.error("Error deleting room:", error);
    throw error;
  }
};

export {
  createRoom,
  getRoom,
  joinRoom,
  sendRoomMessage,
  saveRoomNote,
  updateRoomCode,
  heartbeatPresence,
  deleteRoom,
};
