"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";

const BYPASS_AUTH = process.env.NEXT_PUBLIC_BYPASS_AUTH === "true";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!BYPASS_AUTH && !loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (!BYPASS_AUTH && loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return BYPASS_AUTH || user ? children : null;
}
