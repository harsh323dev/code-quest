import mongoose from "mongoose";
import User from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import useragent from "express-useragent";
import requestIp from "request-ip";

const otpStore = {}; // In-memory store for OTPs

// --- 1. SIGNUP ---
export const Signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(404).json({ message: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      name, email, password: hashedPassword,
      friends: [], points: 0, subscriptionPlan: 'Free', loginHistory: []
    });

    const token = jwt.sign({ email: newUser.email, id: newUser._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
    res.status(200).json({ data: newUser, token });
  } catch (error) {
    res.status(500).json({ message: "Something went wrong..." });
  }
};

// --- 2. LOGIN (Security & Tracking) ---
export const Login = async (req, res) => {
  const { email, password } = req.body;
  const ua = useragent.parse(req.headers['user-agent']);
  const isMobile = ua.isMobile;
  const browser = ua.browser;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) return res.status(404).json({ message: "User does not exist" });

    // 🔒 Mobile Time Restriction (10 AM - 1 PM)
    if (isMobile) {
      const currentHour = new Date().getHours(); 
      if (currentHour < 10 || currentHour >= 13) {
        return res.status(403).json({ message: "Mobile access restricted (10 AM - 1 PM only)." });
      }
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) return res.status(400).json({ message: "Invalid password" });

    // 🔒 Chrome/Security Policy Check
    if (browser === "Chrome" && !ua.isEdge) {
        const otp = Math.floor(1000 + Math.random() * 9000).toString();
        otpStore[email] = { otp, ip: requestIp.getClientIp(req), browser: browser, os: ua.os, deviceType: isMobile ? "Mobile" : "Desktop" };
        console.log(`[LOGIN OTP] Code ${otp} sent to ${email} (Browser: Chrome)`);
        
        // Return 202 status code to trigger OTP modal on frontend
        return res.status(202).json({ message: "OTP sent to email", requiresOTP: true, email: email });
    }

    // 📝 Default Login Success (Edge/Firefox/Others)
    existingUser.loginHistory.push({
      ip: requestIp.getClientIp(req), browser: browser, os: ua.os, deviceType: isMobile ? "Mobile" : "Desktop", loginTime: new Date()
    });
    await existingUser.save();

    const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
    res.status(200).json({ data: existingUser, token });

  } catch (error) {
    res.status(500).json({ message: "Something went wrong..." });
  }
};

// --- 3. VERIFY LOGIN OTP ---
export const verifyLoginOTP = async (req, res) => {
    const { email, otp } = req.body;
    const storedData = otpStore[email];

    if (!storedData || storedData.otp !== otp) {
        return res.status(400).json({ message: "Invalid OTP" });
    }
    
    try {
        const existingUser = await User.findOne({ email });
        existingUser.loginHistory.push({ ...storedData, loginTime: new Date() });
        await existingUser.save();

        delete otpStore[email];
        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, process.env.JWT_SECRET, { expiresIn: "24h" });
        res.status(200).json({ data: existingUser, token });
    } catch (error) {
        res.status(500).json({ message: "Error completing login" });
    }
};

// --- 4. FORGOT PASSWORD (1/Day Limit) ---
export const ForgotPassword = async (req, res) => {
  const { identifier } = req.body; 
  try {
    const user = await User.findOne({ $or: [{ email: identifier }, { phoneNumber: identifier }] });
    if (!user) return res.status(404).json({ message: "User not found" });

    const now = new Date();
    if (user.lastPasswordResetRequest) {
      const last = new Date(user.lastPasswordResetRequest);
      if (now.toDateString() === last.toDateString()) {
        return res.status(429).json({ message: "Warning: You can use Forgot Password only 1 time a day." });
      }
    }

    const newPass = Array(10).fill(null).map(() => String.fromCharCode(Math.floor(Math.random() * 26) + (Math.random() > 0.5 ? 65 : 97))).join('');
    user.password = await bcrypt.hash(newPass, 12);
    user.lastPasswordResetRequest = now;
    await user.save();

    console.log(`[PASSWORD RESET] New Password for ${user.email}: ${newPass}`);
    res.status(200).json({ message: "Reset successful. Check console/email.", tempPassword: newPass });
  } catch (error) {
    res.status(500).json({ message: "Error resetting password" });
  }
};

// --- 5. TRANSFER POINTS (Gamification) ---
export const transferPoints = async (req, res) => {
  const { amount, receiverEmail } = req.body;
  const senderId = req.userId; 

  if (amount <= 0) return res.status(400).json({ message: "Amount must be positive" });

  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findOne({ email: receiverEmail });

    if (!receiver) return res.status(404).json({ message: "Receiver not found" });
    if (sender.points <= 10) return res.status(403).json({ message: "Need >10 points to unlock transfers." });
    if (sender.points < amount) return res.status(400).json({ message: "Insufficient points." });

    sender.points -= parseInt(amount);
    receiver.points += parseInt(amount);

    await sender.save();
    await receiver.save();

    res.status(200).json({ message: `Transferred ${amount} points to ${receiver.name}` });
  } catch (error) {
    res.status(500).json({ message: "Transfer failed" });
  }
};

// --- 6. OTP GENERATION (Multi-language Security) ---
export const generateOTP = async (req, res) => {
  const { channel, contact } = req.body; 
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore[contact] = otp;
  console.log(`[${channel.toUpperCase()} OTP] Code: ${otp} for ${contact}`);
  res.status(200).json({ message: `OTP sent to ${channel}` });
};

export const verifyOTP = async (req, res) => {
  const { contact, otp } = req.body;
  if (otpStore[contact] === otp) {
      delete otpStore[contact]; 
      res.status(200).json({ message: "Verification Successful" });
  } else {
      res.status(400).json({ message: "Invalid OTP" });
  }
};

// --- Basic Controllers ---
export const getallusers = async (req, res) => { try { const users = await User.find(); res.status(200).json({ data: users }); } catch (e) { res.status(500).json({ message: e.message }); } };
export const updateprofile = async (req, res) => { const { id } = req.params; const { name, about, tags } = req.body.editForm; try { const updated = await User.findByIdAndUpdate(id, { name, about, tags }, { new: true }); res.status(200).json(updated); } catch (e) { res.status(500).json({ message: e.message }); } };
export const addFriend = async (req, res) => { const { id } = req.params; const userId = req.userId; try { await User.findByIdAndUpdate(userId, { $addToSet: { friends: id } }); await User.findByIdAndUpdate(id, { $addToSet: { friends: userId } }); res.status(200).json({ message: "Friend added" }); } catch (e) { res.status(500).json({ message: e.message }); } };