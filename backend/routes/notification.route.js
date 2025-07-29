import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";
import { deleteNotification, getNotifications } from "../controllers/notification.controller";

const router= Router();

// api/v1/notifications
// protected 

router.get("/",authMiddleware,getNotifications);
router.delete('/:notificationId',authMiddleware,deleteNotification);


export default router;
