import { Router } from "express";

// my imports 
import { authMiddleware } from "../middleware/auth.middleware.js";
import upload from '../middleware/upload.middleware.js';

const router = Router();

// api/v1/posts/

// public routes
router.get('/',getAllPosts);
router.get('/:postId',getPost);
router.get('/user/:username',getUserPosts);


// protected routes
router.post('/create',upload.single("image"), authMiddleware,createPost);
router.post('/:postId/like',authMiddleware,likePost);
router.delete('/postId',authMiddleware,deletePost);
