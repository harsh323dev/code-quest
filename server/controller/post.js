import User from '../models/auth.js';
import Post from '../models/post.js';

export const createPost = async (req, res) => {
  try {
    const { content, mediaType, mediaUrl } = req.body;
    const userId = req.userId; // Assuming this is set by auth middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Reset posts count if it's a new day
    await user.resetDailyPosts();

    // Check if user can post based on friend count
    const allowedPosts = user.getAllowedPostsPerDay();
    if (allowedPosts === 0) {
      return res.status(403).json({ 
        message: "You need at least one friend to post. Add friends to start posting!" 
      });
    }
    
    if (user.postsToday >= allowedPosts) {
      return res.status(403).json({ 
        message: `You've reached your daily post limit. Add more friends to increase your limit!` 
      });
    }

    const newPost = await Post.create({
      user: userId,
      content,
      media: {
        type: mediaType,
        url: mediaUrl
      }
    });

    // Update user's post count
    user.postsToday += 1;
    user.lastPostDate = new Date();
    await user.save();

    return res.status(201).json(newPost);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const likePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isLiked = post.likes.includes(userId);
    if (isLiked) {
      post.likes = post.likes.filter(id => id.toString() !== userId);
    } else {
      post.likes.push(userId);
    }

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const commentOnPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    post.comments.push({
      user: userId,
      content
    });

    await post.save();
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (!post.shares.includes(userId)) {
      post.shares.push(userId);
      await post.save();
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

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
