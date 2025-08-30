import express from 'express';
import { AdminDashboard, deleteAgent, editAgent, getAllAgents, getSignedInUsers, newAgent } from '../controllers/adminController.js';
import { isAuthenticated } from '../middleware/isAuthenticated.js';
import { isAdminCheck } from '../middleware/isAdminCheck.js';
import { uploadProfilePic } from '../middleware/multer.js';
const router = express.Router();



router.get('/AdminDashboard', isAuthenticated, isAdminCheck, AdminDashboard);
router.get('/agents', isAuthenticated, isAdminCheck, getAllAgents);
router.post('/add-agent', isAuthenticated, isAdminCheck, newAgent);
router.post('/update-agent/:editAgentId', uploadProfilePic.single('profilePic'), isAuthenticated, isAdminCheck, editAgent);
router.get('/delete-agent/:agentId', isAuthenticated, isAdminCheck, deleteAgent)
router.get('/db-signed-in-users', isAuthenticated, isAdminCheck, getSignedInUsers);



export default router;
