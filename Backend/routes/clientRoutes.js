import express from 'express';
import { signInUserDashboard } from '../controllers/clientController.js';
import { isAuthenticated } from '../middleware/isAuthenticated.js';


const router = express.Router();

router.get('/UserDashboard',isAuthenticated,signInUserDashboard)


export default router;