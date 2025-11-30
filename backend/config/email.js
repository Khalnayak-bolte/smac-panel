// backend/config/email.js
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// optional: verify transporter on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("Error with email transporter:", error.message);
  } else {
    console.log("Email transporter is ready to send messages");
  }
});

module.exports = transporter;
