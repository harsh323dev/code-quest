import mongoose from "mongoose";
import Questions from "../models/question.js";
import User from "../models/auth.js"; // Import User model

export const postAnswer = async (req, res) => {
  const { id: _id } = req.params;
  const { noOfAnswers, answerBody, userAnswered, userId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("question unavailable...");
  }

  updateNoOfQuestions(_id, noOfAnswers);

  try {
    const updatedQuestion = await Questions.findByIdAndUpdate(_id, {
      $addToSet: { answer: [{ answerBody, userAnswered, userId }] },
    });

    // --- REWARD LOGIC: ADD 5 POINTS ---
    await User.findByIdAndUpdate(userId, { $inc: { points: 5 } });

    res.status(200).json(updatedQuestion);
  } catch (error) {
    res.status(400).json("error in updating");
  }
};

const updateNoOfQuestions = async (_id, noOfAnswers) => {
  try {
    await Questions.findByIdAndUpdate(_id, {
      $set: { noOfAnswers: noOfAnswers },
    });
  } catch (error) {
    console.log(error);
  }
};

export const deleteAnswer = async (req, res) => {
  const { id: _id } = req.params;
  const { answerId, noOfAnswers } = req.body;

  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(404).send("Question unavailable...");
  }
  if (!mongoose.Types.ObjectId.isValid(answerId)) {
    return res.status(404).send("Answer unavailable...");
  }

  updateNoOfQuestions(_id, noOfAnswers);

  try {
    // Find the question to get the userId of the answer author BEFORE deleting
    const question = await Questions.findById(_id);
    const answer = question.answer.find(a => a._id.toString() === answerId);
    
    // Delete the answer
    await Questions.updateOne(
      { _id },
      { $pull: { answer: { _id: answerId } } }
    );

    // --- REWARD LOGIC: DEDUCT 5 POINTS ---
    if (answer && answer.userId) {
        await User.findByIdAndUpdate(answer.userId, { $inc: { points: -5 } });
    }

    res.status(200).json({ message: "Successfully deleted..." });
  } catch (error) {
    res.status(405).json(error);
  }
};