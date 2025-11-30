// backend/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const otpRoutes = require("./routes/otpRoutes");

dotenv.config();

const app = express();

// adjust origin if your Vite dev URL is different
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// routes
app.use("/api/otp", otpRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});
