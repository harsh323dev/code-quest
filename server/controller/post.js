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

    // B. Calculate Limit (Friend Logic)
    const friendCount = user.friends.length;
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
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

// --- 2. LIKE POST ---
export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    const index = post.likes.findIndex((id) => id === String(userId));

    if (index === -1) post.likes.push(userId);
    else post.likes = post.likes.filter((id) => id !== String(userId));

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 3. COMMENT ON POST ---
export const commentOnPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.comments.push({
      user: userId,
      content,
      postedOn: new Date()
    });

    await post.save();
    const updatedPost = await Post.findById(postId).populate('comments.user', 'name');
    res.json(updatedPost);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 4. SHARE POST ---
export const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.shares.includes(userId)) {
      post.shares.push(userId);
      await post.save();
    }
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- 5. GET FEED (Friends + Self) ---
export const getFeed = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    
    const posts = await Post.find({
      $or: [
        { user: { $in: [...user.friends, userId] } }
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