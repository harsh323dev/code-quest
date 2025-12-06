import React, { useState, useEffect, FormEvent } from "react";
import { fetchFeed, createPost, likePost } from "../../lib/api"; 
import FindFriends from "../../components/FindFriends"; // Adjusted path
import { toast } from "react-toastify";
import { useAuth } from "../../lib/AuthContext";
import { useRouter } from "next/router";
import Sidebar from "../../components/Sidebar"; // Adjusted path
import Navbar from "../../components/Navbar";   // Adjusted path

// ✅ 1. Define Types to fix TypeScript Errors
interface Comment {
  _id: string;
  user: { name: string; email: string };
  content: string;
}

interface Post {
  _id: string;
  content: string;
  user: { name: string; email: string };
  media?: { url: string };
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

const PublicSpace = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  // ✅ 2. Use Type in State
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    try {
      const res = await fetchFeed();
      setPosts(res.data);
    } catch (error) {
      console.error(error);
    }
  };

  const handlePostSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await createPost({ 
        content, 
        mediaType: mediaUrl ? "image" : "text", 
        mediaUrl 
      });
      
      toast.success("Posted successfully!");
      setContent("");
      setMediaUrl("");
      loadPosts(); 
    } catch (error: any) {
      const msg = error.response?.data?.message || "Failed to post";
      toast.error(msg);
    }
  };

  const handleLike = async (postId: string) => {
    try {
      await likePost(postId);
      loadPosts(); 
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar handleslidein={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex pt-[53px]">
        <Sidebar isopen={isSidebarOpen} />
        
        <main className="flex-1 md:ml-48 lg:ml-64 p-6 transition-all duration-200">
            <div className="max-w-6xl mx-auto flex flex-col lg:flex-row gap-6">
                
                {/* CENTER: FEED */}
                <div className="flex-grow lg:flex-[3]">
                    <h1 className="text-2xl font-bold mb-6 text-gray-800">Public Space</h1>
                    
                    {/* POST INPUT */}
                    <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
                        <h3 className="font-semibold mb-3 text-gray-700">Create a Post</h3>
                        <form onSubmit={handlePostSubmit}>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                placeholder="What's on your mind?"
                                required
                                className="w-full p-3 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-orange-200 text-black bg-white"
                                rows={3}
                            />
                            <input 
                                type="text" 
                                placeholder="Image URL (Optional)" 
                                value={mediaUrl}
                                onChange={(e) => setMediaUrl(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 text-black bg-white"
                            />
                            <button type="submit" className="bg-[#ef8236] text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors font-medium">
                                Post
                            </button>
                        </form>
                    </div>

                    {/* POST LIST */}
                    <div className="space-y-4">
                        {posts.map((post) => (
                            <div key={post._id} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm">
                                <div className="font-bold text-gray-800 mb-2 flex items-center gap-2">
                                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm text-gray-600">
                                    {post.user?.name?.charAt(0).toUpperCase()}
                                  </div>
                                  {post.user?.name}
                                </div>
                                <p className="text-gray-700 mb-3">{post.content}</p>
                                {post.media?.url && (
                                  <img 
                                    src={post.media.url} 
                                    alt="Post media" 
                                    className="max-w-full max-h-[400px] rounded-md mb-3 object-cover" 
                                  />
                                )}
                                
                                <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
                                    <button 
                                      onClick={() => handleLike(post._id)} 
                                      className={`flex items-center gap-1 hover:text-orange-600 transition ${post.likes.includes(user?._id || '') ? "text-orange-600 font-bold" : ""}`}
                                    >
                                      <span>👍</span> {post.likes.length} Likes
                                    </button>
                                    <span className="flex items-center gap-1">
                                      <span>💬</span> {post.comments.length} Comments
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDEBAR */}
                <div className="lg:flex-1 lg:min-w-[250px]">
                    <div className="sticky top-[70px]">
                      <FindFriends />
                    </div>
                </div>

            </div>
        </main>
      </div>
    </div>
  );
};

export default PublicSpace;