import express from 'express';
import { AdminDashboard, addPackage, deleteAgent, deletePackage, editAgent, editPackage, getAllAgents, getAllPackages, getPackage, getSignedInUsers, newAgent } from '../controllers/adminController.js';
import { isAuthenticated } from '../middleware/isAuthenticated.js';
import { isAdminCheck } from '../middleware/isAdminCheck.js';
import { uploadGallery, uploadProfilePic } from '../middleware/multer.js';
const router = express.Router();



router.get('/AdminDashboard', isAuthenticated, isAdminCheck, AdminDashboard);
router.get('/agents', isAuthenticated, isAdminCheck, getAllAgents);
router.post('/add-agent', isAuthenticated, isAdminCheck, newAgent);
router.post('/update-agent/:editAgentId', uploadProfilePic.single('profilePic'), isAuthenticated, isAdminCheck, editAgent);
router.get('/delete-agent/:agentId', isAuthenticated, isAdminCheck, deleteAgent)
router.get('/db-signed-in-users', isAuthenticated, isAdminCheck, getSignedInUsers);


router.get('/db-all-packages', isAuthenticated, isAdminCheck, getAllPackages);
router.post('/add-package', isAuthenticated, isAdminCheck, uploadGallery.fields([{ name: 'gallery' }, { name: 'featuredImage', maxCount: 1 }]), addPackage);
router.post('/update-package/:id', isAuthenticated, isAdminCheck, uploadGallery.fields([{ name: 'gallery' }, { name: 'featuredImage', maxCount: 1 }]), editPackage);
router.get('/delete-package/:id', isAuthenticated, isAdminCheck, deletePackage);
router.get('/package/:id',isAuthenticated, isAdminCheck,getPackage)



export default router;
