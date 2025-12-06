import express from 'express';
import auth from '../middleware/auth.js';
import { 
    createPost, 
    likePost, 
    commentOnPost, 
    sharePost, 
    getFeed 
} from '../controller/post.js'; 

const router = express.Router();

// --- Public Space Routes ---

// 1. Create Post
router.post('/create', auth, createPost);

// 2. Get Feed
router.get('/feed', auth, getFeed);

// 3. Interactions
router.patch('/:postId/like', auth, likePost);
router.patch('/:postId/share', auth, sharePost);
router.post('/:postId/comment', auth, commentOnPost);

// ✅ CRITICAL FIX: This line was likely missing
export default router;