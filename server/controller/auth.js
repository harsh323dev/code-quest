import mongoose from "mongoose";
import User from "../models/auth.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import useragent from "express-useragent";
import requestIp from "request-ip";

// --- 1. SIGNUP (Original) ---
export const Signup = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exisitinguser = await User.findOne({ email });
    if (exisitinguser) {
      return res.status(404).json({ message: "User already exist" });
    }
    const hashpassword = await bcrypt.hash(password, 12);
    const newuser = await User.create({
      name,
      email,
      password: hashpassword,
      // Initialize new fields
      friends: [],
      points: 0,
      subscriptionPlan: 'Free'
    });
    const token = jwt.sign(
      { email: newuser.email, id: newuser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ data: newuser, token });
  } catch (error) {
    console.log(error); 
    res.status(500).json({ message: "something went wrong.." });
  }
};

// --- 2. LOGIN (With Tracking & Time Restrictions) ---
export const Login = async (req, res) => {
  const { email, password } = req.body;
  
  // Get Device/IP Info
  const clientIp = requestIp.getClientIp(req);
  const source = req.headers['user-agent'];
  const ua = useragent.parse(source);
  
  const browser = ua.browser; 
  const os = ua.os;
  const isMobile = ua.isMobile;
  const deviceType = isMobile ? "Mobile" : "Desktop";

  try {
    const exisitinguser = await User.findOne({ email });
    if (!exisitinguser) {
      return res.status(404).json({ message: "User does not exist" });
    }

    // CHECK MOBILE TIME RESTRICTION (10 AM to 1 PM)
    if (isMobile) {
      const currentHour = new Date().getHours(); 
      if (currentHour < 10 || currentHour >= 13) {
        return res.status(403).json({ 
          message: "Mobile access is restricted. Please log in between 10 AM and 1 PM." 
        });
      }
    }

    const ispasswordcrct = await bcrypt.compare(password, exisitinguser.password);
    if (!ispasswordcrct) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Save Login History
    if (!exisitinguser.loginHistory) exisitinguser.loginHistory = [];
    exisitinguser.loginHistory.push({
      ip: clientIp,
      browser,
      os,
      deviceType,
      loginTime: new Date()
    });
    await exisitinguser.save();

    const token = jwt.sign(
      { email: exisitinguser.email, id: exisitinguser._id },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    res.status(200).json({ data: exisitinguser, token });
  } catch (error) {
    console.log(error); 
    res.status(500).json({ message: "something went wrong.." });
  }
};

// --- 3. GET ALL USERS ---
export const getallusers = async (req, res) => {
  try {
    const alluser = await User.find();
    res.status(200).json({ data: alluser });
  } catch (error) {
    console.log(error); 
    res.status(500).json({ message: "something went wrong.." });
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
    const updateprofile = await User.findByIdAndUpdate(
      _id,
      { $set: { name: name, about: about, tags: tags } },
      { new: true }
    );
    res.status(200).json({ data: updateprofile });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong.." });
  }
};

// --- 5. ADD FRIEND (Public Space) ---
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
  const { email } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check Rate Limit (1 time a day)
    const now = new Date();
    if (existingUser.lastPasswordResetRequest) {
      const lastRequest = new Date(existingUser.lastPasswordResetRequest);
      const isSameDay = 
        now.getDate() === lastRequest.getDate() &&
        now.getMonth() === lastRequest.getMonth() &&
        now.getFullYear() === lastRequest.getFullYear();

      if (isSameDay) {
        return res.status(429).json({ 
          message: "You can only request a password reset once per day." 
        });
      }
    }

    // Generate Random Password
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

    console.log(`[PASSWORD RESET] New Password for ${email}: ${newRawPassword}`);

    res.status(200).json({ 
      message: "Password reset successful. Check console/email.",
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

// --- 8. OTP GENERATION & VERIFICATION (Language Security) ---
const otpStore = {}; 

export const generateOTP = async (req, res) => {
  const { channel, contact } = req.body; 
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  otpStore[contact] = otp;

  if (channel === 'email') {
      console.log(`[EMAIL OTP] Sending Code ${otp} to ${contact}`);
  } else {
      console.log(`[SMS OTP] Sending Code ${otp} to Mobile ${contact}`);
  }
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