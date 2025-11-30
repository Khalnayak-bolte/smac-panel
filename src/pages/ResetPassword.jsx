// src/pages/ResetPassword.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  verifyPasswordResetCode,
  confirmPasswordReset,
} from "firebase/auth";
import { auth } from "../firebase";

export default function ResetPassword() {
  const location = useLocation();
  const navigate = useNavigate();
  const [oobCode, setOobCode] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("verifying"); // "verifying" | "ready" | "done" | "error"
  const [error, setError] = useState("");

  // Get oobCode from URL and verify it with Firebase
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("oobCode");

    if (!code) {
      setStatus("error");
      setError("Invalid or missing reset code.");
      return;
    }

    setOobCode(code);

    // Verify the reset code (check it's valid and not expired)
    verifyPasswordResetCode(auth, code)
      .then((emailFromCode) => {
        setEmail(emailFromCode);
        setStatus("ready");
      })
      .catch((err) => {
        console.error(err);
        setStatus("error");
        setError("This reset link is invalid or has expired.");
      });
  }, [location.search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!newPassword || !confirmPassword) {
      setError("Please fill both password fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      // Confirm the password reset with Firebase
      await confirmPasswordReset(auth, oobCode, newPassword);
      setStatus("done");

      // Optional: redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error(err);
      setError("Failed to reset password. Please request a new reset link.");
    }
  };

  // UI for different statuses
  if (status === "verifying") {
    return (
      <div className="w-full max-w-md">
        <div className="bg-slate-900/70 border border-slate-700/70 rounded-2xl shadow-xl p-8 text-center text-slate-100">
          <p>Verifying reset link...</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="w-full max-w-md">
        <div className="bg-slate-900/70 border border-slate-700/70 rounded-2xl shadow-xl p-8 text-center text-slate-100">
          <p className="mb-4 text-red-400 text-sm">{error}</p>
          <Link
            to="/login"
            className="text-sky-400 hover:text-sky-300 underline underline-offset-4 text-sm"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  if (status === "done") {
    return (
      <div className="w-full max-w-md">
        <div className="bg-slate-900/70 border border-slate-700/70 rounded-2xl shadow-xl p-8 text-center text-slate-100">
          <p className="mb-4 text-emerald-300 text-sm">
            Password reset successfully! Redirecting to login...
          </p>
          <Link
            to="/login"
            className="text-sky-400 hover:text-sky-300 underline underline-offset-4 text-sm"
          >
            Go to login now
          </Link>
        </div>
      </div>
    );
  }

  // status === "ready"
  return (
    <div className="w-full max-w-md">
      <div className="bg-slate-900/70 border border-slate-700/70 rounded-2xl shadow-xl p-8 text-slate-100">
        <h1 className="text-2xl font-semibold mb-2">Reset Password</h1>
        <p className="text-sm text-slate-400 mb-4">
          Resetting password for <span className="font-medium">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-slate-200 mb-1.5"
            >
              New password
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              placeholder="Enter new password"
              required
            />
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-slate-200 mb-1.5"
            >
              Confirm password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              placeholder="Re-enter new password"
              required
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-900/40 hover:brightness-110 active:scale-[0.98] transition"
          >
            Reset password
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Remembered your password?{" "}
          <Link
            to="/login"
            className="text-sky-400 hover:text-sky-300 underline underline-offset-4"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
}
