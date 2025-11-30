// backend/routes/otpRoutes.js
const express = require("express");
const router = express.Router();

const transporter = require("../config/email");
const generateOtp = require("../utils/generateOtp");
const { setOtp, verifyOtp } = require("../otpStore");

// POST /api/otp/send
router.post("/send", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const otp = generateOtp(6);
    setOtp(email, otp); // store OTP in memory

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your SMAC Email OTP",
      text: `Your OTP is: ${otp}\n\nIt is valid for 5 minutes.`,
    };

    await transporter.sendMail(mailOptions);

    return res.json({ message: "OTP sent to email successfully" });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return res
      .status(500)
      .json({ message: "Failed to send OTP email", error: error.message });
  }
});

// POST /api/otp/verify
router.post("/verify", (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const isValid = verifyOtp(email, otp);

    if (!isValid) {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    return res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res
      .status(500)
      .json({ message: "Failed to verify OTP", error: error.message });
  }
});

module.exports = router;
