import express from 'express';
import { AdminDashboard} from '../controllers/adminController.js';
import {isAuthenticated } from '../middleware/isAuthenticated.js';
import {isAdminCheck}  from '../middleware/isAdminCheck.js';
const router = express.Router();



router.get('/AdminDashboard', isAuthenticated, isAdminCheck, AdminDashboard)


export default router;
