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

// 1. Create Post (Checks friend limit rules)
router.post('/create', auth, createPost);

// 2. Get Feed (Posts from friends and self)
router.get('/feed', auth, getFeed);

// 3. Interactions
// Use PATCH for updating existing resources (Like/Share)
router.patch('/:postId/like', auth, likePost);
router.patch('/:postId/share', auth, sharePost);

// Use POST for creating new child resources (Comments)
router.post('/:postId/comment', auth, commentOnPost);

export default router;