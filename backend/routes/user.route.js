 import {Router} from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { followUser, getCurrentUser, getUserProfile, syncUser, updateUserProfile } from '../controllers/user.controller.js';


 const router= Router();

 // http://localhost:5000/api/v1/users

 router.get('/profile/:username',getUserProfile);

 //protected routes

 router.get('/me',authMiddleware, getCurrentUser);
 router.post('/profile',authMiddleware,updateUserProfile);
 router.post('/sync',authMiddleware,syncUser);
 router.post('/follow/:targetUserId',followUser);

 export default router;