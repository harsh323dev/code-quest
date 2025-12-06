import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar"; // Changed LeftSidebar to Sidebar for consistency
import axiosInstance from "../lib/axiosinstance";
import Link from "next/link";

const Home = () => {
  const [questionsList, setQuestionsList] = useState<any[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const res = await axiosInstance.get("/question/get");
      setQuestionsList(res.data);
    } catch (error) {
      console.log("Error fetching questions:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar handleslidein={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex pt-[53px]"> {/* Push below navbar */}
        
        {/* Fixed Sidebar */}
        <Sidebar isopen={isSidebarOpen} />
        
        {/* ✅ FIX: Added margin-left (ml) so content isn't hidden behind sidebar */}
        <main className="flex-1 md:ml-48 lg:ml-64 p-6 bg-gray-50 min-h-[calc(100vh-53px)]">
            <div className="max-w-5xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-800">Top Questions</h1>
                    <Link 
                        href="/ask"
                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition text-sm font-medium"
                    >
                        Ask Question
                    </Link>
                </div>

                {loading ? (
                    <p className="text-gray-500">Loading questions...</p>
                ) : questionsList.length === 0 ? (
                    <p className="text-gray-500">No questions found.</p>
                ) : (
                    <div className="space-y-4">
                        {questionsList.map((q) => (
                            <div key={q._id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:shadow-md transition">
                                <div className="flex gap-6">
                                    {/* Stats Side */}
                                    <div className="flex flex-col gap-2 text-right text-xs text-gray-600 w-[80px] shrink-0">
                                        <div><span className="font-bold text-gray-800">{q.upVote?.length - q.downVote?.length || 0}</span> votes</div>
                                        <div className={`border px-1 py-0.5 rounded text-center ${q.noOfAnswers > 0 ? 'border-green-500 text-green-600 bg-green-50' : ''}`}>
                                            <span className="font-bold">{q.noOfAnswers}</span> answers
                                        </div>
                                    </div>

                                    {/* Content Side */}
                                    <div className="flex-1">
                                        <Link href={`/questions/${q._id}`}>
                                            <h3 className="text-blue-700 font-medium hover:text-blue-500 text-lg mb-2 cursor-pointer">
                                                {q.questionTitle || q.questiontitle}
                                            </h3>
                                        </Link>
                                        
                                        <div className="flex flex-wrap gap-2 mb-3">
                                            {(q.questionTags || q.questiontags || []).map((tag: string) => (
                                                <span key={tag} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex justify-end items-center text-xs text-gray-500">
                                            <span className="mr-1">asked {new Date(q.askedOn).toLocaleDateString()} by</span>
                                            <span className="text-blue-600 font-medium">{q.userPosted}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
      </div>
    </div>
  );
};

export default Home;