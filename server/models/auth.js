import mongoose from "mongoose";

const loginHistorySchema = mongoose.Schema({
  ip: { type: String },
  browser: { type: String },
  os: { type: String },
  deviceType: { type: String }, // "Mobile", "Desktop", "Tablet"
  loginTime: { type: Date, default: Date.now }
});

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  about: { type: String },
  tags: { type: [String] },
  joinedOn: { type: Date, default: Date.now },
  
  // Feature 1: Public Space
  friends: [{ type: String }],
  postsToday: { type: Number, default: 0 },
  lastPostDate: { type: String, default: null },

  // Feature 2: Password Reset
  lastPasswordResetRequest: { type: Date, default: null },

  // Feature 3: Subscriptions
  subscriptionPlan: { type: String, enum: ['Free', 'Bronze', 'Silver', 'Gold'], default: 'Free' },
  questionsPostedToday: { type: Number, default: 0 },
  lastQuestionDate: { type: String, default: null },

  // Feature 4: Rewards
  points: { type: Number, default: 0 },

  // Feature 6: Login Tracking
  loginHistory: [loginHistorySchema]
});

export default mongoose.model("User", userSchema);