import React, { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../../lib/AuthContext";
import axiosInstance from "../../lib/axiosinstance";
import { toast } from "react-toastify";
import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar"; // ✅ Import Sidebar

const AskQuestion = () => {
  const [questionTitle, setQuestionTitle] = useState("");
  const [questionBody, setQuestionBody] = useState("");
  const [questionTags, setQuestionTags] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
        toast.error("Please login to ask a question");
        return;
    }

    try {
      const postQuestionData = {
        questiontitle: questionTitle,
        questionbody: questionBody,
        questiontags: questionTags.split(" "),
        userPosted: user.name,
        userId: user._id
      };

      await axiosInstance.post("/question/Ask", { postQuestionData });
      toast.success("Question posted successfully!");
      router.push("/");
    } catch (error: any) {
      toast.error("Failed to post question");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
        <Navbar handleslidein={() => setIsSidebarOpen(!isSidebarOpen)} />
        
        <div className="flex pt-[53px]">
            {/* ✅ Add Sidebar here */}
            <Sidebar isopen={isSidebarOpen} />

            {/* ✅ Fix Margin: md:ml-48 lg:ml-64 */}
            <main className="flex-1 md:ml-48 lg:ml-64 p-6 bg-gray-50 min-h-[calc(100vh-53px)]">
                <div className="max-w-5xl mx-auto px-4">
                    <h1 className="text-2xl font-bold mb-6 text-gray-900">Ask a public question</h1>
                    
                    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="mb-4">
                            <label className="block font-bold text-sm mb-1 text-gray-800">Title</label>
                            <input 
                                type="text" 
                                value={questionTitle}
                                onChange={(e) => setQuestionTitle(e.target.value)}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black bg-white"
                                required
                            />
                        </div>

                        <div className="mb-4">
                            <label className="block font-bold text-sm mb-1 text-gray-800">Body</label>
                            <textarea 
                                value={questionBody}
                                onChange={(e) => setQuestionBody(e.target.value)}
                                rows={8}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none font-mono text-sm text-black bg-white"
                                required
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block font-bold text-sm mb-1 text-gray-800">Tags</label>
                            <input 
                                type="text" 
                                value={questionTags}
                                onChange={(e) => setQuestionTags(e.target.value)}
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none text-black bg-white"
                            />
                        </div>

                        <button type="submit" className="bg-[#0A95FF] text-white px-4 py-2 rounded-md hover:bg-blue-600 transition">
                            Review your question
                        </button>
                    </form>
                </div>
            </main>
        </div>
    </div>
  );
};

export default AskQuestion;