import express from "express";
import {
  getallusers,
  Login,
  Signup,
  updateprofile,
  addFriend,
  ForgotPassword,
  transferPoints, // ✅ ADDED THIS
  generateOTP,    // ✅ ADDED THIS (for Multi-language)
  verifyOTP       // ✅ ADDED THIS (for Multi-language)
} from "../controller/auth.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// --- Authentication ---
router.post("/signup", Signup);
router.post("/login", Login);

// --- User Management ---
router.get("/getalluser", getallusers);
router.patch("/update/:id", auth, updateprofile);
router.patch("/friend/:id", auth, addFriend);

// --- Features ---
router.post("/forgot-password", ForgotPassword);
router.post("/transfer-points", auth, transferPoints); // Now this will work because it is imported

// --- OTP / Multi-language Security ---
router.post("/otp/generate", generateOTP);
router.post("/otp/verify", verifyOTP);

export default router;