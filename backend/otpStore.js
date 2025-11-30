// backend/otpStore.js

// In-memory store: { [email]: { otp, expiresAt } }
const otpData = new Map();

// store OTP for an email
function setOtp(email, otp, ttlMs = 5 * 60 * 1000) {
  const expiresAt = Date.now() + ttlMs;
  otpData.set(email, { otp, expiresAt });
}

// verify OTP
function verifyOtp(email, otp) {
  const record = otpData.get(email);
  if (!record) return false;

  const { otp: storedOtp, expiresAt } = record;

  // expired
  if (Date.now() > expiresAt) {
    otpData.delete(email);
    return false;
  }

  // match
  if (storedOtp === otp) {
    otpData.delete(email); // one-time use
    return true;
  }

  return false;
}

module.exports = {
  setOtp,
  verifyOtp,
};
