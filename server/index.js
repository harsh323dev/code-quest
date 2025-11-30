import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import mongoose from "mongoose";
import userroutes from "./routes/auth.js";
import questionroute from "./routes/question.js";
import answerroutes from "./routes/answer.js";
import postRoutes from "./routes/post.js"; 
import paymentRoutes from "./routes/payment.js"; // ✅ 1. IMPORT PAYMENT ROUTES

dotenv.config();

const app = express();
app.use(express.json({ limit: "30mb", extended: true }));
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(cors());

app.get("/", (req, res) => {
  res.send("Stackoverflow clone is running perfect");
});

app.use('/user', userroutes);
app.use('/question', questionroute);
app.use('/answer', answerroutes);

// ✅ 2. CHANGE '/post' to '/posts'
// The frontend code I gave you uses axiosInstance.get('/posts/feed'). 
// These must match exactly.
app.use('/posts', postRoutes); 

// ✅ 3. USE PAYMENT ROUTES
app.use('/payment', paymentRoutes); 

const PORT = process.env.PORT || 5000;
const databaseurl = process.env.MONGODB_URL;

mongoose
  .connect(databaseurl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log("✅ Connected to MongoDB");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err.message);
  });