import mongoose from "mongoose";

const loginHistorySchema = mongoose.Schema({
  ip: { type: String },
  browser: { type: String },
  os: { type: String },
  deviceType: { type: String }, 
  loginTime: { type: Date, default: Date.now }
});

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  
  // ✅ ADDED PHONE NUMBER FIELD
  phoneNumber: { type: String, default: "" }, 
  
  about: { type: String },
  tags: { type: [String] },
  joinedOn: { type: Date, default: Date.now },
  
  friends: [{ type: String }],
  postsToday: { type: Number, default: 0 },
  lastPostDate: { type: String, default: null },

  lastPasswordResetRequest: { type: Date, default: null },
  loginHistory: [loginHistorySchema],

  subscriptionPlan: { 
    type: String, 
    enum: ['Free', 'Bronze', 'Silver', 'Gold'], 
    default: 'Free' 
  },
  questionsPostedToday: { type: Number, default: 0 },
  lastQuestionDate: { type: String, default: null },

  points: { type: Number, default: 0 },
});

export default mongoose.model("User", userSchema);