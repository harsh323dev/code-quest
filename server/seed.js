import mongoose from "mongoose";
import Question from "./models/question.js";
import dotenv from "dotenv";

dotenv.config();

// Dummy User IDs
const DEMO_USER_ID = "65a9f25b1234567890abcdef";
const DEMO_USER_NAME = "DemoUser";

const sampleQuestions = [
  {
    questionTitle: "What is the difference between var, let, and const in JavaScript?",
    questionBody: "I am confused about when to use which. Can someone explain the scope differences?",
    questionTags: ["javascript", "es6", "variables"],
    noOfAnswers: 2,
    upVote: [DEMO_USER_ID],
    downVote: [],
    userPosted: "DevNewbie",
    userId: DEMO_USER_ID,
    askedOn: new Date("2023-10-01"),
    answer: [],
  },
  {
    questionTitle: "How to center a div horizontally and vertically?",
    questionBody: "I've tried margin: 0 auto, but it only works horizontally. I need full centering.",
    questionTags: ["css", "html", "flexbox"],
    noOfAnswers: 1,
    upVote: [DEMO_USER_ID, "dummy_id_2"],
    downVote: [],
    userPosted: "CSSMaster",
    userId: "dummy_id_2",
    askedOn: new Date("2023-10-05"),
    answer: [],
  },
  {
    questionTitle: "React useEffect hook running twice in Strict Mode",
    questionBody: "Why does my API call fire twice when I load the page? Is this a bug in React 18?",
    questionTags: ["reactjs", "hooks", "frontend"],
    noOfAnswers: 0,
    upVote: [],
    downVote: [],
    userPosted: "ReactFan",
    userId: "dummy_id_3",
    askedOn: new Date("2023-10-10"),
    answer: [],
  },
  {
    questionTitle: "Deploying MERN stack app to Render and Vercel",
    questionBody: "I have my backend on Render and frontend on Vercel. How do I handle CORS errors?",
    questionTags: ["deployment", "mern", "cors"],
    noOfAnswers: 3,
    upVote: [DEMO_USER_ID, "dummy_id_2", "dummy_id_3"],
    downVote: [],
    userPosted: DEMO_USER_NAME,
    userId: DEMO_USER_ID,
    askedOn: new Date("2023-10-12"),
    answer: [],
  },
  {
    questionTitle: "Python vs Node.js for backend development in 2025",
    questionBody: "Which one scales better for a real-time chat application?",
    questionTags: ["python", "nodejs", "backend"],
    noOfAnswers: 5,
    upVote: ["dummy_id_2"],
    downVote: ["dummy_id_3"],
    userPosted: "TechLead",
    userId: "dummy_id_4",
    askedOn: new Date("2023-10-15"),
    answer: [],
  },
];

const seedDB = async () => {
  try {
    const URL = process.env.MONGODB_URL || "mongodb://localhost:27017/stack-clone-db";

    await mongoose.connect(URL);
    console.log("🌱 Connected to Database for Seeding...");
    console.log("📂 Using DB name:", mongoose.connection.db.databaseName);

    // If you DON'T want to wipe existing data, comment out the next two lines:
    // await Question.deleteMany({});
    // console.log("🧹 Cleared existing questions");

    await Question.insertMany(sampleQuestions);
    console.log("✅ Added 5 Sample Questions!");

    await mongoose.disconnect();
    console.log("👋 Connection Closed.");
  } catch (error) {
    console.error("❌ Error seeding database:", error);
  }
};

seedDB();
