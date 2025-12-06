import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  media: {
    type: { 
      type: String, 
      enum: ['image', 'video', 'text'], // ✅ Added 'text' as valid option
      default: 'text' 
    },
    url: { 
      type: String, 
      default: "" // ✅ Made optional (default empty string)
    }
  },
  likes: [{ type: String }], // Array of User IDs
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String },
    postedOn: { type: Date, default: Date.now }
  }],
  shares: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Post", postSchema);