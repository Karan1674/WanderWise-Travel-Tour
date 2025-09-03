import express from 'express';
import { signInUserDashboard, destinationPage, tourPackagesPage, packageDetailPage, submitReview, addToWishlist, removeFromWishlist, getWishlist, packageOfferPage, addToPackageCart, getpackageCart, updatePackageCart, removeFromPackageCart, checkoutPackageCart, confirmPackageBooking, createPackagePaymentIntent, getAvailableCoupons, applyCoupon, bookSinglePackage, createSinglePackagePaymentIntent, confirmSinglePackageBooking, getPackageBookingDetails, getUserPackageBookings, getUserProfile, updateUserProfile, getCareers, getCareerById, applyForCareer, getAppliedCareers, testimonialPage, getFaqPage, submitQuestion, createContactEnquiry } from '../controllers/clientController.js';
import { isAuthenticated } from '../middleware/isAuthenticated.js';
import { uploadCareerCv, uploadProfilePic } from '../middleware/multer.js';

const router = express.Router();

router.get('/UserDashboard',isAuthenticated,signInUserDashboard)

router.get('/destination', isAuthenticated, destinationPage);
router.get('/tour-packages', isAuthenticated, tourPackagesPage);
router.get('/package-detail/:id', isAuthenticated, packageDetailPage);
router.post('/review/:packageId', isAuthenticated, submitReview);
router.post('/wishlist/add/:packageId', isAuthenticated, addToWishlist);
router.post('/wishlist/remove/:packageId', isAuthenticated, removeFromWishlist);
router.get('/wishlist', isAuthenticated, getWishlist);


router.get('/package-offer', isAuthenticated, packageOfferPage);

router.post('/packageCart/add',isAuthenticated, addToPackageCart);
router.get('/packageCart',isAuthenticated, getpackageCart);
router.post('/packageCart/update',isAuthenticated, updatePackageCart);
router.post('/packageCart/remove',isAuthenticated, removeFromPackageCart);
router.get('/packageCart/checkout',isAuthenticated, checkoutPackageCart);
router.post('/packageCart/create-payment-intent', isAuthenticated, createPackagePaymentIntent)
router.post('/packageCart/confirm', isAuthenticated, confirmPackageBooking);

router.get('/bookPackage/:packageId',isAuthenticated, bookSinglePackage);
router.post('/bookPackage/create-payment-intent', isAuthenticated, createSinglePackagePaymentIntent);
router.post('/bookPackage/confirm', isAuthenticated, confirmSinglePackageBooking);

router.get('/available-coupons', isAuthenticated, getAvailableCoupons);
router.post('/applyCoupon', isAuthenticated, applyCoupon);

router.get('/booking/:bookingId', isAuthenticated, getPackageBookingDetails);
router.get('/user-package-bookings', isAuthenticated, getUserPackageBookings);

router.get('/user-profile',isAuthenticated, getUserProfile);
router.post('/user-profile/update',isAuthenticated, uploadProfilePic.single('profilePic'), updateUserProfile);


router.get('/careers', isAuthenticated, getCareers);
router.get('/careers/:id',  isAuthenticated, getCareerById);
router.post('/careers/apply', isAuthenticated, uploadCareerCv.single('cv'), applyForCareer);
router.post('/careers/:id/apply', isAuthenticated, uploadCareerCv.single('cv'), applyForCareer);
router.get('/applied-careers', isAuthenticated, getAppliedCareers);



router.get('/faq', isAuthenticated, getFaqPage);
router.post('/faq/submit', isAuthenticated, submitQuestion);
router.get('/testimonials',  isAuthenticated, testimonialPage);
router.post('/contact', isAuthenticated, createContactEnquiry);



export default router;