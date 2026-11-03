"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getFirebaseServices } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";

export function FirebaseSessionSync() {
  const syncedRef = useRef(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const { auth } = getFirebaseServices();
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email && !syncedRef.current) {
        syncedRef.current = true;
        try {
          const res = await fetch("/api/auth/firebase-sync", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: fbUser.email,
              displayName: fbUser.displayName,
              photoURL: fbUser.photoURL,
              uid: fbUser.uid,
            }),
          });

          if (res.ok) {
            const data = await res.json();
            // If on login or register, automatically route to dashboard
            if (pathname === "/login" || pathname === "/register" || pathname === "/") {
              router.push(data.redirectPath || "/dashboard");
              router.refresh();
            }
          }
        } catch (e) {
          console.warn("Background Firebase session sync failed:", e);
        }
      }
    });

    return () => unsubscribe();
  }, [router, pathname]);

  return null;
}
