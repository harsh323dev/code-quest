import express from "express";
import {
  getallusers, Login, Signup, updateprofile, addFriend, ForgotPassword, transferPoints, 
  generateOTP, verifyOTP, 
  verifyLoginOTP // ✅ IMPORT THIS
} from "../controller/auth.js";
import auth from "../middleware/auth.js";

const router = express.Router();

router.post("/signup", Signup);
router.post("/login", Login);
router.post("/login/verify", verifyLoginOTP); // ✅ NEW ROUTE

router.get("/getalluser", getallusers);
router.patch("/update/:id", auth, updateprofile);
router.patch("/friend/:id", auth, addFriend);
router.post("/forgot-password", ForgotPassword);
router.post("/transfer-points", auth, transferPoints);
router.post("/otp/generate", generateOTP);
router.post("/otp/verify", verifyOTP);

export default router;  