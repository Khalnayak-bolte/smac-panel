// backend/config/email.js
const { Resend } = require("resend");
const dotenv = require("dotenv");

dotenv.config();

// Create Resend client using API key from env
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send OTP email using Resend API
 * @param {string} to - recipient email
 * @param {string} otp - 6 digit OTP
 */
async function sendOtpEmail(to, otp) {
  if (!process.env.RESEND_API_KEY) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const response = await resend.emails.send({
    from: "SMAC <onboarding@resend.dev>", // default Resend sender
    to,
    subject: "Your SMAC Email OTP",
    text: `Your OTP is: ${otp}\n\nIt is valid for 5 minutes.`,
  });

  if (response.error) {
    throw new Error(response.error.message || "Failed to send email via Resend");
  }

  return response;
}

module.exports = {
  sendOtpEmail,
};
