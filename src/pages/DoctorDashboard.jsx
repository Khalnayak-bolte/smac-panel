// src/pages/DoctorDashboard.jsx
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function DoctorDashboard() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("smacRole");
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-950 text-slate-50">
      <div className="max-w-xl w-full bg-slate-900/80 border border-slate-700 rounded-2xl p-8 shadow-xl">
        <h1 className="text-2xl font-semibold mb-2">Doctor Dashboard</h1>
        <p className="text-sm text-slate-400 mb-6">
          You are logged in as <span className="font-medium">Doctor</span>.
        </p>
        <button
          onClick={handleLogout}
          className="rounded-xl px-4 py-2 text-sm font-semibold bg-slate-800 hover:bg-slate-700 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
