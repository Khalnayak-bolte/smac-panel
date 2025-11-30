// src/pages/Signup.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { sendEmailOtp, verifyEmailOtp } from "../api";

export default function Signup() {
  const navigate = useNavigate();

  // email signup state
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // OTP state (email-based)
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");

  const [loading, setLoading] = useState(false); // signup loading
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // ------- EMAIL HANDLERS -------

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendOtpClick = async () => {
    const { email } = formData;

    if (!email) {
      setOtpMessage("Please enter your email first.");
      return;
    }

    try {
      setOtpLoading(true);
      setOtpMessage("");
      setError("");
      setSuccess("");

      const res = await sendEmailOtp(email);
      setOtpSent(true);
      setOtpVerified(false);
      setOtpMessage(res.data?.message || "OTP sent to your email.");
    } catch (err) {
      console.error("Error sending email OTP:", err);
      setOtpMessage(
        err.response?.data?.message || "Failed to send OTP. Please try again."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtpClick = async () => {
    const { email } = formData;

    if (!email || !otp) {
      setOtpMessage("Please enter both your email and the OTP.");
      return;
    }

    try {
      setOtpLoading(true);
      setOtpMessage("");

      const res = await verifyEmailOtp(email, otp);
      setOtpVerified(true);
      setOtpMessage(res.data?.message || "OTP verified successfully.");
    } catch (err) {
      console.error("Error verifying email OTP:", err);
      setOtpVerified(false);
      setOtpMessage(
        err.response?.data?.message ||
          "Invalid or expired OTP. Please request a new one."
      );
    } finally {
      setOtpLoading(false);
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!otpVerified) {
      setError("Please verify your email with OTP before signing up.");
      return;
    }

    setLoading(true);

    try {
      const { email, password } = formData;

      // 1. Create user in Firebase Auth
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      // 2. Store role as "user" in Firestore
      await setDoc(doc(db, "users", cred.user.uid), {
        email,
        role: "user",
        createdAt: serverTimestamp(),
      });

      // 3. Send email verification (optional but good to keep)
      try {
        await sendEmailVerification(cred.user);
      } catch (verifyError) {
        console.warn("Failed to send verification email:", verifyError);
      }

      setSuccess(
        "Signup successful! You can now log in as a User. A verification email was also sent."
      );
      setFormData({ email: "", password: "" });
      setOtp("");
      setOtpSent(false);
      setOtpVerified(false);
      setOtpMessage("");

      // Redirect to login after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error(err);
      let msg = "Signup failed. Please try again.";

      if (err.code === "auth/email-already-in-use") {
        msg = "This email is already in use.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Please enter a valid email address.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password should be at least 6 characters.";
      }

      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-slate-900/70 border border-slate-700/70 rounded-2xl shadow-xl shadow-slate-900/60 backdrop-blur-md p-8">
        <div className="mb-6 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-indigo-500 mb-3">
            <span className="text-xl font-black text-white">S</span>
          </div>
          <h1 className="text-2xl font-semibold text-slate-50 tracking-wide">
            SMAC – User Signup
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create an account with email, secured by OTP verification.
          </p>
        </div>

        {/* Error / Success */}
        {error && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-900/60 rounded-lg px-3 py-2 mb-3">
            {error}
          </p>
        )}

        {success && (
          <p className="text-xs text-emerald-300 bg-emerald-950/40 border border-emerald-900/60 rounded-lg px-3 py-2 mb-3">
            {success}
          </p>
        )}

        {/* EMAIL SIGNUP FORM WITH EMAIL OTP */}
        <form onSubmit={handleEmailSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-200 mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              placeholder="you@example.com"
            />
          </div>

          {/* OTP controls */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleSendOtpClick}
              disabled={otpLoading || !formData.email}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-slate-800 px-4 py-2.5 text-xs font-semibold text-sky-300 shadow-md hover:bg-slate-700 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {otpLoading ? "Sending OTP..." : "Send OTP to Email"}
            </button>

            {otpSent && (
              <div>
                <label
                  htmlFor="otp"
                  className="block text-sm font-medium text-slate-200 mb-1.5"
                >
                  Enter OTP
                </label>
                <div className="flex gap-2">
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="flex-1 rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                    placeholder="6-digit OTP"
                  />
                  <button
                    type="button"
                    onClick={handleVerifyOtpClick}
                    disabled={otpLoading || !otp}
                    className="rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-sky-900/40 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {otpLoading ? "Verifying..." : "Verify"}
                  </button>
                </div>

                {otpMessage && (
                  <p className="mt-2 text-xs text-slate-300">{otpMessage}</p>
                )}
                {otpVerified && (
                  <p className="mt-1 text-xs text-emerald-300">
                    Email verified via OTP ✅
                  </p>
                )}
              </div>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-200 mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-900/40 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Signing up..." : "Sign up"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-sky-400 hover:text-sky-300 underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
