import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Navbar from "../../../components/Navbar";
import LeftSidebar from "../../../components/Sidebar";
import axiosInstance from "../../../lib/axiosinstance";
import moment from "moment";
import { useAuth } from "../../../lib/AuthContext";
import { toast } from "react-toastify";

const QuestionDetails = () => {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  
  const [question, setQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [answerBody, setAnswerBody] = useState("");

  useEffect(() => {
    if (id) fetchQuestionDetails();
  }, [id]);

  const fetchQuestionDetails = async () => {
    try {
      // NOTE: This fetches all questions and filters locally (less efficient but safe)
      const res = await axiosInstance.get(`/question/get`);
      const found = res.data.find((q: any) => q._id === id);
      setQuestion(found);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (value: string) => {
    if (!user) return toast.error("Please login to vote");
    try {
      await axiosInstance.patch(`/question/vote/${id}`, { value, userId: user._id });
      fetchQuestionDetails(); 
    } catch (error: any) {
      toast.error("Voting failed");
    }
  };

  const handlePostAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return toast.error("Login to answer");
    if (!answerBody) return toast.error("Enter an answer");

    try {
      await axiosInstance.patch(`/answer/post/${id}`, {
        noOfAnswers: (question?.noOfAnswers || 0) + 1,
        answerBody,
        userAnswered: user.name,
        userId: user._id
      });
      setAnswerBody("");
      fetchQuestionDetails(); 
      toast.success("Answer posted!");
    } catch (error) {
      toast.error("Failed to post answer");
    }
  };

  if (loading) return <div className="p-10 text-center">Loading...</div>;
  if (!question) return <div className="p-10 text-center">Question not found.</div>;

  // ✅ CRITICAL FIX: Safe check for undefined vote arrays
  const hasUpVoted = question.upVote?.includes(user?._id) || false;
  const hasDownVoted = question.downVote?.includes(user?._id) || false;
  const voteCount = (question.upVote?.length || 0) - (question.downVote?.length || 0);

  return (
    <div className="min-h-screen bg-white">
      <Navbar handleslidein={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex pt-[53px]">
        <LeftSidebar isopen={isSidebarOpen} />
        
        <main className="flex-1 md:ml-48 lg:ml-64 p-6 bg-white min-h-[calc(100vh-53px)]">
            <div className="max-w-5xl mx-auto">
                
                <div className="border-b pb-4 mb-4">
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">{question.questionTitle}</h1>
                    <div className="text-xs text-gray-500 flex gap-4">
                        <span>Asked {moment(question.askedOn).fromNow()}</span>
                        <span>By <span className="text-blue-600">{question.userPosted}</span></span>
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Voting UI */}
                    <div className="flex flex-col items-center gap-2 w-10 shrink-0">
                        <button onClick={() => handleVote("upVote")} className={`border rounded-full w-8 h-8 flex items-center justify-center transition ${hasUpVoted ? 'bg-orange-500 text-white' : 'hover:bg-gray-100 text-gray-600'}`}>▲</button>
                        <span className="font-bold text-lg text-gray-600">{voteCount}</span>
                        <button onClick={() => handleVote("downVote")} className={`border rounded-full w-8 h-8 flex items-center justify-center transition ${hasDownVoted ? 'bg-orange-500 text-white' : 'hover:bg-gray-1st-child text-gray-600'}`}>▼</button>
                    </div>

                    <div className="flex-1">
                        <p className="text-gray-800 leading-relaxed mb-4 whitespace-pre-wrap">{question.questionBody}</p>
                        
                        <div className="flex gap-2 mb-8">
                            {question.questionTags?.map((tag: string) => (
                                <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">{tag}</span>
                            ))}
                        </div>

                        <h3 className="text-lg font-bold mb-4 text-gray-900">
                            {question.answer?.length || 0} {question.answer?.length === 1 ? 'Answer' : 'Answers'}
                        </h3>
                        
                        <div className="space-y-6 mb-8">
                            {question.answer?.map((ans: any) => (
                                <div key={ans._id} className="border-t pt-4">
                                    <p className="text-gray-800 mb-2">{ans.answerBody}</p>
                                    <div className="text-xs text-gray-500 text-right">
                                        Answered {moment(ans.answeredOn).fromNow()} by <span className="text-blue-600 font-medium">{ans.userAnswered}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8">
                            <h3 className="font-bold text-lg mb-2 text-gray-800">Your Answer</h3>
                            <form onSubmit={handlePostAnswer}>
                                <textarea 
                                    className="w-full border rounded p-3 focus:ring-2 focus:ring-blue-500 outline-none h-40 text-black bg-white"
                                    value={answerBody}
                                    onChange={(e) => setAnswerBody(e.target.value)}
                                    placeholder="Write your answer here..."
                                />
                                <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-3 hover:bg-blue-700">Post Answer</button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default QuestionDetails;