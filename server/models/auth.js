import mongoose from "mongoose";

const userschema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  about: { type: String },
  tags: { type: [String] },
  joinDate: { type: Date, default: Date.now },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  lastPostDate: { type: Date },
  postsToday: { type: Number, default: 0 }
});

// Reset posts count at midnight
userschema.methods.resetDailyPosts = async function() {
  const today = new Date();
  const lastPost = this.lastPostDate || new Date(0);
  
  if (lastPost.getDate() !== today.getDate()) {
    this.postsToday = 0;
    await this.save();
  }
};

// Get allowed posts per day based on friend count
userschema.methods.getAllowedPostsPerDay = function() {
  const friendCount = this.friends.length;
  if (friendCount === 0) return 0;
  if (friendCount >= 10) return Infinity;
  return friendCount >= 2 ? 2 : 1;
};

export default mongoose.model("user", userschema);
