import React, { useState, useEffect, FormEvent } from "react";
import { fetchFeed, createPost, likePost, commentOnPost } from "../../lib/api"; 
import FindFriends from "../../components/FindFriends"; 
import { toast } from "react-toastify";
import { useAuth } from "../../lib/AuthContext";
import { useRouter } from "next/router";
import Sidebar from "../../components/Sidebar"; 
import Navbar from "../../components/Navbar";      
import moment from "moment";

// Define Interfaces
interface Comment {
  _id: string;
  user: { name: string; email: string };
  content: string;
  postedOn: string;
}

interface Post {
  _id: string;
  content: string;
  user: { name: string; email: string };
  media?: { type: 'image' | 'video' | 'text', url: string };
  likes: string[];
  comments: Comment[];
  createdAt: string;
}

const PublicSpace = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [posts, setPosts] = useState<Post[]>([]);
  const [content, setContent] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState("text"); // 'image' | 'video' | 'text'
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // ✅ STATE FOR COMMENTS (Track which post has comments open)
  const [activeCommentId, setActiveCommentId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState("");

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
      // Logic: If user pasted a URL but left type as 'text', default to 'image'
      let finalType = mediaType;
      if (mediaUrl && mediaType === 'text') finalType = 'image'; 

      await createPost({ 
        content, 
        mediaType: finalType, 
        mediaUrl 
      });
      
      toast.success("Posted successfully!");
      setContent("");
      setMediaUrl("");
      setMediaType("text");
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

  // ✅ HANDLER FOR COMMENTS
  const handleCommentSubmit = async (postId: string) => {
    if (!commentText.trim()) return;
    try {
      await commentOnPost(postId, commentText);
      toast.success("Comment added");
      setCommentText("");
      loadPosts(); // Refresh feed to show new comment
    } catch (error) {
      toast.error("Failed to comment");
    }
  };

  // ✅ TOGGLE COMMENT BOX
  const toggleComments = (postId: string) => {
    if (activeCommentId === postId) {
      setActiveCommentId(null); // Close if already open
    } else {
      setActiveCommentId(postId); // Open this specific post
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
                    
                    {/* POST INPUT FORM */}
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
                            
                            <div className="flex gap-2 mb-3">
                                {/* ✅ MEDIA TYPE SELECTOR */}
                                <select 
                                    value={mediaType}
                                    onChange={(e) => setMediaType(e.target.value)}
                                    className="p-2 border border-gray-300 rounded-md text-sm text-black bg-white focus:outline-none"
                                >
                                    <option value="text">No Media</option>
                                    <option value="image">Image</option>
                                    <option value="video">Video</option>
                                </select>
                                
                                {/* ✅ URL INPUT */}
                                <input 
                                    type="text" 
                                    placeholder={mediaType === 'video' ? "Video URL (mp4/webm)" : "Image URL"} 
                                    value={mediaUrl}
                                    onChange={(e) => setMediaUrl(e.target.value)}
                                    disabled={mediaType === 'text'}
                                    className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 text-black bg-white disabled:bg-gray-100"
                                />
                            </div>

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
                                  <div>
                                    <div className="text-sm">{post.user?.name}</div>
                                    <div className="text-xs text-gray-400 font-normal">{moment(post.createdAt).fromNow()}</div>
                                  </div>
                                </div>
                                
                                <p className="text-gray-800 mb-3 whitespace-pre-wrap">{post.content}</p>
                                
                                {/* ✅ RENDER VIDEO OR IMAGE */}
                                {post.media?.url && (
                                  <div className="mb-3">
                                    {post.media.type === 'video' ? (
                                        <video controls className="w-full max-h-[400px] rounded-md bg-black">
                                            <source src={post.media.url} type="video/mp4" />
                                            Your browser does not support the video tag.
                                        </video>
                                    ) : (
                                        <img 
                                            src={post.media.url} 
                                            alt="Post media" 
                                            className="max-w-full max-h-[400px] rounded-md object-cover" 
                                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} 
                                        />
                                    )}
                                  </div>
                                )}
                                
                                {/* ACTIONS */}
                                <div className="flex items-center gap-4 text-sm text-gray-500 pt-3 border-t border-gray-100">
                                    <button 
                                      onClick={() => handleLike(post._id)} 
                                      className={`flex items-center gap-1 hover:text-orange-600 transition ${post.likes.includes(user?._id || '') ? "text-orange-600 font-bold" : ""}`}
                                    >
                                      <span>👍</span> {post.likes.length} Likes
                                    </button>
                                    
                                    {/* ✅ COMMENTS BUTTON */}
                                    <button 
                                      onClick={() => toggleComments(post._id)}
                                      className="flex items-center gap-1 hover:text-blue-600 transition"
                                    >
                                      <span>💬</span> {post.comments.length} Comments
                                    </button>
                                </div>

                                {/* ✅ COMMENTS SECTION (Visible only if active) */}
                                {activeCommentId === post._id && (
                                    <div className="mt-4 pt-4 border-t border-gray-100 bg-gray-50 p-3 rounded-md">
                                        
                                        {/* List Comments */}
                                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                                            {post.comments.length === 0 && <p className="text-xs text-gray-400 italic">No comments yet.</p>}
                                            {post.comments.map((c, idx) => (
                                                <div key={idx} className="text-sm">
                                                    <span className="font-bold text-gray-700">{c.user?.name}: </span>
                                                    <span className="text-gray-600">{c.content}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Input */}
                                        <div className="flex gap-2">
                                            <input 
                                                type="text" 
                                                placeholder="Write a comment..." 
                                                className="flex-1 p-2 border rounded-md text-sm text-black bg-white focus:outline-none focus:border-blue-400"
                                                value={commentText}
                                                onChange={(e) => setCommentText(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleCommentSubmit(post._id)}
                                            />
                                            <button 
                                                onClick={() => handleCommentSubmit(post._id)}
                                                className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700"
                                            >
                                                Send
                                            </button>
                                        </div>
                                    </div>
                                )}
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