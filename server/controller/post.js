import User from '../models/auth.js';
import Post from '../models/post.js';

export const createPost = async (req, res) => {
  try {
    const { content, mediaType, mediaUrl } = req.body;
    const userId = req.userId; // Assuming set by auth middleware

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // --- LOGIC START: DAILY RESET & LIMIT CHECK ---

    // 1. Check if it's a new day
    const todayStr = new Date().toDateString(); // e.g., "Mon Dec 01 2025"
    // user.lastPostDate might be a Date object or string depending on how it was saved. 
    // We convert to string for comparison.
    const lastPostDateStr = user.lastPostDate ? new Date(user.lastPostDate).toDateString() : "";

    if (lastPostDateStr !== todayStr) {
      user.postsToday = 0; // Reset counter for the new day
      user.lastPostDate = new Date(); // Update the date
    }

    // 2. Calculate Limit based on Friend Count
    const friendCount = user.friends.length;
    let allowedPosts = 0;

    if (friendCount === 0) {
        // Rule: No friends = Cannot post
        allowedPosts = 0;
    } else if (friendCount > 10) {
        // Rule: >10 friends = Multiple times (set to a high number)
        allowedPosts = 9999; 
    } else {
        // Rule: 1 friend = 1 post, 2 friends = 2 posts.
        // This logic handles 1 to 10 friends exactly.
        allowedPosts = friendCount;
    }

    // 3. Enforce the Limit
    if (allowedPosts === 0) {
      return res.status(403).json({ 
        message: "Public Space Locked: You need at least 1 friend to post here. Connect with users to unlock posting!" 
      });
    }
    
    if (user.postsToday >= allowedPosts) {
      return res.status(403).json({ 
        message: `Daily limit reached! With ${friendCount} friends, you can only post ${allowedPosts} times a day. Add more friends to increase your limit.` 
      });
    }

    // --- LOGIC END ---

    // 4. Create the Post
    const newPost = await Post.create({
      user: userId,
      content,
      media: {
        type: mediaType,
        url: mediaUrl
      },
      createdAt: new Date().toISOString()
    });

    // 5. Update User Stats
    user.postsToday += 1;
    // Ensure lastPostDate is current
    user.lastPostDate = new Date(); 
    
    await user.save();

    return res.status(201).json(newPost);

  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Something went wrong" });
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

    // Check if user ID is in the likes array
    const index = post.likes.findIndex((id) => id === String(userId));

    if (index === -1) {
      // Like the post
      post.likes.push(userId);
    } else {
      // Dislike (Remove like)
      post.likes = post.likes.filter((id) => id !== String(userId));
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
      content,
      postedOn: new Date()
    });

    await post.save();
    
    // Return the updated post with populated comments for immediate UI update
    const updatedPost = await Post.findById(postId).populate('comments.user', 'name');
    res.json(updatedPost);
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
    
    // Fetch posts from: The user themselves OR their friends
    const posts = await Post.find({
      $or: [
        { user: { $in: [...user.friends, userId] } }
      ]
    })
    .sort({ createdAt: -1 }) // Newest first
    .populate('user', 'name email')
    .populate('comments.user', 'name email');

    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};