import express from 'express';
import { AdminDashboard, addPackage, deleteAgent, deletePackage, deletePackageBooking, editAgent, editPackage, editPackageBooking, getAdminAgentProfile, getAllAgents, getAllPackages, getEditPackageBooking, getPackage, getPackageBookings, getSignedInUsers, newAgent, updateAdminAgentProfile, getCoupons, createCoupon, getEditCoupon, updateCoupon, deleteCoupon, getCouponDetails, getCareerList, addCareer, getEditCareerData, editCareer, getCareerDetail, deleteCareer, getApplicationList, getApplicationDetail, updateApplicationStatus,  getFaqEnquiry, editFaqEnquiry, deleteFaqEnquiry, getContactEnquiries, updateContactEnquiryStatus, deleteContactEnquiry, } from '../controllers/adminController.js';
import { isAuthenticated } from '../middleware/isAuthenticated.js';
import { isAdminCheck } from '../middleware/isAdminCheck.js';
import { uploadGallery, uploadProfilePic, uploadCareerPic } from '../middleware/multer.js';
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


router.get('/admin-agent-profile',isAuthenticated, isAdminCheck, getAdminAgentProfile);
router.post('/admin-agent-profile/update',isAuthenticated,isAdminCheck, uploadProfilePic.single('profilePic'), updateAdminAgentProfile);


router.get('/package-bookings', isAuthenticated, isAdminCheck, getPackageBookings);
router.get('/package-booking/edit/:bookingId', isAuthenticated, isAdminCheck, getEditPackageBooking);
router.post('/package-booking/edit/:bookingId', isAuthenticated, isAdminCheck, editPackageBooking);
router.get('/package-booking/delete/:bookingId', isAuthenticated, isAdminCheck,deletePackageBooking);


router.get('/coupon-list', isAuthenticated,isAdminCheck,getCoupons);
router.post('/new-coupon', isAuthenticated,isAdminCheck, createCoupon);
router.get('/edit-coupon/:couponId', isAuthenticated, isAdminCheck, getEditCoupon);
router.post('/edit-coupon/:couponId',  isAuthenticated, isAdminCheck, updateCoupon);
router.get('/delete-coupon/:couponId', isAuthenticated, isAdminCheck, deleteCoupon);
router.get('/coupon-details/:couponId', isAuthenticated, isAdminCheck, getCouponDetails);


router.get('/career-list', isAuthenticated, isAdminCheck, getCareerList);
router.post('/add-career',isAuthenticated, isAdminCheck, uploadCareerPic.single('careerPic'), addCareer);
router.get('/edit-career/:id', isAuthenticated, isAdminCheck, getEditCareerData);
router.post('/edit-career/:id', isAuthenticated, isAdminCheck, uploadCareerPic.single('careerPic'),  editCareer);
router.get('/career-detail/:id',  isAuthenticated, isAdminCheck, getCareerDetail);
router.get('/delete-career/:id', isAuthenticated, isAdminCheck, deleteCareer);



router.get('/application-list', isAuthenticated, isAdminCheck, getApplicationList);
router.get('/application-detail/:id', isAuthenticated, isAdminCheck, getApplicationDetail);
router.post('/application-detail/:id/update', isAuthenticated, isAdminCheck, updateApplicationStatus);



router.get('/faqEnquiry', isAuthenticated, isAdminCheck, getFaqEnquiry);
router.post('/faqEnquiry/edit/:id', isAuthenticated, isAdminCheck, editFaqEnquiry);
router.get('/faqEnquiry/delete/:id', isAuthenticated, isAdminCheck, deleteFaqEnquiry);
router.get('/contactEnquiry', isAuthenticated, isAdminCheck, getContactEnquiries);
router.post('/contactEnquiry/update/:id', isAuthenticated, isAdminCheck, updateContactEnquiryStatus);
router.get('/contactEnquiry/delete/:id', isAuthenticated, isAdminCheck, deleteContactEnquiry);


export default router;
