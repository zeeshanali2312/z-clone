 import {Router} from 'express';
import { authMiddleware } from '../middleware/auth.middleware';

 const router= Router();

 // http://localhost:5000/api/v1/users

 router.get('/profile/:username',getUserProfile);

 //protected routes

 router.get('/me',authMiddleware, getCurrentUser);
 router.post('/profile',authMiddleware,updateUserProfile);
 router.post('/sync',authMiddleware,syncUser);
 router.post('/follow/:targetUserId',followUser);
