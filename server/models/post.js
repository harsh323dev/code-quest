import mongoose from "mongoose";

const postSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  content: { type: String },
  media: {
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    url: { type: String, required: true }
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  shares: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  }],
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Post", postSchema);
