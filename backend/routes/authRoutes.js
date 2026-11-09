import express from "express"
import {register,verifyEmail,resendOtp,verifyLogin,login, forgotPassword, resetPassword, getMe} from "../controllers/authController.js"
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post('/register',register)
router.post("/verify-email",verifyEmail)
router.post("/resend-otp",resendOtp)
router.post("/login",login)
router.post("/forgot-password",forgotPassword)
router.post("/reset-password",resetPassword)
router.get("/me",protect,getMe)

export default router