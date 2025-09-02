import userModel from '../models/userModel.js';
import packageModel from "../models/packageModel.js";
import destinations from '../data/destinations.js';
import reviewSchema from '../models/reviewSchema.js';
import wishlistSchema from '../models/wishlistSchema.js';
import packageCartSchema from '../models/packageCartSchema.js';
import packageBookingSchema from '../models/packageBookingSchema.js';
import couponSchema from '../models/couponSchema.js';

import Stripe from 'stripe';
import mongoose from 'mongoose';

import { promises as fs } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import CareerSchema from '../models/CareerSchema.js';
import ApplicationSchema from '../models/ApplicationSchema.js';
import faqSchema from '../models/faqSchema.js';
import testimonials from '../data/testimonials.js';
import contactSchema from '../models/contactSchema.js';


const __dirname = dirname(fileURLToPath(import.meta.url));

const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);

// Render Simple User Page 
export const signInUserDashboard = async (req, res) => {
    try {
        const userId = req.id;
        const userData = await userModel.findById(userId);
        
        if (!userData) {
            return res.json({ message: 'User not found', type: 'error', success: false});
        }
     
     return res.json({
            destinations: [],
            packages: [],
            blogs: [],
            testimonials: [],
            success:true,
        });;
    } catch (error) {
        console.error('Sign in error:', error);
        res.status(500).json({ message: 'Server error loading dashboard', type: 'error', success: false });    
    }
};



// Destination page controller
export const destinationPage = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const userData = await userModel
      .findById(userId)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .lean();
    if (!userData) {
      return res.status(404).json({ success: false, message: 'No such user exists in the database' });
    }


    return res.json({
      success: true,
      destinations,
    });
  } catch (error) {
    console.error('Error fetching destination page:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Tour packages page controller
export const tourPackagesPage = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const userData = await userModel
      .findById(userId)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .lean();
    if (!userData) {
      return res.status(404).json({ success: false, message: 'No such user exists in the database' });
    }

    const destination = req.query.destination;
    let query = { status: 'Active' };
    if (destination) {
      query.destinationCountry = new RegExp(destination, 'i');
    }

    const packages = await packageModel.find(query).lean();
    const packageIds = packages.map(pkg => pkg._id);
    const reviews = await reviewSchema.find({ packageId: { $in: packageIds } }).sort({ date: -1 }).lean();
    const wishlist = await wishlistSchema.findOne({ userId }).lean();
    const wishlistPackageIds = wishlist ? wishlist.packages.map(id => id.toString()) : [];

    const packagesWithReviews = packages.map(pkg => {
      const pkgReviews = reviews.filter(review => review.packageId.toString() === pkg._id.toString());
      return {
        ...pkg,
        reviews: pkgReviews,
        reviewCount: pkgReviews.length,
        isWishlisted: wishlistPackageIds.includes(pkg._id.toString()),
        averageRating: pkgReviews.length > 0
          ? (pkgReviews.reduce((sum, review) => sum + review.rating, 0) / pkgReviews.length).toFixed(1)
          : '0',
      };
    });

    res.json({
      success: true,
      packages: packagesWithReviews,
    });
  } catch (error) {
    console.error('Error fetching tour packages:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};



// Package Detail page controller
export const packageDetailPage = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const userData = await userModel
      .findById(userId)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .lean();
    if (!userData) {
      return res.status(404).json({ success: false, message: 'No such user exists in the database' });
    }

    const packageId = req.params.id;
    const packageData = await packageModel.findOne({ _id: packageId, status: 'Active' }).lean();
    const reviews = await reviewSchema.find({ packageId }).sort({ date: -1 }).lean();
    const reviewCount = reviews.length;
    const wishlist = await wishlistSchema.findOne({ userId }).lean();
    const isWishlisted = wishlist ? wishlist.packages.some(id => id.toString() === packageId) : false;

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'No package available or the package is not active',
        user: userData,
        package: null,
        reviewCount: 0,
        reviews: [],
        isWishlisted: false,
      });
    }

    res.json({
      success: true,
      user: userData,
      package: { ...packageData, isWishlisted },
      reviewCount,
      reviews,
    });
  } catch (error) {
    console.error('Error fetching package details:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Submit a new review
export const submitReview = async (req, res) => {
  try {
    const { packageId, name, email, rating, subject, comment } = req.body;

    if (!packageId || !name || !email || !rating || !subject || !comment) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const review = new reviewSchema({
      packageId,
      name,
      email,
      rating: parseInt(rating),
      subject,
      comment,
    });

    await review.save();
    res.status(201).json({ success: true, message: 'Review submitted successfully', review });
  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add to wishlist
export const addToWishlist = async (req, res) => {
  try {
    const userId = req.id;
    const packageId = req.params.packageId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const user = await userModel.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'No such user exists in the database' });
    }

    const packageData = await packageModel.findOne({ _id: packageId, status: 'Active' }).lean();
    if (!packageData) {
      return res.status(404).json({ success: false, message: 'Package not found or not active' });
    }

    let wishlist = await wishlistSchema.findOne({ userId });
    if (!wishlist) {
      wishlist = new wishlistSchema({ userId, packages: [packageId] });
    } else if (!wishlist.packages.includes(packageId)) {
      wishlist.packages.push(packageId);
    }

    await wishlist.save();
    res.status(200).json({ success: true, message: 'Package added to wishlist successfully' });
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.id;
    const packageId = req.params.packageId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const user = await userModel.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'No such user exists in the database' });
    }

    const wishlist = await wishlistSchema.findOne({ userId });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist not found' });
    }

    wishlist.packages = wishlist.packages.filter(id => id.toString() !== packageId);
    await wishlist.save();

    res.status(200).json({ success: true, message: 'Package removed from wishlist successfully' });
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get wishlist
export const getWishlist = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const user = await userModel
      .findById(userId)
      .select('-password -resetPasswordToken -resetPasswordExpires')
      .lean();
    if (!user) {
      return res.status(404).json({ success: false, message: 'No such user exists in the database' });
    }

    const wishlist = await wishlistSchema
      .findOne({ userId })
      .populate({
        path: 'packages',
        match: { status: 'Active' },
        select: 'title featuredImage salePrice regularPrice tripDuration groupSize destinationCountry description',
      })
      .lean();
    const packages = wishlist ? wishlist.packages : [];

    const packageIds = packages.map(pkg => pkg._id);
    const reviews = await reviewSchema.find({ packageId: { $in: packageIds } }).sort({ date: -1 }).lean();

    const packagesWithReviews = packages.map(pkg => {
      const pkgReviews = reviews.filter(review => review.packageId.toString() === pkg._id.toString());
      return {
        ...pkg,
        reviewCount: pkgReviews.length,
        averageRating: pkgReviews.length > 0
          ? (pkgReviews.reduce((sum, review) => sum + review.rating, 0) / pkgReviews.length).toFixed(1)
          : '0',
      };
    });

    res.json({
      success: true,
      user,
      packages: packagesWithReviews,
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};




// Get Package Offer Page
export const packageOfferPage = async (req, res) => {
    try {
        const userId = req.id;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'User ID not available', type: 'error' });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: 'No such user exists in the database', type: 'error' });
        }

        const packages = await packageModel.find({
            status: 'Active',
            salePrice: { $exists: true, $ne: null },
            regularPrice: { $exists: true, $ne: null },
            discount: { $exists: true, $ne: null },
            $expr: { $lt: ['$salePrice', '$regularPrice'] }
        });

        const packageIds = packages.map(pkg => pkg._id);
        const reviews = await reviewSchema.find({ packageId: { $in: packageIds } }).sort({ date: -1 });

        const wishlist = await wishlistSchema.findOne({ userId });
        const wishlistPackageIds = wishlist ? wishlist.packages.map(id => id.toString()) : [];

        const packagesWithReviews = packages.map(pkg => {
            const pkgReviews = reviews.filter(review => review.packageId.toString() === pkg._id.toString());
            return {
                ...pkg._doc,
                reviewCount: pkgReviews.length,
                averageRating: pkgReviews.length > 0
                    ? (pkgReviews.reduce((sum, review) => sum + review.rating, 0) / pkgReviews.length).toFixed(1)
                    : '0',
                isWishlisted: wishlistPackageIds.includes(pkg._id.toString())
            };
        });

        res.json({ success: true, user: userData, packages: packagesWithReviews });
    } catch (error) {
        console.error('Error fetching package offer page:', error);
        res.status(500).json({ success: false, message: 'Server error', type: 'error' });
    }
};



const countryToIsoCode = {
    'United States': 'US',
    'Canada': 'CA',
    'United Kingdom': 'GB',
    // Add more mappings as needed
};


// Get Package Cart
export const getpackageCart = async (req, res) => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User ID not available', type: 'error' });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: 'No such user exists in the database', type: 'error' });
        }

        const cart = await packageCartSchema.findOne({ userId }).populate('items.packageId');

        res.json({ success: true, user: userData, cart: cart || { items: [] } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error retrieving cart', type: 'error' });
    }
};

// Checkout Package Cart
export const checkoutPackageCart = async (req, res) => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User ID not available', type: 'error' });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: 'No such user exists in the database', type: 'error' });
        }

        const cart = await packageCartSchema.findOne({ userId }).populate('items.packageId');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty or not found', type: 'error' });
        }

        if (!process.env.STRIPE_PUBLISHABLE_KEY || !process.env.STRIPE_SECRET_KEY) {
            return res.status(500).json({ success: false, message: 'Server configuration error: Missing Stripe keys', type: 'error' });
        }

        res.json({ success: true, user: userData, cart, stripeKey: process.env.STRIPE_PUBLISHABLE_KEY });
    } catch (error) {
        console.error('Checkout error:', error);
        res.status(500).json({ success: false, message: 'Error during checkout', type: 'error' });
    }
};

// Book Single Package
export const bookSinglePackage = async (req, res) => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User ID not available', type: 'error' });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: 'No such user exists in the database', type: 'error' });
        }

        const packageId = req.params.packageId;
        const packageData = await packageModel.findById(packageId);
        if (!packageData) {
            return res.status(400).json({ success: false, message: 'Package not found or not active', type: 'error' });
        }

        const cart = {
            items: [{
                packageId: packageData,
                quantity: 1
            }]
        };

        if (!process.env.STRIPE_PUBLISHABLE_KEY || !process.env.STRIPE_SECRET_KEY) {
            return res.status(500).json({ success: false, message: 'Server configuration error: Missing Stripe keys', type: 'error' });
        }

        res.json({ success: true, user: userData, cart, stripeKey: process.env.STRIPE_PUBLISHABLE_KEY });
    } catch (error) {
        console.error('Book package error:', error);
        res.status(500).json({ success: false, message: 'Error loading booking page', type: 'error' });
    }
};

// Confirm Package Booking
export const confirmPackageBooking = async (req, res) => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User ID not available', type: 'error' });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: 'No such user exists in the database', type: 'error' });
        }

        const {
            items, firstname, lastname, email, phone, country, street_1, street_2, city, state, postal_code, notes,
            firstname_booking, client_secret, appliedCouponCode
        } = req.body;

        // Validate required fields
        if (!items || !Array.isArray(items) || items.length === 0 || !firstname_booking || !client_secret ||
            !firstname || !lastname || !email || !phone || !country || !street_1 || !city || !state || !postal_code) {
            return res.status(400).json({ success: false, message: 'All required fields are required', type: 'error' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format', type: 'error' });
        }

        // Convert country to ISO 3166-1 alpha-2 code
        const isoCountry = countryToIsoCode[country] || country;
        if (!isoCountry || isoCountry.length !== 2) {
            return res.status(400).json({ success: false, message: 'Invalid country code. Please select a valid country.', type: 'error' });
        }

        // Validate and fetch package data
        const packageIds = items.map(item => item.packageId);
        const packages = await packageModel.find({ _id: { $in: packageIds } });
        if (packages.length !== items.length) {
            return res.status(400).json({ success: false, message: 'Some packages not found or not active', type: 'error' });
        }

        // Create a map of package data for price lookup
        const packageMap = packages.reduce((map, pkg) => {
            map[pkg._id.toString()] = pkg;
            return map;
        }, {});

        // Calculate subtotal
        let subtotal = items.reduce((sum, item) => {
            const price = packageMap[item.packageId].salePrice || packageMap[item.packageId].regularPrice;
            return sum + parseInt(item.quantity) * price;
        }, 0);

        // Apply coupon if provided
        let discount = 0;
        let coupon = null;
        if (appliedCouponCode) {
            coupon = await couponSchema.findOne({ code: appliedCouponCode, isActive: true });
            if (!coupon) {
                return res.status(400).json({ success: false, message: 'Invalid or inactive coupon', type: 'error' });
            }
            if (coupon.expiryDate < new Date()) {
                return res.status(400).json({ success: false, message: 'Coupon has expired', type: 'error' });
            }
            if (coupon.usedCount >= coupon.usageLimit) {
                return res.status(400).json({ success: false, message: 'Coupon usage limit reached', type: 'error' });
            }
            const userUsageCount = coupon.usedBy ? coupon.usedBy.filter(entry => entry.userId.equals(userId)).length : 0;
            if (coupon.restrictToUser && coupon.restrictToUser.equals(userId)) {
                if (userUsageCount >= coupon.usageLimit) {
                    return res.status(400).json({ success: false, message: 'You have reached the usage limit for this coupon', type: 'error' });
                }
            } else if (!coupon.restrictToUser && userUsageCount > 0) {
                return res.status(400).json({ success: false, message: 'You have already used this coupon', type: 'error' });
            }
            if (coupon.restrictToUser && !coupon.restrictToUser.equals(userId)) {
                return res.status(400).json({ success: false, message: 'This coupon is not assigned to you', type: 'error' });
            }
            if (subtotal >= coupon.minPurchase) {
                if (coupon.discountType === 'percentage') {
                    discount = subtotal * (coupon.discountValue / 100);
                    if (coupon.maxDiscount > 0) {
                        discount = Math.min(discount, coupon.maxDiscount);
                    }
                } else {
                    discount = coupon.discountValue;
                }
            } else {
                return res.status(400).json({ success: false, message: 'Minimum purchase requirement not met', type: 'error' });
            }
        }

        // Calculate expected total
        const expectedTax = (subtotal - discount) * 0.13;
        const expectedTotal = subtotal - discount + 34 + 34 + expectedTax;

        // Retrieve and verify payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(client_secret.split('_secret_')[0]);
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ success: false, message: `Payment not completed: ${paymentIntent.status}`, type: 'error' });
        }

        // Validate payment intent amount
        if (Math.round(expectedTotal * 100) !== paymentIntent.amount) {
            return res.status(400).json({ success: false, message: 'Payment amount does not match expected total', type: 'error' });
        }

        // Update coupon usage if applied
        if (appliedCouponCode && coupon) {
            await couponSchema.updateOne({ _id: coupon._id }, {
                $inc: { usedCount: 1 },
                $push: { usedBy: { userId, usedAt: new Date() } }
            });
            const couponCheckLimit = await couponSchema.findById(coupon._id);
            if (couponCheckLimit.usedCount >= couponCheckLimit.usageLimit) {
                await couponSchema.updateOne({ _id: couponCheckLimit._id }, { isActive: false });
            }
        }

        // Prepare booking details
        const bookingDetails = {
            userId,
            items: items.map(item => ({
                packageId: item.packageId,
                quantity: parseInt(item.quantity),
                price: packageMap[item.packageId].salePrice || packageMap[item.packageId].regularPrice
            })),
            userDetails: {
                firstname,
                lastname,
                email,
                phone,
                country: isoCountry,
                street_1,
                street_2: street_2 || '',
                city,
                state,
                postal_code: postal_code || '',
                notes: notes || ''
            },
            payment: {
                stripePaymentIntentId: paymentIntent.id,
                paymentStatus: paymentIntent.status,
                paymentType: 'deposit'
            },
            status: 'pending',
            total: paymentIntent.amount / 100,
            discount,
            couponCode: appliedCouponCode || null
        };

        // Save booking to database
        const bookingData = await packageBookingSchema.create(bookingDetails);

        // Clear cart after booking
        const cart = await packageCartSchema.findOne({ userId });
        if (cart) {
            cart.items = [];
            cart.coupon = null;
            await cart.save();
        }

        // Fetch payment details for display
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
        const paymentDetails = {
            cardBrand: paymentMethod.card.brand,
            last4: paymentMethod.card.last4
        };

        // Populate booking for response
        const populatedBooking = await packageBookingSchema.findById(bookingData._id).populate('items.packageId');

        res.json({ success: true, booking: populatedBooking, user: userData, paymentDetails });
    } catch (error) {
        console.error('Confirm booking error:', error);
        res.status(500).json({ success: false, message: error.type === 'StripeInvalidRequestError' ? `Payment error: ${error.message}` : `Error confirming booking: ${error.message}`, type: 'error' });
    }
};

// Confirm Single Package Booking
export const confirmSinglePackageBooking = async (req, res) => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User ID not available', type: 'error' });
        }

        const userData = await userModel.findById(userId);
        if (!userData) {
            return res.status(404).json({ success: false, message: 'No such user exists in the database', type: 'error' });
        }

        const {
            packageId, quantity = 1, firstname, lastname, email, phone, country,
            street_1, street_2, city, state, postal_code, notes, firstname_booking, client_secret, appliedCouponCode
        } = req.body;

        // Validate required fields
        if (!packageId || !firstname_booking || !client_secret || !firstname || !lastname || !email || !phone || !country || !street_1 || !city || !state || !postal_code) {
            return res.status(400).json({ success: false, message: 'Package ID, name on card, payment details, and user details are required', type: 'error' });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ success: false, message: 'Invalid email format', type: 'error' });
        }

        const packageData = await packageModel.findById(packageId);
        if (!packageData) {
            return res.status(400).json({ success: false, message: 'Package not found or not active', type: 'error' });
        }

        // Convert country to ISO 3166-1 alpha-2 code
        const isoCountry = countryToIsoCode[country] || country;
        if (!isoCountry || isoCountry.length !== 2) {
            return res.status(400).json({ success: false, message: 'Invalid country code. Please select a valid country.', type: 'error' });
        }

        // Calculate subtotal
        const price = packageData.salePrice || packageData.regularPrice;
        let subtotal = parseInt(quantity) * price;

        // Apply coupon if provided
        let discount = 0;
        let coupon = null;
        if (appliedCouponCode) {
            coupon = await couponSchema.findOne({ code: appliedCouponCode, isActive: true });
            if (!coupon) {
                return res.status(400).json({ success: false, message: 'Invalid or inactive coupon', type: 'error' });
            }
            if (coupon.expiryDate < new Date()) {
                return res.status(400).json({ success: false, message: 'Coupon has expired', type: 'error' });
            }
            if (coupon.usedCount >= coupon.usageLimit) {
                return res.status(400).json({ success: false, message: 'Coupon usage limit reached', type: 'error' });
            }
            const userUsageCount = coupon.usedBy ? coupon.usedBy.filter(entry => entry.userId.equals(userId)).length : 0;
            if (coupon.restrictToUser && coupon.restrictToUser.equals(userId)) {
                if (userUsageCount >= coupon.usageLimit) {
                    return res.status(400).json({ success: false, message: 'You have reached the usage limit for this coupon', type: 'error' });
                }
            } else if (!coupon.restrictToUser && userUsageCount > 0) {
                return res.status(400).json({ success: false, message: 'You have already used this coupon', type: 'error' });
            }
            if (coupon.restrictToUser && !coupon.restrictToUser.equals(userId)) {
                return res.status(400).json({ success: false, message: 'This coupon is not assigned to you', type: 'error' });
            }
            if (subtotal >= coupon.minPurchase) {
                if (coupon.discountType === 'percentage') {
                    discount = subtotal * (coupon.discountValue / 100);
                    if (coupon.maxDiscount > 0) {
                        discount = Math.min(discount, coupon.maxDiscount);
                    }
                } else {
                    discount = coupon.discountValue;
                }
            } else {
                return res.status(400).json({ success: false, message: 'Minimum purchase requirement not met', type: 'error' });
            }
        }

        // Calculate expected total
        const expectedTax = (subtotal - discount) * 0.13;
        const expectedTotal = subtotal - discount + 34 + 34 + expectedTax;

        // Retrieve and verify payment intent
        const paymentIntent = await stripe.paymentIntents.retrieve(client_secret.split('_secret_')[0]);
        if (paymentIntent.status !== 'succeeded') {
            return res.status(400).json({ success: false, message: `Payment not completed: ${paymentIntent.status}`, type: 'error' });
        }

        // Validate payment intent amount
        if (Math.round(expectedTotal * 100) !== paymentIntent.amount) {
            return res.status(400).json({ success: false, message: 'Payment amount does not match expected total', type: 'error' });
        }

        // Update coupon usage if applied
        if (appliedCouponCode && coupon) {
            await couponSchema.updateOne({ _id: coupon._id }, {
                $inc: { usedCount: 1 },
                $push: { usedBy: { userId, usedAt: new Date() } }
            });
            const couponCheckLimit = await couponSchema.findById(coupon._id);
            if (couponCheckLimit.usedCount >= couponCheckLimit.usageLimit) {
                await couponSchema.updateOne({ _id: couponCheckLimit._id }, { isActive: false });
            }
        }

        // Prepare booking details
        const bookingDetails = {
            userId,
            items: [{
                packageId,
                quantity: parseInt(quantity),
                price
            }],
            userDetails: {
                firstname,
                lastname,
                email,
                phone,
                country: isoCountry,
                street_1,
                street_2: street_2 || '',
                city,
                state,
                postal_code: postal_code || '',
                notes: notes || ''
            },
            payment: {
                stripePaymentIntentId: paymentIntent.id,
                paymentStatus: paymentIntent.status,
                paymentType: 'deposit'
            },
            status: 'pending',
            total: paymentIntent.amount / 100,
            discount,
            couponCode: appliedCouponCode || null
        };

        // Save booking to database
        const bookingData = await packageBookingSchema.create(bookingDetails);

        // Fetch payment details for display
        const paymentMethod = await stripe.paymentMethods.retrieve(paymentIntent.payment_method);
        const paymentDetails = {
            cardBrand: paymentMethod.card.brand,
            last4: paymentMethod.card.last4
        };

        // Populate booking for response
        const populatedBooking = await packageBookingSchema.findById(bookingData._id).populate('items.packageId');

        res.json({ success: true, booking: populatedBooking, user: userData, paymentDetails });
    } catch (error) {
        console.error('Confirm booking error:', error);
        res.status(500).json({ success: false, message: error.type === 'StripeInvalidRequestError' ? `Payment error: ${error.message}` : `Error confirming booking: ${error.message}`, type: 'error' });
    }
};

export const addToPackageCart = async (req, res) => {
    try {
        const { packageId, quantity } = req.body;
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User ID not available', type: 'error' });
        }
        let cart = await packageCartSchema.findOne({ userId });

        if (!cart) {
            cart = new packageCartSchema({ userId, items: [] });
        }

        const packageDetail = await packageModel.findById(packageId);
        if (!packageDetail) {
            return res.status(404).json({ success: false, message: 'Package not found', type: 'error' });
        }

        const existingItemIndex = cart.items.findIndex(item => item.packageId.toString() === packageId);
        if (existingItemIndex > -1) {
            cart.items[existingItemIndex].quantity += quantity;
        } else {
            cart.items.push({ packageId, quantity });
        }

        await cart.save();
        res.json({ success: true, message: 'Package added to cart', type: 'success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', type: 'error' });
    }
};

export const updatePackageCart = async (req, res) => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User ID not available', type: 'error' });
        }

        const cart = await packageCartSchema.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found', type: 'error' });
        }

        if (req.body.packageId && req.body.quantity) {
            const { packageId, quantity } = req.body;
            const itemIndex = cart.items.findIndex(item => item.packageId.toString() === packageId);

            if (itemIndex > -1) {
                if (quantity <= 0) {
                    cart.items.splice(itemIndex, 1);
                } else {
                    cart.items[itemIndex].quantity = quantity;
                }
            } else {
                return res.status(404).json({ success: false, message: 'Item not found in cart', type: 'error' });
            }
        } else {
            return res.status(400).json({ success: false, message: 'Invalid request data', type: 'error' });
        }

        await cart.save();
        res.json({ success: true, message: 'Cart updated', type: 'success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', type: 'error' });
    }
};

export const removeFromPackageCart = async (req, res) => {
    try {
        const { packageId } = req.body;
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'User ID not available', type: 'error' });
        }

        const cart = await packageCartSchema.findOne({ userId });

        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found', type: 'error' });
        }

        cart.items = cart.items.filter(item => item.packageId.toString() !== packageId);
        await cart.save();
        res.json({ success: true, message: 'Item removed from cart', type: 'success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Server error', type: 'error' });
    }
};

export const createPackagePaymentIntent = async (req, res) => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized', type: 'error' });
        }

        const { items, email, couponCode } = req.body;
        if (!items || !Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ success: false, message: 'No items provided', type: 'error' });
        }

        const packageIds = items.map(item => item.packageId);
        const packages = await packageModel.find({ _id: { $in: packageIds } });
        if (packages.length !== items.length) {
            return res.status(400).json({ success: false, message: 'Some packages not found or not active', type: 'error' });
        }

        const packageMap = packages.reduce((map, pkg) => {
            map[pkg._id.toString()] = pkg;
            return map;
        }, {});

        let subtotal = items.reduce((sum, item) => {
            const pkg = packageMap[item.packageId];
            if (!pkg || !item.quantity || item.quantity < 1) return sum;
            return sum + item.quantity * (pkg.salePrice || pkg.regularPrice);
        }, 0);

        let discount = 0;
        let appliedCoupon = null;
        if (couponCode) {
            const coupon = await couponSchema.findOne({ code: couponCode, isActive: true });
            if (!coupon) {
                return res.status(400).json({ success: false, message: 'Invalid or inactive coupon', type: 'error' });
            }
            if (coupon.expiryDate < new Date()) {
                return res.status(400).json({ success: false, message: 'Coupon has expired', type: 'error' });
            }
            if (coupon.usedCount >= coupon.usageLimit) {
                return res.status(400).json({ success: false, message: 'Coupon usage limit reached', type: 'error' });
            }
            const userUsageCount = coupon.usedBy ? coupon.usedBy.filter(entry => entry.userId.equals(userId)).length : 0;
            if (coupon.restrictToUser && coupon.restrictToUser.equals(userId)) {
                if (userUsageCount >= coupon.usageLimit) {
                    return res.status(400).json({ success: false, message: 'You have reached the usage limit for this coupon', type: 'error' });
                }
            } else if (!coupon.restrictToUser && userUsageCount > 0) {
                return res.status(400).json({ success: false, message: 'You have already used this coupon', type: 'error' });
            }
            if (coupon.restrictToUser && !coupon.restrictToUser.equals(userId)) {
                return res.status(400).json({ success: false, message: 'This coupon is not assigned to you', type: 'error' });
            }
            if (subtotal >= coupon.minPurchase) {
                if (coupon.discountType === 'percentage') {
                    discount = subtotal * (coupon.discountValue / 100);
                    if (coupon.maxDiscount > 0) {
                        discount = Math.min(discount, coupon.maxDiscount);
                    }
                } else {
                    discount = coupon.discountValue;
                }
                appliedCoupon = coupon;
            } else {
                return res.status(400).json({ success: false, message: 'Minimum purchase requirement not met', type: 'error' });
            }
        }

        const tax = (subtotal - discount) * 0.13;
        const total = subtotal - discount + 34 + 34 + tax;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100),
            currency: 'usd',
            metadata: {
                userId: userId.toString(),
                couponCode: couponCode || 'none'
            },
            receipt_email: email || (await userModel.findById(userId)).email,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never'
            }
        });

        res.json({ success: true, clientSecret: paymentIntent.client_secret, message: 'Payment intent created successfully', type: 'success' });
    } catch (error) {
        console.error('Create payment intent error:', error);
        res.status(500).json({ success: false, message: 'Server error', type: 'error' });
    }
};

export const createSinglePackagePaymentIntent = async (req, res) => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized', type: 'error' });
        }

        const { packageId, quantity = 1, email, couponCode } = req.body;
        const packageData = await packageModel.findById(packageId);
        if (!packageData) {
            return res.status(400).json({ success: false, message: 'Package not found or not active', type: 'error' });
        }

        const packagePrice = packageData.salePrice || packageData.regularPrice;
        let subtotal = packagePrice * quantity;

        let discount = 0;
        let appliedCoupon = null;
        if (couponCode) {
            const coupon = await couponSchema.findOne({ code: couponCode, isActive: true });
            if (!coupon) {
                return res.status(400).json({ success: false, message: 'Invalid or inactive coupon', type: 'error' });
            }
            if (coupon.expiryDate < new Date()) {
                return res.status(400).json({ success: false, message: 'Coupon has expired', type: 'error' });
            }
            if (coupon.usedCount >= coupon.usageLimit) {
                return res.status(400).json({ success: false, message: 'Coupon usage limit reached', type: 'error' });
            }
            const userUsageCount = coupon.usedBy ? coupon.usedBy.filter(entry => entry.userId.equals(userId)).length : 0;
            if (coupon.restrictToUser && coupon.restrictToUser.equals(userId)) {
                if (userUsageCount >= coupon.usageLimit) {
                    return res.status(400).json({ success: false, message: 'You have reached the usage limit for this coupon', type: 'error' });
                }
            } else if (!coupon.restrictToUser && userUsageCount > 0) {
                return res.status(400).json({ success: false, message: 'You have already used this coupon', type: 'error' });
            }
            if (coupon.restrictToUser && !coupon.restrictToUser.equals(userId)) {
                return res.status(400).json({ success: false, message: 'This coupon is not assigned to you', type: 'error' });
            }
            if (subtotal >= coupon.minPurchase) {
                if (coupon.discountType === 'percentage') {
                    discount = subtotal * (coupon.discountValue / 100);
                    if (coupon.maxDiscount > 0) {
                        discount = Math.min(discount, coupon.maxDiscount);
                    }
                } else {
                    discount = coupon.discountValue;
                }
                appliedCoupon = coupon;
            } else {
                return res.status(400).json({ success: false, message: 'Minimum purchase requirement not met', type: 'error' });
            }
        }

        const tax = (subtotal - discount) * 0.13;
        const total = subtotal - discount + 34 + 34 + tax;

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(total * 100),
            currency: 'usd',
            metadata: {
                userId: userId.toString(),
                packageId: packageId.toString(),
                couponCode: couponCode || 'none'
            },
            receipt_email: email || (await userModel.findById(userId)).email,
            automatic_payment_methods: {
                enabled: true,
                allow_redirects: 'never'
            }
        });

        res.json({ success: true, clientSecret: paymentIntent.client_secret, message: 'Payment intent created successfully', type: 'success' });
    } catch (error) {
        console.error('Create payment intent error:', error);
        res.status(500).json({ success: false, message: 'Server error', type: 'error' });
    }
};

export const getAvailableCoupons = async (req, res) => {
    try {
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized', type: 'error' });
        }

        const coupons = await couponSchema.find({
            isActive: true,
            expiryDate: { $gte: new Date() },
            $expr: { $lt: ["$usedCount", "$usageLimit"] },
            $or: [
                { restrictToUser: null },
                { restrictToUser: userId }
            ]
        }).lean();

        const availableCoupons = coupons.filter(coupon => {
            const userUsageCount = coupon.usedBy ? coupon.usedBy.filter(entry => entry.userId.toString() === userId.toString()).length : 0;
            if (coupon.restrictToUser && coupon.restrictToUser.toString() === userId.toString()) {
                return userUsageCount < coupon.usageLimit;
            }
            return !coupon.usedBy || !coupon.usedBy.some(entry => entry.userId.toString() === userId.toString());
        }).map(coupon => ({
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: coupon.discountValue
        }));

        res.json({ success: true, coupons: availableCoupons });
    } catch (error) {
        console.error('Error fetching available coupons:', error);
        res.status(500).json({ success: false, message: 'Server error', type: 'error' });
    }
};

export const applyCoupon = async (req, res) => {
    try {
        const { couponCode } = req.body;
        const userId = req.id;
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized', type: 'error' });
        }

        if (!couponCode) {
            return res.status(400).json({ success: false, message: 'Coupon code is required', type: 'error' });
        }

        const coupon = await couponSchema.findOne({ code: couponCode.toUpperCase(), isActive: true });

        if (!coupon) {
            return res.status(400).json({ success: false, message: 'Invalid or inactive coupon', type: 'error' });
        }

        if (coupon.expiryDate < new Date()) {
            return res.status(400).json({ success: false, message: 'Coupon has expired', type: 'error' });
        }

        if (coupon.usedCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: 'Coupon usage limit reached', type: 'error' });
        }

        if (coupon.restrictToUser && coupon.restrictToUser.toString() !== userId.toString()) {
            return res.status(400).json({ success: false, message: 'This coupon is not assigned to you', type: 'error' });
        }

        const userUsageCount = coupon.usedBy ? coupon.usedBy.filter(entry => entry.userId.toString() === userId.toString()).length : 0;

        if (coupon.restrictToUser && userUsageCount >= coupon.usageLimit) {
            return res.status(400).json({ success: false, message: 'You have reached the usage limit for this coupon', type: 'error' });
        }

        if (!coupon.restrictToUser && userUsageCount > 0) {
            return res.status(400).json({ success: false, message: 'You have already used this coupon', type: 'error' });
        }

        return res.json({
            success: true,
            coupon: {
                discountType: coupon.discountType,
                discountValue: coupon.discountValue,
                minPurchase: coupon.minPurchase,
                maxDiscount: coupon.maxDiscount
            }
        });
    } catch (error) {
        console.error('Error applying coupon:', error);
        res.status(500).json({ success: false, message: 'Server error', type: 'error' });
    }
};
