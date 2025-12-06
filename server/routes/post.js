import User from '../models/auth.js';
import Post from '../models/post.js';

// --- 1. CREATE POST (Public Space) ---
export const createPost = async (req, res) => {
  try {
    const { content, mediaType, mediaUrl } = req.body;
    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // A. Daily Reset Logic
    const todayStr = new Date().toDateString();
    const lastPostDateStr = user.lastPostDate ? new Date(user.lastPostDate).toDateString() : "";

    if (lastPostDateStr !== todayStr) {
      user.postsToday = 0;
      user.lastPostDate = new Date();
    }

    // B. Calculate Limit (Friend Logic) WITH SAFETY CHECK
    // ✅ FIX: Check if friends array exists before reading length
    const friendCount = user.friends ? user.friends.length : 0;
    
    let allowedPosts = 0;

    if (friendCount === 0) allowedPosts = 0;
    else if (friendCount > 10) allowedPosts = 9999;
    else allowedPosts = friendCount;

    // C. Enforce Limit
    if (allowedPosts === 0) {
      return res.status(403).json({ 
        message: "Public Space Locked: You need at least 1 friend to post here." 
      });
    }
    
    if (user.postsToday >= allowedPosts) {
      return res.status(403).json({ 
        message: `Daily limit reached! With ${friendCount} friends, you can only post ${allowedPosts} times a day.` 
      });
    }

    // D. Create Post
    const newPost = await Post.create({
      user: userId,
      content,
      media: { type: mediaType, url: mediaUrl },
      createdAt: new Date().toISOString()
    });

    // E. Update Stats
    user.postsToday += 1;
    user.lastPostDate = new Date();
    await user.save();

    return res.status(201).json(newPost);

  } catch (error) {
    console.log(error); // Keep this for debugging
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// ... (Keep likePost, commentOnPost, sharePost, getFeed as they were) ...
// (I am omitting them here to save space, but DO NOT delete them from your file)
export const likePost = async (req, res) => { /* ... keep existing code ... */ };
export const commentOnPost = async (req, res) => { /* ... keep existing code ... */ };
export const sharePost = async (req, res) => { /* ... keep existing code ... */ };
export const getFeed = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    // ✅ FIX: Safe check for feed as well
    const friendList = user.friends ? [...user.friends, userId] : [userId];

    const posts = await Post.find({
      $or: [
        { user: { $in: friendList } }
      ]
    })
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .populate('comments.user', 'name email');

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};