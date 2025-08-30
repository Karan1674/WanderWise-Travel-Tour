import express from 'express';
import {
    adminRegister,
    signupUser,
    loginUserOrAdmin,
    logoutUser,
    forgetPassword,
    resetPassword,
    homePage,
} from '../controllers/authController.js';
import { isAuthenticated } from '../middleware/isAuthenticated.js';
import { uploadProfilePic } from '../middleware/multer.js';

const router = express.Router();

router.get('/', homePage);
router.post('/adminRegister', adminRegister);
router.post('/signupUser', uploadProfilePic.single('profilePic'), signupUser);
router.post('/loginUserOrAdmin', loginUserOrAdmin);
router.post('/logout', isAuthenticated, logoutUser);
router.post('/forgetPassword', forgetPassword);
router.post('/reset-password', resetPassword);


export default router;