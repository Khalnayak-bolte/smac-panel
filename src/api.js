// src/api.js
import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export const sendEmailOtp = (email) => {
  return axios.post(`${API_BASE_URL}/otp/send`, { email });
};

export const verifyEmailOtp = (email, otp) => {
  return axios.post(`${API_BASE_URL}/otp/verify`, { email, otp });
};
