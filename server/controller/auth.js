import mongoose from "mongoose";
import User from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import useragent from "express-useragent";
import requestIp from "request-ip";

// --- 1. SIGNUP ---
export const Signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(404).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      friends: [],
      points: 0,
      subscriptionPlan: 'Free',
      loginHistory: []
    });

    const token = jwt.sign(
      { email: newUser.email, id: newUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({ data: newUser, token });
  } catch (error) {
    console.log(error); 
    res.status(500).json({ message: "Something went wrong..." });
  }
};

// --- 2. LOGIN ---
export const Login = async (req, res) => {
  const { email, password } = req.body;
  
  const clientIp = requestIp.getClientIp(req);
  const ua = useragent.parse(req.headers['user-agent']);
  const isMobile = ua.isMobile;

  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // Rule: Restrict Mobile Access (10 AM - 1 PM)
    if (isMobile) {
      const currentHour = new Date().getHours(); 
      if (currentHour < 10 || currentHour >= 13) {
        return res.status(403).json({ 
          message: "Mobile access is restricted. Please log in between 10 AM and 1 PM." 
        });
      }
    }

    const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
    if (!isPasswordCorrect) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Track Login
    if (!existingUser.loginHistory) existingUser.loginHistory = [];
    existingUser.loginHistory.push({
      ip: clientIp,
      browser: ua.browser,
      os: ua.os,
      deviceType: isMobile ? "Mobile" : "Desktop",
      loginTime: new Date()
    });
    await existingUser.save();

    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({ data: existingUser, token });
  } catch (error) {
    console.log(error); 
    res.status(500).json({ message: "Something went wrong..." });
  }
};

// --- 3. GET ALL USERS ---
export const getallusers = async (req, res) => {
  try {
    const allUsers = await User.find();
    res.status(200).json({ data: allUsers });
  } catch (error) {
    console.log(error); 
    res.status(500).json({ message: "Something went wrong..." });
  }
};

// --- 4. UPDATE PROFILE ---
export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { name, about, tags } = req.body.editForm;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(400).json({ message: "User unavailable" });
  }

  try {
    const updatedProfile = await User.findByIdAndUpdate(
      _id,
      { $set: { name: name, about: about, tags: tags } },
      { new: true }
    );
    res.status(200).json({ data: updatedProfile });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong..." });
  }
};

// --- 5. ADD FRIEND ---
export const addFriend = async (req, res) => {
  const { id: friendId } = req.params; 
  const userId = req.userId; 

  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    return res.status(404).json({ message: "User to friend not found" });
  }

  try {
    const user = await User.findById(userId);
    
    if (!user.friends.includes(friendId)) {
      await User.findByIdAndUpdate(userId, { $push: { friends: friendId } });
      await User.findByIdAndUpdate(friendId, { $push: { friends: userId } });
      res.status(200).json({ message: "Friend added successfully" });
    } else {
      res.status(400).json({ message: "You are already friends" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 6. FORGOT PASSWORD ---
export const ForgotPassword = async (req, res) => {
  const { identifier } = req.body; // Changed from email to identifier (Email OR Phone)
  
  try {
    // Search by Email OR Phone
    const existingUser = await User.findOne({
      $or: [{ email: identifier }, { phoneNumber: identifier }]
    });

    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const now = new Date();
    if (existingUser.lastPasswordResetRequest) {
      const lastRequest = new Date(existingUser.lastPasswordResetRequest);
      const isSameDay = 
        now.getDate() === lastRequest.getDate() &&
        now.getMonth() === lastRequest.getMonth() &&
        now.getFullYear() === lastRequest.getFullYear();

      if (isSameDay) {
        return res.status(429).json({ 
          message: "Warning: You can use Forgot Password only 1 time a day." 
        });
      }
    }

    // Generate Password (Letters Only)
    const generatePassword = (length) => {
      const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      let result = "";
      for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      return result;
    };

    const newRawPassword = generatePassword(10); 
    const hashedPassword = await bcrypt.hash(newRawPassword, 12);
    
    existingUser.password = hashedPassword;
    existingUser.lastPasswordResetRequest = now;
    await existingUser.save();

    console.log(`[PASSWORD RESET] New Password for ${existingUser.email}: ${newRawPassword}`);

    res.status(200).json({ 
      message: "Password reset successful. Check your email/phone.",
      tempPassword: newRawPassword 
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

// --- 7. TRANSFER POINTS ---
export const transferPoints = async (req, res) => {
  const { amount, receiverEmail } = req.body;
  const senderId = req.userId; 

  if (amount <= 0) return res.status(400).json({ message: "Amount must be positive" });

  try {
    const sender = await User.findById(senderId);
    const receiver = await User.findOne({ email: receiverEmail });

    if (!receiver) return res.status(404).json({ message: "Receiver not found" });
    if (sender.email === receiverEmail) return res.status(400).json({ message: "Cannot transfer to self" });
    if (sender.points <= 10) return res.status(403).json({ message: "You need >10 points to unlock transfers." });
    if (sender.points < amount) return res.status(400).json({ message: "Insufficient points" });

    sender.points -= parseInt(amount);
    receiver.points += parseInt(amount);

    await sender.save();
    await receiver.save();

    res.status(200).json({ message: `Transferred ${amount} points to ${receiver.name}` });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Transfer failed" });
  }
};

// --- 8. OTP GENERATION ---
const otpStore = {}; 

export const generateOTP = async (req, res) => {
  const { channel, contact } = req.body; 
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore[contact] = otp;

  console.log(`[${channel === 'email' ? 'EMAIL' : 'SMS'} OTP] Sending Code ${otp} to ${contact}`);
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