import Questions from "../models/question.js";
import mongoose from "mongoose";
import User from "../models/auth.js"; 

// --- 1. ASK QUESTION (With Subscription Limits) ---
export const AskQuestion = async (req, res) => {
  const { postQuestionData } = req.body;
  const userId = req.userId;

  try {
    const user = await User.findById(userId);

    // A. RESET DAILY COUNTER IF NEW DAY
    const todayStr = new Date().toDateString();
    // If the last question wasn't posted today, reset the counter
    if (user.lastQuestionDate !== todayStr) {
      user.questionsPostedToday = 0;
      user.lastQuestionDate = todayStr;
      await user.save();
    }

    // B. SUBSCRIPTION LIMITS (Strict Requirement)
    const PLAN_LIMITS = { 
        'Free': 1, 
        'Bronze': 5, 
        'Silver': 10,  // ₹300 Plan
        'Gold': Infinity // ₹1000 Plan
    };
    
    const userPlan = user.subscriptionPlan || 'Free';
    const limit = PLAN_LIMITS[userPlan];

    // C. CHECK LIMIT
    if (user.questionsPostedToday >= limit) {
      return res.status(403).json({ 
        message: `Daily limit reached! You are on the ${userPlan} plan (Max: ${limit}). Upgrade to post more.` 
      });
    }

    // D. CREATE QUESTION
    const postQuestion = new Questions({ ...postQuestionData, userId });
    await postQuestion.save();

    // E. UPDATE USER STATS
    user.questionsPostedToday += 1;
    // We update the date again to be sure
    user.lastQuestionDate = new Date(); 
    await user.save();

    res.status(200).json({ message: "Posted a question successfully" });
  } catch (error) {
    console.log(error);
    res.status(409).json({ message: "Couldn't post a new question" });
  }
};

// --- 2. GET ALL QUESTIONS ---
export const getAllQuestions = async (req, res) => {
  try {
    const questionList = await Questions.find().sort({ askedOn: -1 });
    res.status(200).json(questionList);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// --- 3. DELETE QUESTION ---
export const deleteQuestion = async (req, res) => {
  const { id: _id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).json({ message: "Question unavailable..." });
  }

  try {
    await Questions.findByIdAndDelete(_id);
    res.status(200).json({ message: "Successfully deleted..." });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// --- 4. VOTE QUESTION ---
export const voteQuestion = async (req, res) => {
  const { id: _id } = req.params;
  const { value, userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).json({ message: "Question unavailable..." });
  }

  try {
    const question = await Questions.findById(_id);
    
    if (!question) {
        return res.status(404).json({ message: "Question not found" });
    }

    // Ensure arrays exist
    if (!question.upVote) question.upVote = [];
    if (!question.downVote) question.downVote = [];

    const upIndex = question.upVote.findIndex((id) => id === String(userId));
    const downIndex = question.downVote.findIndex((id) => id === String(userId));

    if (value === "upVote") {
      if (downIndex !== -1) {
        question.downVote = question.downVote.filter((id) => id !== String(userId));
      }
      if (upIndex === -1) {
        question.upVote.push(userId);
      } else {
        question.upVote = question.upVote.filter((id) => id !== String(userId));
      }
    } else if (value === "downVote") {
      if (upIndex !== -1) {
        question.upVote = question.upVote.filter((id) => id !== String(userId));
      }
      if (downIndex === -1) {
        question.downVote.push(userId);
      } else {
        question.downVote = question.downVote.filter((id) => id !== String(userId));
      }
    }
    
    await Questions.findByIdAndUpdate(_id, question);
    res.status(200).json({ message: "Voted successfully..." });
  } catch (error) {
    res.status(404).json({ message: "ID not found" });
  }
};