import mongoose from "mongoose";
import Questions from "../models/question.js";
import User from "../models/auth.js"; 

// --- Helper Function ---
const updateNoOfQuestions = async (_id, noOfAnswers) => {
  try {
    await Questions.findByIdAndUpdate(_id, {
      $set: { noOfAnswers: noOfAnswers },
    });
  } catch (error) {
    console.log(error);
  }
};

// --- 1. POST ANSWER (+5 Points Reward) ---
export const postAnswer = async (req, res) => {
  const { id: _id } = req.params;
  const { noOfAnswers, answerBody, userAnswered, userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).json({ message: "Question unavailable..." });
  }

  updateNoOfQuestions(_id, noOfAnswers);

  try {
    const updatedQuestion = await Questions.findByIdAndUpdate(_id, {
      $addToSet: { 
        answer: [{ 
          answerBody, 
          userAnswered, 
          userId,
          answeredOn: new Date(),
          upVote: [],
          downVote: [],
          rewardPaid: false
        }] 
      },
    });

    // --- REWARD LOGIC: ADD 5 POINTS FOR ANSWERING ---
    await User.findByIdAndUpdate(userId, { $inc: { points: 5 } });
    console.log(`✅ Answer posted: +5 points for user ${userId}`);

    res.status(200).json(updatedQuestion);
  } catch (error) {
    console.error("Post Answer Error:", error);
    res.status(400).json({ message: "Error in updating" });
  }
};

// --- 2. DELETE ANSWER (-5 Points Penalty) ---
export const deleteAnswer = async (req, res) => {
  const { id: _id } = req.params;
  const { answerId, noOfAnswers } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).json({ message: "Question unavailable..." });
  }
  if (!mongoose.Types.ObjectId.isValid(answerId)) {
    return res.status(404).json({ message: "Answer unavailable..." });
  }

  updateNoOfQuestions(_id, noOfAnswers);

  try {
    const question = await Questions.findById(_id);
    const answer = question.answer.find(a => a._id.toString() === answerId);
    
    await Questions.updateOne(
      { _id },
      { $pull: { answer: { _id: answerId } } }
    );

    // --- PENALTY LOGIC: DEDUCT 5 POINTS ---
    if (answer && answer.userId) {
        await User.findByIdAndUpdate(answer.userId, { $inc: { points: -5 } });
        console.log(`❌ Answer deleted: -5 points for user ${answer.userId}`);
    }

    res.status(200).json({ message: "Successfully deleted..." });
  } catch (error) {
    console.error("Delete Answer Error:", error);
    res.status(500).json({ message: error.message });
  }
};

// --- 3. VOTE ANSWER (Complete with All Logic) ---
export const voteAnswer = async (req, res) => {
    const { id: questionId } = req.params;
    const { answerId, value, userId } = req.body; 

    if (!mongoose.Types.ObjectId.isValid(questionId)) {
        return res.status(404).json({ message: "Invalid question ID" });
    }

    if (!mongoose.Types.ObjectId.isValid(answerId)) {
        return res.status(404).json({ message: "Invalid answer ID" });
    }

    try {
        const question = await Questions.findById(questionId);
        if (!question) return res.status(404).json({ message: "Question not found" });

        const answerIndex = question.answer.findIndex(a => a._id.toString() === answerId);
        if (answerIndex === -1) return res.status(404).json({ message: "Answer not found" });
        
        let answer = question.answer[answerIndex];

        // Initialize vote arrays and reward tracking
        if (!answer.upVote) answer.upVote = [];
        if (!answer.downVote) answer.downVote = [];
        if (typeof answer.rewardPaid === 'undefined') answer.rewardPaid = false; 

        // ✅ SAVE PREVIOUS COUNTS BEFORE MODIFYING
        const previousUpvotes = answer.upVote.length;
        const previousDownvotes = answer.downVote.length;

        // Toggling Logic
        const upIndex = answer.upVote.findIndex(id => id === userId);
        const downIndex = answer.downVote.findIndex(id => id === userId);
        
        if (value === 'upVote') {
            // Remove from downvote if exists
            if (downIndex !== -1) {
                answer.downVote.splice(downIndex, 1);
            }
            // Toggle upvote
            if (upIndex === -1) {
                answer.upVote.push(userId); // Add upvote
            } else {
                answer.upVote.splice(upIndex, 1); // Remove upvote
            }
        } else if (value === 'downVote') {
            // Remove from upvote if exists
            if (upIndex !== -1) {
                answer.upVote.splice(upIndex, 1);
            }
            // Toggle downvote
            if (downIndex === -1) {
                answer.downVote.push(userId); // Add downvote
            } else {
                answer.downVote.splice(downIndex, 1); // Remove downvote
            }
        }
        
        // ✅ GET NEW COUNTS AFTER MODIFICATION
        const currentUpvotes = answer.upVote.length;
        const currentDownvotes = answer.downVote.length;

        // --- REWARD LOGIC: 5 UPVOTE BONUS (+5 points, one-time) ---
        if (currentUpvotes >= 5 && !answer.rewardPaid) {
            await User.findByIdAndUpdate(answer.userId, { $inc: { points: 5 } });
            answer.rewardPaid = true;
            console.log(`🎉 5-upvote bonus awarded: +5 points for user ${answer.userId}`);
        }

        // --- DOWNVOTE PENALTY LOGIC ---
        if (currentDownvotes > previousDownvotes) {
            // Downvote was added: -1 point
            await User.findByIdAndUpdate(answer.userId, { $inc: { points: -1 } });
            console.log(`⬇️ Downvote penalty: -1 point for user ${answer.userId}`);
        } else if (currentDownvotes < previousDownvotes) {
            // Downvote was removed: +1 point back
            await User.findByIdAndUpdate(answer.userId, { $inc: { points: 1 } });
            console.log(`⬆️ Downvote removed: +1 point restored for user ${answer.userId}`);
        }

        // --- UPVOTE REMOVAL HANDLING (Remove 5-point bonus if upvotes drop below 5) ---
        if (currentUpvotes < 5 && answer.rewardPaid) {
            await User.findByIdAndUpdate(answer.userId, { $inc: { points: -5 } });
            answer.rewardPaid = false;
            console.log(`❌ 5-upvote bonus revoked: -5 points for user ${answer.userId}`);
        }
        
        // Update the document
        question.answer[answerIndex] = answer;
        await Questions.findByIdAndUpdate(questionId, question);

        res.status(200).json({ 
            message: "Vote processed successfully.",
            upvotes: currentUpvotes,
            downvotes: currentDownvotes
        });
    } catch (error) {
        console.error("Vote Answer Error:", error);
        res.status(500).json({ message: "Error processing vote." });
    }
};
