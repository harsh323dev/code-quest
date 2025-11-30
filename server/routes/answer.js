import express from "express";
// ✅ CHANGED: Imported 'postAnswer' and 'deleteAnswer' (CamelCase) to match the new Controller
import { postAnswer, deleteAnswer } from "../controller/answer.js"; 
import auth from "../middleware/auth.js";

const router = express.Router();

// Route to post an answer
router.patch("/post/:id", auth, postAnswer);

// Route to delete an answer
router.patch("/delete/:id", auth, deleteAnswer);

export default router;