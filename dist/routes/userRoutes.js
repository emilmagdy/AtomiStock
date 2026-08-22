import express from 'express';
const router = express.Router();
import { userRegistration, userLogin, userLogout, userProfile } from '../controllers/userControllers.js';
import { tokenVerification } from '../middleware/authMiddleware.js';
router.post("/register", userRegistration);
router.post("/login", userLogin);
router.post("/logout", userLogout);
router.get("/profile", tokenVerification, userProfile);
export default router;
