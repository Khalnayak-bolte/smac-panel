// src/pages/Login.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { sendEmailOtp, verifyEmailOtp } from "../api";

export default function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  // "credentials" = email+password step, "otp" = OTP step
  const [loginStage, setLoginStage] = useState("credentials");

  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setOtpMessage("");

    const { email, password } = formData;

    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }

    // STEP 1: Email + password
    if (loginStage === "credentials") {
      try {
        setLoading(true);

        const cred = await signInWithEmailAndPassword(auth, email, password);
        const user = cred.user;

        // Enforce Firebase email verification (link) – only once
        if (!user.emailVerified) {
          await signOut(auth);
          throw new Error(
            "Email not verified. Please check your inbox and verify your email before logging in."
          );
        }

        // Email verified → send OTP via backend
        await sendEmailOtp(email);
        setOtpSent(true);
        setLoginStage("otp");
        setSuccess(
          "OTP has been sent to your email. Please enter it to continue."
        );
        setOtpMessage("OTP sent to your email.");

        // IMPORTANT: we DO NOT signOut here.
        // User stays authenticated, we just gate access behind OTP.
      } catch (err) {
        console.error("Login (credentials) error:", err);
        let msg = err.message || "Login failed. Please try again.";

        if (
          err.code === "auth/invalid-credential" ||
          err.code === "auth/wrong-password"
        ) {
          msg = "Invalid email or password.";
        } else if (err.code === "auth/user-not-found") {
          msg = "No account found with this email.";
        }

        setError(msg);
      } finally {
        setLoading(false);
      }

      return;
    }

    // STEP 2: OTP verification
    if (loginStage === "otp") {
      if (!otp) {
        setError("Please enter the OTP sent to your email.");
        return;
      }

      try {
        setLoading(true);

        // Verify OTP with backend
        const res = await verifyEmailOtp(email, otp);
        setOtpVerified(true);
        setOtpMessage(res.data?.message || "OTP verified successfully.");

        // Now user is already signed-in from step 1
        const currentUser = auth.currentUser;
        if (!currentUser) {
          throw new Error(
            "Session expired. Please login again with your email and password."
          );
        }

        // Fetch role from Firestore
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        let role = "user";
        if (userDoc.exists()) {
          role = userDoc.data().role || "user";
        }

        console.log("OTP verified, currentUser:", currentUser);
        console.log("Redirecting with role:", role);

        setSuccess("Login successful!");

        // ✅ Redirect based on role – matches App.jsx routes
        if (role === "admin") {
          navigate("/admin");
        } else if (role === "doctor") {
          navigate("/doctor");
        } else {
          navigate("/user");
        }
      } catch (err) {
        console.error("Login (OTP) error:", err);
        setOtpVerified(false);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Invalid or expired OTP. Please try again."
        );
      } finally {
        setLoading(false);
      }
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
            SMAC – Login
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Secure login with email, password & OTP.
          </p>
        </div>

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

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
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
              disabled={loginStage === "otp"} // lock email once OTP stage starts
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition disabled:opacity-60"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}
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
              disabled={loginStage === "otp"}
              className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition disabled:opacity-60"
              placeholder="••••••••"
            />
          </div>

          {/* OTP Step */}
          {loginStage === "otp" && (
            <div>
              <label
                htmlFor="otp"
                className="block text-sm font-medium text-slate-200 mb-1.5"
              >
                OTP sent to your email
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full rounded-xl bg-slate-900 border border-slate-700 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition"
                placeholder="Enter 6-digit OTP"
              />
              {otpMessage && (
                <p className="mt-2 text-xs text-slate-300">{otpMessage}</p>
              )}
              {otpVerified && (
                <p className="mt-1 text-xs text-emerald-300">
                  OTP verified ✅
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 via-cyan-500 to-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-900/40 hover:brightness-110 active:scale-[0.98] transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading
              ? loginStage === "credentials"
                ? "Checking..."
                : "Verifying OTP..."
              : loginStage === "credentials"
              ? "Login"
              : "Verify OTP & Continue"}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            to="/signup"
            className="text-sky-400 hover:text-sky-300 underline underline-offset-4"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
