import express from 'express';
import auth from '../middleware/auth.js';
import { createPost, likePost, commentOnPost, sharePost, getFeed } from '../controller/post.js';

const router = express.Router();

router.post('/create', auth, createPost);
router.post('/:postId/like', auth, likePost);
router.post('/:postId/comment', auth, commentOnPost);
router.post('/:postId/share', auth, sharePost);
router.get('/feed', auth, getFeed);

export default router;
