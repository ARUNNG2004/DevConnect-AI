"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { auth, db, googleProvider, githubProvider } from "../lib/firebase";
import { identifyUser } from "../lib/posthog/helpers";
import posthog from "posthog-js";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

// Errors that are expected and don't need to surface to the user
const SILENT_ERRORS = new Set([
  "auth/cancelled-popup-request",  // user opened popup twice — Firebase auto-cancels the first
  "auth/popup-closed-by-user",     // user closed the popup themselves
]);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const saveUserToFirestore = async (userResult) => {
    if (!userResult) return;
    const userRef = doc(db, "users", userResult.uid);
    await setDoc(
      userRef,
      {
        uid: userResult.uid,
        email: userResult.email,
        displayName: userResult.displayName,
        photoURL: userResult.photoURL,
        createdAt: serverTimestamp(),
        isOnline: true,
        lastSeen: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      await saveUserToFirestore(result.user);
      return result.user;
    } catch (error) {
      if (SILENT_ERRORS.has(error.code)) return null; // not a real error, ignore silently
      console.error("Google login error:", error);
      throw error;
    }
  };

  const loginWithGithub = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      await saveUserToFirestore(result.user);
      return result.user;
    } catch (error) {
      if (SILENT_ERRORS.has(error.code)) return null;
      console.error("GitHub login error:", error);
      throw error;
    }
  };

  const signupWithEmail = async (email, password, displayName) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName?.trim()) {
        await updateProfile(result.user, { displayName: displayName.trim() });
      }
      await saveUserToFirestore(result.user);
      return result.user;
    } catch (error) {
      throw error;
    }
  };

  const loginWithEmail = async (email, password) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await saveUserToFirestore(result.user);
      return result.user;
    } catch (error) {
      console.error("Email login error:", error);
      throw error;
    }
  };

  const logout = async () => {
  try {
    if (user) {
      await setDoc(
        doc(db, "users", user.uid),
        {
          isOnline: false,
          lastSeen: serverTimestamp(),
        },
        { merge: true }
      );
    }
    await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
};

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Password reset error:", error);
      throw error;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        identifyUser(currentUser.uid, {
          email: currentUser.email,
          displayName: currentUser.displayName,
        });
      } else {
        posthog.reset();
      }
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loginWithGoogle, loginWithGithub, signupWithEmail, loginWithEmail, logout, resetPassword, loading }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};