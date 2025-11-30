const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const otpRoutes = require("./routes/otpRoutes");

dotenv.config();

const app = express();

// ✅ ALLOWED ORIGINS (local + Firebase Hosting)
const allowedOrigins = [
  "http://localhost:5173",                // local Vite
  "https://panel-smac.web.app",           // Firebase Hosting (main)
  "https://panel-smac.firebaseapp.com",   // Firebase alternate domain
];

// ✅ FIXED CORS CONFIG
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, server-side, etc.)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS not allowed from this origin"));
      }
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json());

// ✅ OTP ROUTES
app.use("/api/otp", otpRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
