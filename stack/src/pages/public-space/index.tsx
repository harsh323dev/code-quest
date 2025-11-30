import React, { useState, useEffect, FormEvent } from "react";
import { fetchFeed, createPost, likePost } from "../../lib/api"; 
import FindFriends from "../../components/FindFriends"; // ✅ Make sure FindFriends is here or in ../../components/ui/FindFriends
import { toast } from "react-toastify";
import { useAuth } from "../../lib/AuthContext";
import { useRouter } from "next/router";

// ✅ FIXED IMPORTS: pointing to 'ui' folder based on your file tree
import Sidebar from "../../components/Sidebar"; 
import Navbar from "C://Users//admin//Desktop//Work//My Projects//stackoverflow-clone-main//stack//src//components//Navbar";     

interface Post {
  _id: string;
  content: string;
  user: { name: string; email: string };
  media?: { url: string };
  likes: string[];
  comments: any[];
}

const PublicSpace = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  // ✅ STATE: Manage Sidebar visibility for mobile
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  
  useEffect(() => {
    if (!user && typeof window !== 'undefined') {
       // Optional: router.push('/auth'); 
    }
  }, [user, router]);

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

  // ✅ HANDLER: Toggle Sidebar
  const handleSlideIn = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 1. NAVBAR: Pass the handler */}
      <Navbar handleslidein={handleSlideIn} />
      
      <div className="flex pt-[53px]"> {/* Add padding-top to account for fixed navbar */}
        
        {/* 2. SIDEBAR: Pass the state */}
        <Sidebar isopen={isSidebarOpen} />
        
        {/* 3. MAIN CONTENT */}
        {/* 'md:ml-48 lg:ml-64' pushes content to the right when sidebar is visible on desktop */}
        <main className="flex-1 w-full md:ml-48 lg:ml-64 p-4 lg:p-6 transition-all duration-200">
            
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
                                className="w-full p-3 border border-gray-300 rounded-md mb-3 focus:outline-none focus:ring-2 focus:ring-orange-200"
                                rows={3}
                            />
                            <input 
                                type="text" 
                                placeholder="Image URL (Optional)" 
                                value={mediaUrl}
                                onChange={(e) => setMediaUrl(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md mb-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-200"
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

                {/* RIGHT SIDEBAR: FRIENDS */}
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