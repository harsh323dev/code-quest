import mongoose from "mongoose";

const answerSchema = mongoose.Schema({
  answerBody: { type: String, required: true },
  userAnswered: { type: String, required: true },
  userId: { type: String, required: true },
  answeredOn: { type: Date, default: Date.now },
  upVote: { type: [String], default: [] },
  downVote: { type: [String], default: [] },
  rewardPaid: { type: Boolean, default: false }, // Track if 5-upvote bonus was given
});

export default mongoose.model("Answer", answerSchema);
