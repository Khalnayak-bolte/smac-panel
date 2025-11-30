// src/pages/ProtectedRoute.jsx
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function ProtectedRoute({ children, allowedRoles }) {
  const [loading, setLoading] = useState(true);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFirebaseUser(null);
        setRole(null);
        setLoading(false);
        return;
      }

      setFirebaseUser(user);

      try {
        const snap = await getDoc(doc(db, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          setRole(data.role || "user");
        } else {
          setRole("user");
        }
      } catch (err) {
        console.error("Error fetching user role in ProtectedRoute:", err);
        setRole(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Still loading auth/role
  if (loading) {
    return (
      <div className="text-slate-200 text-sm px-4 py-2">
        Checking permissions...
      </div>
    );
  }

  // Not logged in at all → go to login
  if (!firebaseUser) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but role not allowed
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(role)) {
    // Send them to their own dashboard instead of kicking to login
    if (role === "admin") return <Navigate to="/admin" replace />;
    if (role === "doctor") return <Navigate to="/doctor" replace />;
    return <Navigate to="/user" replace />;
  }

  // All good
  return children;
}
