import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";

import userRoutes from "./routes/auth.js";
import questionRoutes from "./routes/question.js";
import answerRoutes from "./routes/answer.js"; // ✅ ADD THIS
import postRoutes from "./routes/post.js";
import paymentRoutes from "./routes/payment.js";

dotenv.config();

const app = express();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("StackOverflow Clone API is running");
});

// Routes
app.use('/user', userRoutes);
app.use('/question', questionRoutes);
app.use('/answer', answerRoutes); // ✅ ADD THIS
app.use('/posts', postRoutes);
app.use('/payment', paymentRoutes);

const PORT = process.env.PORT || 5000;
const CONNECTION_URL = process.env.MONGODB_URL;

mongoose.connect(CONNECTION_URL)
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch((err) => console.log(err.message));
