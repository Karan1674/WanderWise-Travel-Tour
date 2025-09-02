import adminModel from '../models/adminModel.js';
import agentModel from '../models/agentModel.js';
import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import packageModel from '../models/packageModel.js';
import mongoose from 'mongoose';
import Stripe from 'stripe';
import packageBookingSchema from '../models/packageBookingSchema.js';
import couponSchema from '../models/couponSchema.js';
import CareerSchema from '../models/CareerSchema.js';
import ApplicationSchema from '../models/ApplicationSchema.js';
import faqSchema from '../models/faqSchema.js';
import contactSchema from '../models/contactSchema.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
import dotenv from "dotenv";
dotenv.config();
const stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);


export const AdminDashboard = async (req, res) => {
  try {
    const userId = req.id;
    const isAdmin = req.isAdmin;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const userData = isAdmin
      ? await adminModel.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires').lean()
      : await agentModel.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires').lean();

    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Fetch metrics
    const agentCount = await agentModel.countDocuments({ isActive: true });
    const usersCount = await userModel.countDocuments();
    const enquiryCount = (await contactSchema.countDocuments()) + (await faqSchema.countDocuments());
    const packageEarnings = await packageBookingSchema.aggregate([
      { $match: { 'payment.paymentStatus': 'succeeded' } },
      { $group: { _id: null, totalAmount: { $sum: '$total' } } },
    ]).then(result => result[0]?.totalAmount || 0);

    // Fetch recent bookings (package only)
    const packageBookings = await packageBookingSchema
      .find({ status: { $in: ['approved', 'pending'] } })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate({ path: 'userId', select: 'firstName lastName email' })
      .populate({ path: 'items.packageId', select: 'title' })
      .lean();

    const bookings = packageBookings.flatMap(booking =>
      booking.items.map(item => ({
        user: {
          name: `${booking.userId?.firstName || ''} ${booking.userId?.lastName || ''}`.trim() || 'Unknown User',
          email: booking.userId?.email || 'N/A',
        },
        bookingDate: booking.createdAt || new Date(),
        itemName: item.packageId?.title || 'Unknown Package',
        type: 'Package',
        status: booking.status || 'Unknown',
        quantity: item.quantity || 1,
      }))
    ).sort((a, b) => new Date(b.bookingDate) - new Date(a.bookingDate)).slice(0, 5);

    // Fetch contact enquiries
    const enquiries = await contactSchema
      .find()
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // Fetch recent packages
    const packages = await packageModel
      .find({ status: 'Active' })
      .sort({ createdAt: -1 })
      .limit(4)
      .select('title regularPrice discount featuredImage')
      .lean();

    const packageIds = packages.map(pkg => pkg._id);
    const packageBookingCounts = await packageBookingSchema.aggregate([
      { $unwind: '$items' },
      { $match: { 'items.packageId': { $in: packageIds } } },
      { $group: { _id: '$items.packageId', count: { $sum: '$items.quantity' } } },
    ]);

    const bookingCountMap = new Map(packageBookingCounts.map(b => [b._id.toString(), b.count]));
    const formattedPackages = packages.map(pkg => ({
      _id: pkg._id,
      title: pkg.title || 'Untitled Package',
      regularPrice: pkg.regularPrice || 0,
      discount: pkg.discount || 0,
      featuredImage: pkg.featuredImage || null,
      bookingsCount: bookingCountMap.get(pkg._id.toString()) || 0,
    }));

    // Fetch recent FAQs
    const faqs = await faqSchema
      .find()
      .sort({ createdAt: -1 }) 
      .limit(4)
      .lean();

    res.json({
      success: true,
      message: 'Dashboard data loaded successfully',
      user: userData,
      isAdmin,
      agentCount,
      usersCount,
      enquiryCount,
      packageEarnings,
      bookings,
      enquiries,
      packages: formattedPackages,
      faqs,
    });
  } catch (error) {
    console.error('Error loading admin dashboard:', error);
    res.status(500).json({ success: false, message: 'Server error loading dashboard' });
  }
};


export const getAllAgents = async (req, res) => {
    try {
        const { page = 1, search = '', statusFilter = 'all' } = req.query;
        const limit = 3;
        const pageNum = Math.max(1, Number(page));
        const skip = (pageNum - 1) * limit;
        const adminId = req.id;
        const isAdmin = req.isAdmin;

        if (!adminId) {
            return res.json({ message: 'Unauthorized: Please log in', type: 'error', success: false });
        }

        const userData = await adminModel.findById(adminId).select('-password -resetPasswordToken -resetPasswordExpires');
        if (!userData) {
            return res.json({ message: 'Admin not found', type: 'error', success: false });
        }

        let query = { admin: adminId };
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } }
            ];
        }

        if (statusFilter === 'Active') {
            query.isActive = true;
        } else if (statusFilter === 'notActive') {
            query.isActive = false;
        }

        const totalAgents = await agentModel.countDocuments(query);
        const totalPages = Math.ceil(totalAgents / limit) || 1;

        const agents = await agentModel
            .find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            message: 'Agents fetched successfully',
            type: 'success',
            allAgents: agents,
            search,
            currentPage: pageNum,
            totalPages,
            statusFilter,
        });
    } catch (error) {
        console.error('Error fetching agents:', error);
        res.status(500).json({ message: 'Server error fetching agents', type: 'error', success: false });
    }
};


export const newAgent = async (req, res) => {
    try {
        const adminId = req.id;
        const {
            firstName,
            lastName,
            countryCode,
            phone,
            city,
            country,
            password,
            confirmPassword,
            email,
            confirmEmail,
        } = req.body;

        if (!firstName || !lastName || !countryCode || !phone || !city || !country || !email || !confirmEmail || !password || !confirmPassword) {
            return res.json({ message: 'All fields are required', type: 'error', success: false });
        }

        if (password !== confirmPassword) {
            return res.json({ message: 'Passwords do not match', type: 'error', success: false });
        }

        if (email !== confirmEmail) {
            return res.json({ message: 'Emails do not match', type: 'error', success: false });
        }

        const existingAgent = await agentModel.findOne({ email });
        if (existingAgent) {
            return res.json({ message: 'Agent already exists', type: 'error', success: false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const agent = new agentModel({
            firstName,
            lastName,
            countryCode,
            phone,
            city,
            country,
            email,
            password: hashedPassword,
            admin: adminId
        });

        await agent.save();
        res.json({ message: 'Agent created successfully', type: 'success', success: true });
    } catch (error) {
        console.error("Agent registration error:", error.message);
        res.status(500).json({ message: 'Server error during agent registration', type: 'error', success: false });
    }
};


export const editAgent = async (req, res) => {
    try {
        const isAdmin = req.isAdmin;
        const { editAgentId } = req.params;
        const { firstName, lastName, email, phone, countryCode, city, country, state, address, description, day, month, year, isActive } = req.body;

        if (!isAdmin) {
            return res.json({ message: 'Unauthorized: Admin access required', type: 'error', success: false });
        }

        if (!firstName || !lastName || !email || !phone) {
            return res.json({ message: 'Missing required fields', type: 'error', success: false });
        }

        let dateOfBirth;
        if (day && month && year) {
            dateOfBirth = new Date(`${year}-${month}-${day}`);
            if (isNaN(dateOfBirth)) {
                return res.json({ message: 'Invalid date of birth', type: 'error', success: false });
            }
        }

        const editAgent = {
            firstName,
            lastName,
            email,
            phone,
            countryCode,
            city,
            country,
            state,
            address,
            description,
            isActive: isActive === 'true',
            ...(dateOfBirth && { dateOfBirth }),
        };

        if (req.file) {
            editAgent.profilePic = req.file.filename;
            const agent = await agentModel.findById(editAgentId);
            if (!agent) {
                return res.status(404).json({ message: 'Agent not found', type: 'error', success: false });
            }

            if (agent.profilePic) {
                const filePath = join(__dirname, '../Uploads/profiles', agent.profilePic);
                try {
                    await fs.unlink(filePath);
                    console.log(`Profile picture deleted: ${filePath}`);
                } catch (fileError) {
                    console.error(`Error deleting profile picture: ${fileError.message}`);
                }
            }
        }

        const updatedAgent = await agentModel.findByIdAndUpdate(
            editAgentId,
            { $set: editAgent },
            { new: true, runValidators: true }
        );

        if (!updatedAgent) {
            return res.json({ message: 'Agent not found', type: 'error', success: false });
        }

        res.json({ message: 'Agent updated successfully', type: 'success', success: true });
    } catch (error) {
        console.error("Error updating Agent:", error);
        res.status(500).json({ message: 'Failed to update agent', type: 'error', success: false });
    }
};


export const deleteAgent = async (req, res) => {
    try {
        const isAdmin = req.isAdmin;
        const { agentId } = req.params;

        if (!isAdmin) {
            return res.json({ message: 'Unauthorized: Admin access required', type: 'error', success: false });
        }

        const agent = await agentModel.findById(agentId);
        if (!agent) {
            return res.json({ message: 'Agent not found', type: 'error', success: false });
        }

        if (agent.profilePic) {
            const filePath = join(__dirname, '../Uploads/profiles', agent.profilePic);
            try {
                await fs.unlink(filePath);
                console.log(`Profile picture deleted: ${filePath}`);
            } catch (fileError) {
                console.error(`Error deleting profile picture: ${fileError.message}`);
            }
        }

        await agentModel.findByIdAndDelete(agentId);
        res.json({ message: 'Agent deleted successfully', type: 'success', success: true, redirect: '/db-admin-created-agents' });
    } catch (error) {
        console.error("Error deleting agent:", error);
        res.status(500).json({ message: 'Failed to delete agent', type: 'error', success: false });
    }
};



export const getSignedInUsers = async (req, res) => {
    try {
        const adminId = req.id;
        const isAdmin = req.isAdmin;
        const { search = '', page = 1 } = req.query;
        const limit = 3;

        if (!adminId) {
            console.log("Unauthorized: Admin ID missing");
            return res.json({ message: 'Unauthorized: Admin ID missing' });
        }

        const adminData = await adminModel.findById(adminId);
        if (!adminData) {
            console.log("Admin not found");
            return res.json({ message: 'Admin not found' });
        }

        if (!isAdmin) {
            console.log("User is not authorized to view signed-in users");
            return res.json({ message: 'Unauthorized: Admin access required' });
        }

        const searchQuery = search
            ? {
                $or: [
                    { firstName: { $regex: search, $options: 'i' } },
                    { lastName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } },
                ],
            }
            : {};

        const users = await userModel
            .find(searchQuery)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const totalUsers = await userModel.countDocuments(searchQuery);
        const totalPages = Math.ceil(totalUsers / limit);

        res.json({
            allUsers: users,
            search,
            statusFilter: null,
            currentPage: parseInt(page),
            totalPages: totalPages || 1,
        });
    } catch (error) {
        console.error("Error fetching signed-in users:", error);
        res.status(500).json({ message: 'Server error fetching users' });
    }
};



// Validation functionality to ensure the packages creation
export const validatePackage = (data, isActive) => {
    const errors = [];

    if (!data.title) errors.push('Title is required');
    if (!data.createdBy) errors.push('CreatedBy ID is required');
    if (!data.createdByModel) errors.push('CreatedByModel is required');
    if (!['Admin', 'Agent'].includes(data.createdByModel)) errors.push('Invalid createdByModel (must be Admin or Agent)');
    if (!data.status || !['Pending', 'Active', 'Expired'].includes(data.status)) {
        errors.push('Valid status is required (Pending, Active, Expired)');
    }

    if (!data.description) errors.push('Description is required');
    if (!data.packageType || !['Adventure', 'Cultural', 'Luxury', 'Family', 'Wellness', 'Eco'].includes(data.packageType)) {
        errors.push('Valid package type is required (Adventure, Cultural, Luxury, Family, Wellness, Eco)');
    }

    if (isActive) {
        if (!data.groupSize || isNaN(data.groupSize) || data.groupSize <= 0) errors.push('Valid group size is required');
        if (!data.tripDuration?.days || isNaN(data.tripDuration.days) || data.tripDuration.days <= 0) errors.push('Valid number of days is required');
        if (!data.tripDuration?.nights || isNaN(data.tripDuration.nights) || data.tripDuration.nights < 0) errors.push('Valid number of nights is required');
        if (!data.category || !['Adult', 'Child', 'Couple'].includes(data.category)) errors.push('Valid category is required (Adult, Child, Couple)');
        if (!data.regularPrice || isNaN(data.regularPrice) || data.regularPrice <= 0) errors.push('Valid regular price is required');
        if (!data.multipleDepartures || !Array.isArray(data.multipleDepartures) || data.multipleDepartures.length === 0) {
            errors.push('At least one departure is required');
        } else {
            data.multipleDepartures.forEach((dep, index) => {
                if (!dep.location) errors.push(`Departure ${index + 1}: Location is required`);
                if (!dep.dateTime || new Date(dep.dateTime).toString() === 'Invalid Date') {
                    errors.push(`Departure ${index + 1}: Valid date and time is required`);
                }
            });
        }
        if (!data.itineraryDescription) errors.push('Itinerary description is required');
        if (!data.itineraryDays || !Array.isArray(data.itineraryDays) || data.itineraryDays.length === 0) {
            errors.push('At least one itinerary day is required');
        } else {
            data.itineraryDays.forEach((day, index) => {
                if (!day.day || isNaN(day.day) || day.day <= 0) errors.push(`Itinerary Day ${index + 1}: Valid day number is required`);
                if (!day.activities || !Array.isArray(day.activities) || day.activities.length === 0) {
                    errors.push(`Itinerary Day ${index + 1}: At least one activity is required`);
                } else {
                    day.activities.forEach((activity, actIndex) => {
                        if (!activity.title) errors.push(`Itinerary Day ${index + 1}, Activity ${actIndex + 1}: Title is required`);
                        if (!activity.sub_title) errors.push(`Itinerary Day ${index + 1}, Activity ${actIndex + 1}: Sub-title is required`);
                        if (!activity.start_time) errors.push(`Itinerary Day ${index + 1}, Activity ${actIndex + 1}: Start time is required`);
                        if (!activity.end_time) errors.push(`Itinerary Day ${index + 1}, Activity ${actIndex + 1}: End time is required`);
                        if (!activity.type || !['sightseeing', 'activity', 'meal', 'transport', 'accommodation'].includes(activity.type)) {
                            errors.push(`Itinerary Day ${index + 1}, Activity ${actIndex + 1}: Valid type is required`);
                        }
                    });
                }
            });
        }
        if (!data.programDays || !Array.isArray(data.programDays) || data.programDays.length === 0) {
            errors.push('At least one program day is required');
        } else {
            data.programDays.forEach((day, index) => {
                if (!day.day || isNaN(day.day) || day.day <= 0) errors.push(`Program Day ${index + 1}: Valid day number is required`);
                if (!day.title) errors.push(`Program Day ${index + 1}: Title is required`);
                if (!day.description) errors.push(`Program Day ${index + 1}: Description is required`);
            });
        }
        if (!data.inclusions || !Array.isArray(data.inclusions) || data.inclusions.length === 0) errors.push('At least one inclusion is required');
        if (!data.exclusions || !Array.isArray(data.exclusions) || data.exclusions.length === 0) errors.push('At least one exclusion is required');
        if (!data.activityTypes || !Array.isArray(data.activityTypes) || data.activityTypes.length === 0) errors.push('At least one activity type is required');
        if (!data.highlights || !Array.isArray(data.highlights) || data.highlights.length === 0) errors.push('At least one highlight is required');
        if (!data.additionalCategories || !Array.isArray(data.additionalCategories) || data.additionalCategories.length === 0) {
            errors.push('At least one additional category is required');
        }
        if (!data.keywords || !Array.isArray(data.keywords) || data.keywords.length === 0) errors.push('At least one keyword is required');
        if (!data.quote) errors.push('Quote is required');
        if (!data.difficultyLevel || !['Easy', 'Moderate', 'Challenging'].includes(data.difficultyLevel)) {
            errors.push('Valid difficulty level is required (Easy, Moderate, Challenging)');
        }
        if (!data.latitude || isNaN(data.latitude)) errors.push('Valid latitude is required');
        if (!data.longitude || isNaN(data.longitude)) errors.push('Valid longitude is required');
        if (!data.destinationAddress) errors.push('Destination address is required');
        if (!data.destinationCountry) errors.push('Destination country is required');
        if (!data.gallery || !Array.isArray(data.gallery) || data.gallery.length === 0) errors.push('At least one gallery image is required');
        if (!data.featuredImage) errors.push('Featured image is required');
    }

    if (data.gallery && data.gallery.length > 8) errors.push('Maximum 8 gallery images allowed');

    return errors;
};

// GET - Fetch all packages
export const getAllPackages = async (req, res) => {
    try {
        const { page = 1, search = '', statusFilter = 'all' } = req.query;
        const limit = 3;
        const pageNum = Math.max(1, Number(page));
        const skip = (pageNum - 1) * limit;
        const userId = req.id;
        const isAdmin = req.isAdmin;

        if (!userId) {
            return res.json({
                success: false,
                message: 'Unauthorized: Please log in',
            });
        }

        let userData = await adminModel.findById(userId);
        let query = {};

        if (isAdmin) {
            const agentIds = await agentModel.find({ admin: userId }).distinct('_id');
            query = {
                $or: [
                    { createdBy: userId, createdByModel: 'Admin' },
                    { createdBy: { $in: agentIds }, createdByModel: 'Agent' }
                ]
            };
        } else {
            userData = await agentModel.findById(userId);
            if (!userData) {
                return res.json({
                    success: false,
                    message: 'User not found',
                });
            }
            const adminId = userData.admin;
            const agentIds = await agentModel.find({ admin: adminId }).distinct('_id');
            query = {
                $or: [
                    { createdBy: adminId, createdByModel: 'Admin' },
                    { createdBy: { $in: agentIds }, createdByModel: 'Agent' }
                ]
            };
        }

        if (search) query.title = { $regex: search, $options: 'i' };
        if (statusFilter !== 'all') query.status = statusFilter;

        const totalPackages = await packageModel.countDocuments(query);
        const totalPages = Math.ceil(totalPackages / limit) || 1;

        const allPackages = await packageModel
            .find(query)
            .populate('createdBy', 'firstName lastName email')
            .populate('updatedBy', 'firstName lastName email')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({
            success: true,
            message: 'Packages fetched successfully',
            allPackages, 
            search, 
            currentPage: pageNum, 
            totalPages, 
            statusFilter 
        });
    } catch (error) {
        console.error('Error fetching packages:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching packages',
        });
    }
};


//  Fetch single package for preview/edit
export const getPackage = async (req, res) => {
    try {
        const packageId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(packageId)) {
            return res.json({
                success: false,
                message: 'Invalid package ID',
            });
        }

        const packageData = await packageModel.findById(packageId)
            .populate('createdBy', 'firstName lastName email')
            .populate('updatedBy', 'firstName lastName email')
            .lean();

        if (!packageData) {
            return res.json({
                success: false,
                message: 'Package not found',
            });
        }

        packageData.itineraryDays = packageData.itineraryDays || [];
        packageData.itineraryDays = packageData.itineraryDays.map((day, index) => ({
            day: day.day || index + 1,
            activities: Array.isArray(day.activities) ? day.activities : [{ title: '', sub_title: '', start_time: '', end_time: '', type: '' }]
        }));

        return res.status(200).json({
            success: true,
            message: 'Package fetched successfully',
            package: packageData
        });
    } catch (error) {
        console.error('Error fetching package:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error fetching package',
        });
    }
};

// Add new package
export const addPackage = async (req, res) => {
    try {
        const data = req.body;

        let createdBy, createdByModel;
        if (req.isAdmin) {
            createdBy = req.id;
            createdByModel = 'Admin';
        } else {
            const userData = await agentModel.findById(req.id);
            if (!userData) {
                return res.json({
                    success: false,
                    message: 'Agent not found',

                });
            }
            createdBy = req.id;
            createdByModel = 'Agent';
        }

        data.createdBy = createdBy;
        data.createdByModel = createdByModel;
        data.status = data.status || 'Pending';

        if (data.multipleDepartures) {
            let departures = data.multipleDepartures;
            if (typeof departures === 'string') {
                try {
                    departures = JSON.parse(departures);
                } catch (e) {
                    return res.json({
                        success: false,
                        message: 'Invalid multipleDepartures format',
                    });
                }
            }
            if (!Array.isArray(departures)) {
                departures = [departures];
            }
            for (let i = 0; i < departures.length; i++) {
                const dep = departures[i];
                if (!dep.location || !dep.dateTime || new Date(dep.dateTime).toString() === 'Invalid Date') {
                    return res.json({
                        success: false,
                        message: `Departure ${i + 1}: Valid location and date/time are required`,
                    });
                }
            }
            data.multipleDepartures = departures.map(dep => ({
                location: dep.location,
                dateTime: new Date(dep.dateTime)
            }));
        } else {
            data.multipleDepartures = [];
        }

        if (data.itineraryDays) {
            let itineraryDays = data.itineraryDays;
            if (typeof itineraryDays === 'string') {
                try {
                    itineraryDays = JSON.parse(itineraryDays);
                } catch (e) {
                    return res.json({
                        success: false,
                        message: 'Invalid itineraryDays format',
                    });
                }
            }
            if (!Array.isArray(itineraryDays)) {
                itineraryDays = [itineraryDays];
            }
            data.itineraryDays = itineraryDays.map((day, index) => ({
                day: Number(day.day) || index + 1,
                activities: Array.isArray(day.activities) ? day.activities.map(act => ({
                    title: act.title || '',
                    sub_title: act.sub_title || '',
                    start_time: act.start_time || '',
                    end_time: act.end_time || '',
                    type: act.type || ''
                })) : []
            }));
        } else {
            data.itineraryDays = [];
        }

        if (data.programDays) {
            let programDays = data.programDays;
            if (typeof programDays === 'string') {
                try {
                    programDays = JSON.parse(programDays);
                } catch (e) {
                    return res.json({
                        success: false,
                        message: 'Invalid programDays format',
                    });
                }
            }
            if (!Array.isArray(programDays)) {
                programDays = [programDays];
            }
            data.programDays = programDays.map((day, index) => ({
                day: Number(day.day) || index + 1,
                title: day.title || '',
                description: day.description || ''
            }));
        } else {
            data.programDays = [];
        }

        data.inclusions = data.inclusions ? (Array.isArray(data.inclusions) ? data.inclusions : JSON.parse(data.inclusions || '[]')).filter(i => i) : [];
        data.exclusions = data.exclusions ? (Array.isArray(data.exclusions) ? data.exclusions : JSON.parse(data.exclusions || '[]')).filter(e => e) : [];
        data.activityTypes = data.activityTypes ? (Array.isArray(data.activityTypes) ? data.activityTypes : JSON.parse(data.activityTypes || '[]')).filter(a => a) : [];
        data.highlights = data.highlights ? (Array.isArray(data.highlights) ? data.highlights : JSON.parse(data.highlights || '[]')).filter(h => h) : [];
        data.additionalCategories = data.additionalCategories ? (Array.isArray(data.additionalCategories) ? data.additionalCategories : JSON.parse(data.additionalCategories || '[]')).filter(c => c) : [];
        if (data.additionalCategoriesInput) {
            data.additionalCategories.push(...data.additionalCategoriesInput.split(',').map(c => c.trim()).filter(c => c));
            delete data.additionalCategoriesInput;
        }
        data.keywords = data.keywords ? data.keywords.split(',').map(k => k.trim()).filter(k => k) : [];

        data.tripDuration = {
            days: Number(data.tripDuration?.days) || 0,
            nights: Number(data.tripDuration?.nights) || 0
        };
        data.groupSize = Number(data.groupSize) || undefined;
        data.regularPrice = Number(data.regularPrice) || undefined;
        data.salePrice = Number(data.salePrice) || undefined;
        data.discount = Number(data.discount) || undefined;
        data.latitude = Number(data.latitude) || undefined;
        data.longitude = Number(data.longitude) || undefined;
        data.destinationAddress = data.destinationAddress || undefined;
        data.destinationCountry = data.destinationCountry || undefined;

        let gallery = [];
        if (req.files && req.files['gallery']) {
            gallery = req.files['gallery'].map(file => file.filename);
        }
        let featuredImage = '';
        if (req.files && req.files['featuredImage']) {
            featuredImage = req.files['featuredImage'][0].filename;
        }
        data.gallery = gallery;
        data.featuredImage = featuredImage;

        const validationErrors = validatePackage(data, data.status === 'Active');
        if (validationErrors.length > 0) {
            if (req.files && req.files['gallery']) {
                for (const file of req.files['gallery']) {
                    try {
                        await fs.unlink(join(__dirname, '../Uploads/gallery', file.filename));
                    } catch (err) {
                        console.error(`Failed to clean up gallery image ${file.filename}:`, err);
                    }
                }
            }
            if (req.files && req.files['featuredImage']) {
                try {
                    await fs.unlink(join(__dirname, '../Uploads/gallery', req.files['featuredImage'][0].filename));
                } catch (err) {
                    console.error(`Failed to clean up featured image ${req.files['featuredImage'][0].filename}:`, err);
                }
            }
            return res.json({
                success: false,
                message: validationErrors.join(', '),
            });
        }

        Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);

        const newPackage = new packageModel(data);
        await newPackage.save();
        return res.status(200).json({
            success: true,
            message: 'Package created successfully',
            data: { packageId: newPackage._id }
        });
    } catch (error) {
        console.error('Error adding package:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error adding package',
        });
    }
};

// Edit package
export const editPackage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.id;
        const isAdmin = req.isAdmin;

        if (!id) {
            return res.json({
                success: false,
                message: 'Invalid package ID',
            });
        }

        const data = req.body;

        let createdBy, createdByModel;
        if (req.isAdmin) {
            createdBy = req.id;
            createdByModel = 'Admin';
        } else {
            const userData = await agentModel.findById(req.id);
            if (!userData) {
                return res.json({
                    success: false,
                    message: 'Agent not found',
                });
            }
            createdBy = req.id;
            createdByModel = 'Agent';
        }
        data.createdBy = createdBy;
        data.createdByModel = createdByModel;
        data.status = data.status || 'Pending';

        if (data.multipleDepartures) {
            let departures = data.multipleDepartures;
            if (typeof departures === 'string') {
                try {
                    departures = JSON.parse(departures);
                } catch (e) {
                    return res.json({
                        success: false,
                        message: 'Invalid multipleDepartures format',
                    });
                }
            }
            if (!Array.isArray(departures)) {
                departures = [departures];
            }
            for (let i = 0; i < departures.length; i++) {
                const dep = departures[i];
                if (!dep.location || !dep.dateTime || new Date(dep.dateTime).toString() === 'Invalid Date') {
                    return res.json({
                        success: false,
                        message: `Departure ${i + 1}: Valid location and date/time are required`,
                    });
                }
            }
            data.multipleDepartures = departures.map(dep => ({
                location: dep.location,
                dateTime: new Date(dep.dateTime)
            }));
        } else {
            data.multipleDepartures = [];
        }

        if (data.itineraryDays) {
            let itineraryDays = data.itineraryDays;
            if (typeof itineraryDays === 'string') {
                try {
                    itineraryDays = JSON.parse(itineraryDays);
                } catch (e) {
                    return res.json({
                        success: false,
                        message: 'Invalid itineraryDays format',
                    });
                }
            }
            if (!Array.isArray(itineraryDays)) {
                itineraryDays = [itineraryDays];
            }
            data.itineraryDays = itineraryDays.map((day, index) => ({
                day: Number(day.day) || index + 1,
                activities: Array.isArray(day.activities) ? day.activities.map(act => ({
                    title: act.title || '',
                    sub_title: act.sub_title || '',
                    start_time: act.start_time || '',
                    end_time: act.end_time || '',
                    type: act.type || ''
                })) : []
            }));
        } else {
            data.itineraryDays = [];
        }

        if (data.programDays) {
            let programDays = data.programDays;
            if (typeof programDays === 'string') {
                try {
                    programDays = JSON.parse(programDays);
                }catch (e) {
                    return res.status(400).json({
                        success: false,
                        message: 'Invalid programDays format',
                    });
                }
            }
            if (!Array.isArray(programDays)) {
                programDays = [programDays];
            }
            data.programDays = programDays.map((day, index) => ({
                day: Number(day.day) || index + 1,
                title: day.title || '',
                description: day.description || ''
            }));
        } else {
            data.programDays = [];
        }

        data.inclusions = data.inclusions ? (Array.isArray(data.inclusions) ? data.inclusions : JSON.parse(data.inclusions || '[]')).filter(i => i) : [];
        data.exclusions = data.exclusions ? (Array.isArray(data.exclusions) ? data.exclusions : JSON.parse(data.exclusions || '[]')).filter(e => e) : [];
        data.activityTypes = data.activityTypes ? (Array.isArray(data.activityTypes) ? data.activityTypes : JSON.parse(data.activityTypes || '[]')).filter(a => a) : [];
        data.highlights = data.highlights ? (Array.isArray(data.highlights) ? data.highlights : JSON.parse(data.highlights || '[]')).filter(h => h) : [];
        data.additionalCategories = data.additionalCategories ? (Array.isArray(data.additionalCategories) ? data.additionalCategories : JSON.parse(data.additionalCategories || '[]')).filter(c => c) : [];
        if (data.additionalCategoriesInput) {
            data.additionalCategories.push(...data.additionalCategoriesInput.split(',').map(c => c.trim()).filter(c => c));
            delete data.additionalCategoriesInput;
        }
        data.keywords = data.keywords ? data.keywords.split(',').map(k => k.trim()).filter(k => k) : [];

        data.tripDuration = {
            days: Number(data.tripDuration?.days) || 0,
            nights: Number(data.tripDuration?.nights) || 0
        };
        data.groupSize = Number(data.groupSize) || undefined;
        data.regularPrice = Number(data.regularPrice) || undefined;
        data.salePrice = Number(data.salePrice) || undefined;
        data.discount = Number(data.discount) || undefined;
        data.latitude = Number(data.latitude) || undefined;
        data.longitude = Number(data.longitude) || undefined;
        data.destinationAddress = data.destinationAddress || undefined;
        data.destinationCountry = data.destinationCountry || undefined;

        const existingPackage = await packageModel.findById(id);
        if (!existingPackage) {
            return res.json({
                success: false,
                message: 'Package not found',
            });
        }

        let gallery = existingPackage.gallery || [];
        if (data.deletedImages) {
            let imagesToDelete = data.deletedImages;
            if (typeof imagesToDelete === 'string') {
                imagesToDelete = imagesToDelete.split(',').map(img => img.trim()).filter(img => img);
            }
            for (const image of imagesToDelete) {
                if (gallery.includes(image)) {
                    try {
                        await fs.unlink(join(__dirname, '../Uploads/gallery', image));
                        console.log(`Deleted image: ${image}`);
                    } catch (err) {
                        console.error(`Failed to delete image ${image}:`, err);
                    }
                }
            }
            gallery = gallery.filter(image => !imagesToDelete.includes(image));
        }

        if (req.files && req.files['gallery']) {
            const newImages = req.files['gallery'].map(file => file.filename);
            gallery = [...gallery, ...newImages].slice(0, 8);
        }

        let featuredImage = existingPackage.featuredImage;
        if (req.files && req.files['featuredImage']) {
            if (featuredImage) {
                try {
                    await fs.unlink(join(__dirname, '../Uploads/gallery', featuredImage));
                    console.log(`Deleted featured image: ${featuredImage}`);
                } catch (err) {
                    console.error(`Failed to delete featured image ${featuredImage}:`, err);
                }
            }
            featuredImage = req.files['featuredImage'][0].filename;
        }

        data.gallery = gallery;
        data.featuredImage = featuredImage;

        const validationErrors = validatePackage(data, data.status === 'Active');
        if (validationErrors.length > 0) {
            if (req.files && req.files['gallery']) {
                for (const file of req.files['gallery']) {
                    try {
                        await fs.unlink(join(__dirname, '../Uploads/gallery', file.filename));
                    } catch (err) {
                        console.error(`Failed to clean up gallery image ${file.filename}:`, err);
                    }
                }
            }
            if (req.files && req.files['featuredImage']) {
                try {
                    await fs.unlink(join(__dirname, '../Uploads/gallery', req.files['featuredImage'][0].filename));
                } catch (err) {
                    console.error(`Failed to clean up featured image ${req.files['featuredImage'][0].filename}:`, err);
                }
            }
            return res.json({
                success: false,
                message: validationErrors.join(', '),
            });
        }

        Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
        data.updatedBy = userId;
        data.updatedByModel = isAdmin ? 'Admin' : 'Agent';
        data.updatedAt = new Date();

        const updatedPackage = await packageModel.findByIdAndUpdate(id, data, { new: true });
        if (!updatedPackage) {
            return res.json({
                success: false,
                message: 'Package not found',
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Package updated successfully',
            data: { packageId: updatedPackage._id }
        });
    } catch (error) {
        console.error('Error updating package:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error updating package',
            data: {}
        });
    }
};

// Delete package
export const deletePackage = async (req, res) => {
    try {
        const { id } = req.params;

        let adminId;
        if (req.isAdmin) {
            adminId = req.id;
        } else {
            const userData = await agentModel.findById(req.id);
            if (!userData) {
                return res.json({
                    success: false,
                    message: 'Unauthorized: User not found',
                });
            }
            adminId = userData.admin;
        }

        const packagePacket = await packageModel.findById(id);
        if (!packagePacket) {
            return res.json({
                success: false,
                message: 'Package not found',
            });
        }

        const uploadsDir = join(__dirname, '../Uploads/gallery');

        if (packagePacket.gallery && packagePacket.gallery.length > 0) {
            for (const image of packagePacket.gallery) {
                try {
                    await fs.unlink(join(uploadsDir, image));
                } catch (err) {
                    console.error(`Failed to delete image ${image}:`, err);
                }
            }
        }

        if (packagePacket.featuredImage) {
            try {
                await fs.unlink(join(uploadsDir, packagePacket.featuredImage));
            } catch (err) {
                console.error(`Failed to delete featured image ${packagePacket.featuredImage}:`, err);
            }
        }

        await packageModel.findByIdAndDelete(id);

        return res.json({
            success: true,
            message: 'Package deleted successfully',
        });
    } catch (error) {
        console.error('Error deleting package:', error);
        return res.status(500).json({
            success: false,
            message: 'Failed to delete package',
        });
    }
};




// Get Admin and Agent Profile Details
export const getAdminAgentProfile = async (req, res) => {
  try {
    const userId = req.id;
    const isAdmin = req.isAdmin;

    if (!userId) {
      console.log('No user ID in request');
      return res.json({ success: false, message: 'Unauthorized: No user ID provided' });
    }

    let user = await adminModel.findById(userId);
    if (user) {
      console.log('Fetched admin profile for:', userId);
      return res.status(200).json({ success: true, user, isAdmin });
    }

    user = await agentModel.findById(userId).populate('admin');
    if (user) {
      console.log('Fetched agent profile for:', userId);
      return res.status(200).json({ success: true, user, isAdmin });
    }

    console.log('No admin or agent found for:', userId);
    return res.status(200).json({ success: false, message: 'User not found' });
  } catch (error) {
    console.error('Get admin/agent profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

// Update Agent and Admin Profile
export const updateAdminAgentProfile = async (req, res) => {
  try {
    const userId = req.id;

    if (!userId) {
      console.log('No user ID in request');
      return res.json({ success: false, message: 'Unauthorized: No user ID provided' });
    }

    const { firstName, lastName, email, phone, countryCode, dateOfBirth, country, state, city, address, description } = req.body;

    if (!firstName || !lastName || !email || !phone) {
      console.log('Missing required fields:', { firstName, lastName, email, phone });
      return res.status(400).json({ success: false, message: 'First name, last name, email, and phone are required' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Invalid email format:', email);
      return res.json({ success: false, message: 'Invalid email format' });
    }

    let updateData = { firstName, lastName, email, phone };

    if (dateOfBirth) {
      const dob = new Date(dateOfBirth);
      if (isNaN(dob.getTime())) {
        console.log('Invalid date of birth:', dateOfBirth);
        return res.json({ success: false, message: 'Invalid date of birth' });
      }
      updateData.dateOfBirth = dob;
    }

    let user = await adminModel.findById(userId);
    if (user) {
      if (req.file) {
        if (user.profilePic) {
          const oldImagePath = join(__dirname, '../Uploads/profiles');
          try {
            await unlink(join(oldImagePath, user.profilePic));
            console.log('Deleted old profile picture:', user.profilePic);
          } catch (err) {
            if (err.code !== 'ENOENT') {
              console.error('Error deleting old profile picture:', err);
            }
          }
        }
        updateData.profilePic = req.file.filename;
      }
      const updatedUser = await adminModel.findByIdAndUpdate(userId, updateData, { new: true });
      console.log('Updated admin profile:', userId);
      return res.status(200).json({ success: true, message: 'Admin profile updated successfully', user: updatedUser });
    }

    user = await agentModel.findById(userId);
    if (user) {
      if (!countryCode) {
        console.log('Missing country code for agent:', userId);
        return res.status(400).json({ success: false, message: 'Country code is required for agents' });
      }
      updateData = { ...updateData, countryCode, dateOfBirth: updateData.dateOfBirth || user.dateOfBirth, country, state, city, address, description };
      if (req.file) {
        if (user.profilePic) {
          const oldImagePath = join(__dirname, '../Uploads/profiles');
          try {
            await unlink(join(oldImagePath, user.profilePic));
            console.log('Deleted old profile picture:', user.profilePic);
          } catch (err) {
            if (err.code !== 'ENOENT') {
              console.error('Error deleting old profile picture:', err);
            }
          }
        }
        updateData.profilePic = req.file.filename;
      }
      const updatedUser = await agentModel.findByIdAndUpdate(userId, updateData, { new: true });
      console.log('Updated agent profile:', userId);
      return res.status(200).json({ success: true, message: 'Agent profile updated successfully', user: updatedUser });
    }

    console.log('No admin or agent found for:', userId);
    return res.status(404).json({ success: false, message: 'User not found' });
  } catch (error) {
    console.error('Update admin/agent profile error:', error);
    return res.status(500).json({ success: false, message: 'Server error updating profile' });
  }
};


// Get all package bookings
export const getPackageBookings = async (req, res) => {
  try {
    const userId = req.id;
    const isAdmin = req.isAdmin;

    if (!userId) {
      return res.json({
        success: false,
        message: 'Unauthorized: Please log in',
      });
    }

    let userData;
    if (isAdmin) {
      userData = await adminModel.findById(userId);
    } else {
      userData = await agentModel.findById(userId);
    }

    if (!userData) {
      return res.json({
        success: false,
        message: 'User not found',
      });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 3;
    const search = req.query.search || '';
    const statusFilter = req.query.statusFilter || 'all';

    const searchQuery = {};
    if (search) {
      const matchingPackageIds = await packageModel
        .find({
          title: { $regex: search, $options: 'i' },
        })
        .distinct('_id');

      searchQuery.$or = [
        { 'items.packageId': { $in: matchingPackageIds } },
        { status: { $regex: search, $options: 'i' } },
      ].filter((condition) => condition !== null);
    }

    if (statusFilter !== 'all') {
      searchQuery.status = statusFilter;
    }

    let packageIds = [];
    if (isAdmin) {
      const agentIds = await agentModel.find({ admin: userId }).distinct('_id');
      packageIds = await packageModel
        .find({
          $or: [
            { createdBy: userId, createdByModel: 'Admin' },
            { createdBy: { $in: agentIds }, createdByModel: 'Agent' },
          ],
        })
        .distinct('_id');
    } else {
      const adminId = userData.admin;
      packageIds = await packageModel
        .find({
          $or: [
            { createdBy: userId, createdByModel: 'Agent' },
            { createdBy: adminId, createdByModel: 'Admin' },
          ],
        })
        .distinct('_id');
    }

    if (packageIds.length > 0) {
      searchQuery['items.packageId'] = { $in: packageIds };
    } else if (!search) {
      return res.status(200).json({
        success: true,
        message: 'No packages found for this user',
        bookings: [],
        currentPage: 1,
        totalPages: 1,
        search,
        statusFilter,
      });
    }

    const bookings = await packageBookingSchema
      .find(searchQuery)
      .populate('userId', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .populate('items.packageId', 'title')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalBookings = await packageBookingSchema.countDocuments(searchQuery);
    const totalPages = Math.ceil(totalBookings / limit) || 1;

    return res.status(200).json({
      success: true,
      bookings,
      currentPage: page,
      totalPages,
      search,
      statusFilter,
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching bookings',
    });
  }
};

// Get package booking details for editing
export const getEditPackageBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const userId = req.id;
    const isAdmin = req.isAdmin;

    if (!mongoose.Types.ObjectId.isValid(bookingId)) {
        return res.json({
            success: false,
            message: 'Invalid package Booking ID',
        });
    }

    if (!userId) {
      return res.json({
        success: false,
        message: 'Unauthorized: Please log in',
      });
    }

    let userData;
    if (isAdmin) {
      userData = await adminModel.findById(userId);
    } else {
      userData = await agentModel.findById(userId);
    }

    if (!userData) {
      return res.json({
        success: false,
        message: 'User not found',
      });
    }

    const booking = await packageBookingSchema
      .findById(bookingId)
      .populate('userId', 'firstName lastName email')
      .populate('items.packageId', 'title');

    if (!booking) {
      return res.json({
        success: false,
        message: 'Booking not found',
        booking: null,
      });
    }

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error('Error fetching booking for edit:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error fetching booking',
    });
  }
};

// Update package booking status
export const editPackageBooking = async (req, res) => {
  try {
    const userId = req.id;
    const isAdmin = req.isAdmin;
    const { bookingId } = req.params;
    const { status } = req.body;

    if (!userId) {
      return res.json({
        success: false,
        message: 'Unauthorized: Please log in',
      });
    }

    if (!['approved', 'pending', 'rejected'].includes(status)) {
      return res.json({
        success: false,
        message: 'Invalid status',
      });
    }

    const booking = await packageBookingSchema.findById(bookingId);
    if (!booking) {
      return res.json({
        success: false,
        message: 'Booking not found',
      });
    }

    booking.status = status;
    booking.updatedBy = userId;
    booking.updatedByModel = isAdmin ? 'Admin' : 'Agent';
    booking.updatedAt = new Date();

    if (status === 'rejected' && booking.payment.paymentStatus === 'succeeded' && booking.payment.paymentType !== 'refund') {
      try {
        const refund = await stripeInstance.refunds.create({
          payment_intent: booking.payment.stripePaymentIntentId,
          amount: Math.round(booking.total * 100),
        });
        booking.payment.paymentType = 'refund';
        booking.payment.paymentStatus = 'pending';
      } catch (refundError) {
        console.error('Error processing refund:', refundError);
        return res.json({
          success: false,
          message: 'Error processing refund',
        });
      }
    }

    await booking.save();

    return res.status(200).json({
      success: true,
      message: 'Booking updated successfully',
    });
  } catch (error) {
    console.error('Error editing booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error editing booking',
    });
  }
};

// Delete package booking
export const deletePackageBooking = async (req, res) => {
  try {
    const userId = req.id;
    const { bookingId } = req.params;

    if (!userId) {
      return res.json({
        success: false,
        message: 'Unauthorized: Please log in',
      });
    }

    const booking = await packageBookingSchema.findById(bookingId);
    if (!booking) {
      return res.json({
        success: false,
        message: 'Booking not found',
      });
    }

    if (booking.status !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: 'Only rejected bookings can be deleted',
      });
    }

    await packageBookingSchema.findByIdAndDelete(bookingId);

    return res.status(200).json({
      success: true,
      message: 'Booking deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting booking:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error deleting booking',
    });
  }
};




function generateRandomCode(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

// Get all coupons
export const getCoupons = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const isAdmin = req.isAdmin;
    let userData = await adminModel.findById(userId);
    if (!userData) {
      userData = await agentModel.findById(userId);
      if (!userData) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    }

    const { search = '', page = 1, statusFilter = 'all' } = req.query;
    const limit = 3;
    const skip = (page - 1) * limit;

    let query = {};
    if (isAdmin) {
      const agentIds = await agentModel.find({ admin: userId }).distinct('_id');
      query.$or = [
        { createdBy: userId, createdByModel: 'Admin' },
        { createdBy: { $in: agentIds }, createdByModel: 'Agent' },
      ];
    } else {
      const agentData = await agentModel.findById(userId);
      if (!agentData || !agentData.admin) {
        return res.status(404).json({ success: false, message: 'Agent or admin not found' });
      }
      const adminId = agentData.admin;
      const agentIds = await agentModel.find({ admin: adminId }).distinct('_id');
      query.$or = [
        { createdBy: adminId, createdByModel: 'Admin' },
        { createdBy: { $in: agentIds }, createdByModel: 'Agent' },
      ];
    }

    if (search) {
      query.code = { $regex: search, $options: 'i' };
    }

    if (statusFilter === 'Active') {
      query.isActive = true;
    } else if (statusFilter === 'notActive') {
      query.isActive = false;
    }

    const coupons = await couponSchema
      .find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .populate('restrictToUser', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .lean()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalCoupons = await couponSchema.countDocuments(query);
    const totalPages = Math.ceil(totalCoupons / limit) || 1;

    return res.status(200).json({
      success: true,
      coupons,
      totalPages,
      currentPage: parseInt(page),
      search,
      statusFilter,
    });
  } catch (error) {
    console.error('Error fetching coupon list:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching coupons' });
  }
};

// Create new coupon
export const createCoupon = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const isAdmin = req.isAdmin;
    let userData = await adminModel.findById(userId);
    let createdBy, createdByModel;
    if (isAdmin) {
      createdBy = userId;
      createdByModel = 'Admin';
    } else {
      userData = await agentModel.findById(userId);
      if (!userData) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      createdBy = userId;
      createdByModel = 'Agent';
    }

    const {
      creationMode = 'manual',
      code,
      numCoupons,
      discountType,
      discountValue,
      minPurchase = 0,
      maxDiscount = 0,
      expiryDate,
      usageLimit = 1,
      restrictToUser,
      isActive = 'true',
    } = req.body;

    if (creationMode === 'manual' && !code) {
      return res.status(400).json({ success: false, message: 'Coupon code is required for manual creation' });
    }
    if (creationMode === 'automatic' && (!numCoupons || parseInt(numCoupons) <= 0)) {
      return res.status(400).json({ success: false, message: 'Number of coupons must be greater than 0 for automatic creation' });
    }

    if (!discountType || !discountValue || !expiryDate) {
      return res.status(400).json({ success: false, message: 'Required fields are missing' });
    }

    if (!['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({ success: false, message: 'Invalid discount type' });
    }

    if (parseFloat(discountValue) < 0) {
      return res.status(400).json({ success: false, message: 'Discount value cannot be negative' });
    }

    let userIdRestrict = null;
    if (restrictToUser) {
      const user = await userModel.findOne({ email: restrictToUser });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      userIdRestrict = user._id;
    }

    const couponData = {
      discountType,
      discountValue: parseFloat(discountValue),
      minPurchase: parseFloat(minPurchase),
      maxDiscount: parseFloat(maxDiscount),
      expiryDate: new Date(expiryDate),
      usageLimit: parseInt(usageLimit),
      restrictToUser: userIdRestrict,
      isActive: isActive === 'true',
      createdBy,
      createdByModel,
    };

    if (creationMode === 'manual') {
      const coupon = new couponSchema({
        ...couponData,
        code: code.toUpperCase(),
      });
      await coupon.save();
      return res.status(201).json({ success: true, message: 'Coupon created successfully' });
    } else {
      const numToGenerate = parseInt(numCoupons);
      const coupons = [];
      for (let i = 0; i < numToGenerate; i++) {
        let uniqueCode;
        let attempts = 0;
        const maxAttempts = 10;
        do {
          uniqueCode = generateRandomCode();
          attempts++;
          if (attempts > maxAttempts) {
            return res.status(500).json({ success: false, message: 'Unable to generate unique coupon codes' });
          }
        } while (await couponSchema.findOne({ code: uniqueCode }));
        coupons.push({ ...couponData, code: uniqueCode });
      }
      await couponSchema.insertMany(coupons);
      return res.status(201).json({ success: true, message: `${numToGenerate} coupons generated successfully` });
    }
  } catch (error) {
    console.error('Error creating coupon:', error);
    return res.status(500).json({ success: false, message: 'Server error creating coupon' });
  }
};

// Get coupon for editing
export const getEditCoupon = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const isAdmin = req.isAdmin;
    let userData = await adminModel.findById(userId);
    if (!userData) {
      userData = await agentModel.findById(userId);
      if (!userData) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    }

    let query = { _id: req.params.couponId };
    if (isAdmin) {
      const agentIds = await agentModel.find({ admin: userId }).distinct('_id');
      query.$or = [
        { createdBy: userId, createdByModel: 'Admin' },
        { createdBy: { $in: agentIds }, createdByModel: 'Agent' },
      ];
    } else {
      const agentData = await agentModel.findById(userId);
      if (!agentData || !agentData.admin) {
        return res.status(404).json({ success: false, message: 'Agent or admin not found' });
      }
      const adminId = agentData.admin;
      const agentIds = await agentModel.find({ admin: adminId }).distinct('_id');
      query.$or = [
        { createdBy: adminId, createdByModel: 'Admin' },
        { createdBy: { $in: agentIds }, createdByModel: 'Agent' },
      ];
    }

    const coupon = await couponSchema.findOne(query).populate('restrictToUser', 'firstName lastName email').lean();
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found or you do not have access' });
    }

    return res.status(200).json({ success: true, coupon });
  } catch (error) {
    console.error('Error fetching coupon:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching coupon' });
  }
};

// Update coupon
export const updateCoupon = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const isAdmin = req.isAdmin;
    let userData = await adminModel.findById(userId);
    if (!userData) {
      userData = await agentModel.findById(userId);
      if (!userData) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    }

    const {
      code,
      discountType,
      discountValue,
      minPurchase = 0,
      maxDiscount = 0,
      expiryDate,
      usageLimit = 1,
      restrictToUser,
      isActive = 'true',
    } = req.body;
    

    if (!code || !discountType || !discountValue || !expiryDate) {
      return res.status(400).json({ success: false, message: 'Required fields are missing' });
    }

    if (!['percentage', 'fixed'].includes(discountType)) {
      return res.status(400).json({ success: false, message: 'Invalid discount type' });
    }

    if (parseFloat(discountValue) < 0) {
      return res.status(400).json({ success: false, message: 'Discount value cannot be negative' });
    }

    let userIdRestrict = null;
    if (restrictToUser) {
      const user = await userModel.findOne({ email: restrictToUser });
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      userIdRestrict = user._id;
    }

    const coupon = await couponSchema.findByIdAndUpdate(
      req.params.couponId,
      {
        code: code.toUpperCase(),
        discountType,
        discountValue: parseFloat(discountValue),
        minPurchase: parseFloat(minPurchase),
        maxDiscount: parseFloat(maxDiscount),
        expiryDate: new Date(expiryDate),
        usageLimit: parseInt(usageLimit),
        restrictToUser: userIdRestrict,
        isActive: isActive === 'true',
        updatedBy: userId,
        updatedByModel: isAdmin ? 'Admin' : 'Agent',
        updatedAt: new Date(),
      },
      { new: true, runValidators: true }
    );

    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found' });
    }

    return res.status(200).json({ success: true, message: 'Coupon updated successfully' });
  } catch (error) {
    console.error('Error updating coupon:', error);
    return res.status(500).json({ success: false, message: 'Server error updating coupon' });
  }
};

// Delete coupon
export const deleteCoupon = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const isAdmin = req.isAdmin;
    let userData = await adminModel.findById(userId);
    if (!userData) {
      userData = await agentModel.findById(userId);
      if (!userData) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    }

    let query = { _id: req.params.couponId };
    if (isAdmin) {
      const agentIds = await agentModel.find({ admin: userId }).distinct('_id');
      query.$or = [
        { createdBy: userId, createdByModel: 'Admin' },
        { createdBy: { $in: agentIds }, createdByModel: 'Agent' },
      ];
    } else {
      const agentData = await agentModel.findById(userId);
      if (!agentData || !agentData.admin) {
        return res.status(404).json({ success: false, message: 'Agent or admin not found' });
      }
      const adminId = agentData.admin;
      const agentIds = await agentModel.find({ admin: adminId }).distinct('_id');
      query.$or = [
        { createdBy: adminId, createdByModel: 'Admin' },
        { createdBy: { $in: agentIds }, createdByModel: 'Agent' },
      ];
    }

    const coupon = await couponSchema.findOneAndDelete(query);
    if (!coupon) {
      return res.status(404).json({ success: false, message: 'Coupon not found or you do not have access' });
    }

    return res.status(200).json({ success: true, message: 'Coupon deleted successfully' });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return res.status(500).json({ success: false, message: 'Server error deleting coupon' });
  }
};

// Get coupon details
export const getCouponDetails = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const isAdmin = req.isAdmin;
    let userData = await adminModel.findById(userId);
    if (!userData) {
      userData = await agentModel.findById(userId);
      if (!userData) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
    }

    let query = { _id: req.params.couponId };
    if (isAdmin) {
      const agentIds = await agentModel.find({ admin: userId }).distinct('_id');
      query.$or = [
        { createdBy: userId, createdByModel: 'Admin' },
        { createdBy: { $in: agentIds }, createdByModel: 'Agent' },
      ];
    } else {
      const agentData = await agentModel.findById(userId);
      if (!agentData || !agentData.admin) {
        return res.json({ success: false, message: 'Agent or admin not found' });
      }
      const adminId = agentData.admin;
      const agentIds = await agentModel.find({ admin: adminId }).distinct('_id');
      query.$or = [
        { createdBy: adminId, createdByModel: 'Admin' },
        { createdBy: { $in: agentIds }, createdByModel: 'Agent' },
      ];
    }

    const coupon = await couponSchema
      .findOne(query)
      .populate('usedBy.userId', 'firstName lastName email')
      .populate('createdBy', 'firstName lastName email')
      .populate('restrictToUser', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .lean();

    if (!coupon) {
      return res.json({ success: false, message: 'Coupon not found or you do not have access', coupon: null });
    }

    return res.status(200).json({ success: true, coupon });
  } catch (error) {
    console.error('Error fetching coupon details:', error);
    return res.status(500).json({ success: false, message: 'Server error fetching coupon details' });
  }
};






export const getCareerList = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    let userData = await adminModel.findById(userId);
    if (!userData) {
      userData = await agentModel.findById(userId);
    }

    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { page = 1, search = '', statusFilter = 'all' } = req.query;
    const limit = 3;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }
    if (statusFilter === 'Active') {
      query.isActive = true;
    } else if (statusFilter === 'notActive') {
      query.isActive = false;
    }

    const careers = await CareerSchema.find(query)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const totalCareers = await CareerSchema.countDocuments(query);
    const totalPages = Math.ceil(totalCareers / limit) || 1;

    res.status(200).json({
      success: true,
      careers,
      totalPages,
      currentPage: parseInt(page),
      search,
      statusFilter,
    });
  } catch (error) {
    console.error('Error fetching career list:', error);
    res.status(500).json({ success: false, message: 'Server error fetching career list' });
  }
};


export const addCareer = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Admin or Agent access required' });
    }

    const isAdmin = req.isAdmin;
    let userData = await adminModel.findById(userId);
    let createdBy, createdByModel;
    if (isAdmin) {
      createdBy = userId;
      createdByModel = 'Admin';
    } else {
      userData = await agentModel.findById(userId);
      if (!userData) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      createdBy = userId;
      createdByModel = 'Agent';
    }

    const {
      title, employmentType, shortDescription, description,
      overview, experience, requirements, vacancies, salary, isActive
    } = req.body;

    if (!title || !employmentType || !shortDescription || !description || !overview || !experience || !requirements || !vacancies || !salary) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    const newCareer = new CareerSchema({
      title,
      employmentType,
      shortDescription,
      description,
      overview,
      experience,
      requirements,
      vacancies: parseInt(vacancies),
      salary,
      isActive: isActive === 'true',
      image: req.file.filename,
      createdBy,
      createdByModel,
    });

    await newCareer.save();
    res.status(201).json({ success: true, message: 'Career added successfully', career: newCareer });
  } catch (error) {
    console.error('Error adding career:', error);
    res.status(500).json({ success: false, message: 'Server error adding career' });
  }
};

export const getEditCareerData = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    let userData = await adminModel.findById(userId);
    if (!userData) {
      userData = await agentModel.findById(userId);
    }

    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const career = await CareerSchema.findById(req.params.id);
    if (!career) {
      return res.status(404).json({ success: false, message: 'Career not found' });
    }

    res.status(200).json({ success: true, career });
  } catch (error) {
    console.error('Error fetching career:', error);
    res.status(500).json({ success: false, message: 'Server error fetching career' });
  }
};

export const editCareer = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Admin or Agent access required' });
    }

    const isAdmin = req.isAdmin;
    const career = await CareerSchema.findById(req.params.id);
    if (!career) {
      return res.status(404).json({ success: false, message: 'Career not found' });
    }

    const {
      title, employmentType, shortDescription, description,
      overview, experience, requirements, vacancies, salary, isActive
    } = req.body;

    if (!title || !employmentType || !shortDescription || !description || !overview || !experience || !requirements || !vacancies || !salary) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    career.title = title;
    career.employmentType = employmentType;
    career.shortDescription = shortDescription;
    career.description = description;
    career.overview = overview;
    career.experience = experience;
    career.requirements = requirements;
    career.vacancies = parseInt(vacancies);
    career.salary = salary;
    career.isActive = isActive === 'true';
    career.updatedBy = userId;
    career.updatedByModel = isAdmin ? 'Admin' : 'Agent';
    career.updatedAt = new Date();

    if (req.file) {
      if (career.image) {
        try {
          const oldImagePath = join(__dirname, '../Uploads/career');
          await fs.unlink(join(oldImagePath, career.image));
          console.log('Deleted old career picture:', career.image);
        } catch (err) {
          if (err.code !== 'ENOENT') {
            console.error('Error deleting career picture:', err);
          }
        }
      }
      career.image = req.file.filename;
    }

    await career.save();
    res.status(200).json({ success: true, message: 'Career updated successfully', career });
  } catch (error) {
    console.error('Error editing career:', error);
    res.status(500).json({ success: false, message: 'Server error editing career' });
  }
};

export const getCareerDetail = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    let userData = await adminModel.findById(userId);
    if (!userData) {
      userData = await agentModel.findById(userId);
    }

    if (!userData) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const career = await CareerSchema.findById(req.params.id)
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!career) {
      return res.status(404).json({ success: false, message: 'Career not found' });
    }

    const applications = await ApplicationSchema.find({ careerId: req.params.id })
      .populate('userId', 'firstName lastName email')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, career, applications });
  } catch (error) {
    console.error('Error fetching career detail:', error);
    res.status(500).json({ success: false, message: 'Server error fetching career detail' });
  }
};

export const deleteCareer = async (req, res) => {
  try {
    const userId = req.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Admin or Agent access required' });
    }

    const career = await CareerSchema.findById(req.params.id);
    if (!career) {
      return res.status(404).json({ success: false, message: 'Career not found' });
    }

    if (career.image) {
      try {
        const oldImagePath = join(__dirname, '../Uploads/career');
        await fs.unlink(join(oldImagePath, career.image));
        console.log('Deleted old career picture:', career.image);
      } catch (err) {
        if (err.code !== 'ENOENT') {
          console.error('Error deleting career picture:', err);
        }
      }
    }

    await CareerSchema.deleteOne({ _id: career._id });
    res.status(200).json({ success: true, message: 'Career deleted successfully' });
  } catch (error) {
    console.error('Error deleting career:', error);
    res.status(500).json({ success: false, message: 'Server error deleting career' });
  }
};



// Get application list for admin/agent
export const getApplicationList = async (req, res) => {
    try {
        const userId = req.id;
        const isAdmin = req.isAdmin;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
        }

        let userData = await adminModel.findById(userId);
        if (!userData) {
            userData = await agentModel.findById(userId);
        }

        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { page = 1, search = '' } = req.query;
        const limit = 3;
        const skip = (page - 1) * limit;
        const statusFilter = req.query.statusFilter || 'all';

        // Determine which careers the user can access
        let careerQuery = {};
        if (isAdmin) {
            const agents = await agentModel.find({ admin: userId }).select('_id');
            const agentIds = agents.map(agent => agent._id);
            careerQuery = {
                $or: [
                    { createdBy: userId, createdByModel: 'Admin' },
                    { createdBy: { $in: agentIds }, createdByModel: 'Agent' }
                ]
            };
        } else {
            careerQuery = {
                $or: [
                    { createdBy: userId, createdByModel: 'Agent' },
                    { createdBy: userData.admin, createdByModel: 'Admin' }
                ]
            };
        }

        const accessibleCareers = await CareerSchema.find(careerQuery).select('_id');
        const careerIds = accessibleCareers.map(career => career._id);

        let applicationQuery = { careerId: { $in: careerIds } };
        if (search) {
            applicationQuery.$or = [
                { 'userId.firstName': { $regex: search, $options: 'i' } },
                { 'userId.lastName': { $regex: search, $options: 'i' } },
                { 'careerId.title': { $regex: search, $options: 'i' } }
            ];
        }

        if (statusFilter !== 'all') {
            applicationQuery.status = statusFilter;
        }

        const applications = await ApplicationSchema.find(applicationQuery)
            .populate({
                path: 'userId',
                select: 'firstName lastName email'
            })
            .populate({
                path: 'updatedBy',
                select: 'firstName lastName email'
            })
            .populate({
                path: 'careerId',
                select: 'title'
            })
            .skip(skip)
            .limit(limit)
            .sort({ appliedAt: -1 })
            .lean();

        const totalApplications = await ApplicationSchema.countDocuments(applicationQuery);
        const totalPages = Math.ceil(totalApplications / limit) || 1;

        res.json({
            success: true,
            allApplications: applications,
            totalPages,
            currentPage: parseInt(page),
            search,
            statusFilter,
            isAdmin,
            user: userData,
        });
    } catch (error) {
        console.error('Error fetching application list:', error);
        res.status(500).json({ success: false, message: 'Server error fetching application list' });
    }
};

// Get application detail for admin/agent
export const getApplicationDetail = async (req, res) => {
    try {
        const userId = req.id;
        const isAdmin = req.isAdmin;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Admin or Agent access required' });
        }

        let userData = await adminModel.findById(userId);
        if (!userData) {
            userData = await agentModel.findById(userId);
        }

        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const application = await ApplicationSchema.findById(req.params.id)
            .populate({
                path: 'userId',
                select: 'firstName lastName email'
            })
            .populate({
                path: 'updatedBy',
                select: 'firstName lastName email'
            })
            .populate({
                path: 'careerId',
                select: 'title'
            });

        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        res.json({ success: true, application, isAdmin, user: userData });
    } catch (error) {
        console.error('Error fetching application detail:', error);
        res.status(500).json({ success: false, message: 'Server error fetching application detail' });
    }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
    try {
        const userId = req.id;
        const isAdmin = req.isAdmin;

        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized: Admin or Agent access required' });
        }

        let userData = await adminModel.findById(userId);
        if (!userData) {
            userData = await agentModel.findById(userId);
        }

        if (!userData) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const { status } = req.body;
        if (!['pending', 'accepted', 'rejected'].includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status' });
        }

        const application = await ApplicationSchema.findById(req.params.id);
        if (!application) {
            return res.status(404).json({ success: false, message: 'Application not found' });
        }

        application.status = status;
        application.updatedBy = userId;
        application.updatedByModel = isAdmin ? 'Admin' : 'Agent';
        application.updatedAt = new Date();
        await application.save();

        res.json({ success: true, message: 'Application status updated successfully', application });
    } catch (error) {
        console.error('Error updating application status:', error);
        res.status(500).json({ success: false, message: 'Server error updating application status' });
    }
};





// Get FAQ Enquiry List
export const getFaqEnquiry = async (req, res) => {
  try {
    const userId = req.id;
    const isAdmin = req.isAdmin;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const user = isAdmin ? await adminModel.findById(userId) : await agentModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const statusFilter = req.query.statusFilter || 'all';

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (statusFilter === 'answered') {
      query.answer = { $ne: null };
    } else if (statusFilter === 'notAnswered') {
      query.answer = null;
    }

    const questions = await faqSchema
      .find(query)
      .populate('answeredBy', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalQuestions = await faqSchema.countDocuments(query);
    const totalPages = Math.ceil(totalQuestions / limit) || 1;

    res.json({
      success: true,
      allFaqEnquiries: questions,
      totalPages,
      currentPage: page,
      search,
      statusFilter,
      user,
      isAdmin,
    });
  } catch (error) {
    console.error('Error fetching FAQ enquiry list:', error);
    res.status(500).json({ success: false, message: 'Server error fetching FAQ enquiry list' });
  }
};

// Edit/Answer FAQ Enquiry
export const editFaqEnquiry = async (req, res) => {
  try {
    const { answer } = req.body;
    const questionId = req.params.id;
    const userId = req.id;
    const isAdmin = req.isAdmin;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const user = isAdmin ? await adminModel.findById(userId) : await agentModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!answer) {
      return res.status(400).json({ success: false, message: 'Answer is required to update the FAQ' });
    }

    const question = await faqSchema.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'Question not found' });
    }

    const updateQuestion = {};
    if (answer) {
      updateQuestion.answer = answer;
      updateQuestion.answeredBy = userId;
      updateQuestion.answeredByModel = isAdmin ? 'Admin' : 'Agent';
      updateQuestion.answeredAt = new Date();
    } else if (question.answer && !answer) {
      updateQuestion.answer = null;
      updateQuestion.answeredBy = null;
      updateQuestion.answeredByModel = null;
      updateQuestion.answeredAt = null;
    }

    const updatedQuestion = await faqSchema
      .findByIdAndUpdate(questionId, { $set: updateQuestion }, { new: true, runValidators: true })
      .populate('answeredBy', 'firstName lastName email')
      .lean();

    res.json({ success: true, message: 'FAQ enquiry updated successfully', enquiry: updatedQuestion });
  } catch (error) {
    console.error('Error updating FAQ enquiry:', error);
    res.status(500).json({ success: false, message: 'Server error updating FAQ enquiry' });
  }
};

// Delete FAQ Enquiry
export const deleteFaqEnquiry = async (req, res) => {
  try {
    const questionId = req.params.id;
    const userId = req.id;
    const isAdmin = req.isAdmin;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const user = isAdmin ? await adminModel.findById(userId) : await agentModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const question = await faqSchema.findById(questionId);
    if (!question) {
      return res.status(404).json({ success: false, message: 'FAQ enquiry not found' });
    }

    await question.deleteOne();

    res.json({ success: true, message: 'FAQ enquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting FAQ enquiry:', error);
    res.status(500).json({ success: false, message: 'Server error deleting FAQ enquiry' });
  }
};

// Get Contact Enquiry List
export const getContactEnquiries = async (req, res) => {
  try {
    const userId = req.id;
    const isAdmin = req.isAdmin;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const user = isAdmin ? await adminModel.findById(userId) : await agentModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = 10; // Adjusted to match FAQ limit
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const statusFilter = req.query.statusFilter || 'all';

    let query = {};
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }
    if (statusFilter !== 'all') {
      query.enquiryStatus = statusFilter;
    }

    const contacts = await contactSchema
      .find(query)
      .populate('updatedBy', 'firstName lastName email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const total = await contactSchema.countDocuments(query);
    const totalPages = Math.ceil(total / limit) || 1;

    res.json({
      success: true,
      allContactEnquiries: contacts,
      totalPages,
      currentPage: page,
      search,
      statusFilter,
      user,
      isAdmin,
    });
  } catch (error) {
    console.error('Error fetching contact enquiries:', error);
    res.status(500).json({ success: false, message: 'Server error fetching contact enquiries' });
  }
};

// Update Contact Enquiry Status
export const updateContactEnquiryStatus = async (req, res) => {
  try {
    const { enquiryStatus } = req.body;
    const contactId = req.params.id;
    const userId = req.id;
    const isAdmin = req.isAdmin;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const user = isAdmin ? await adminModel.findById(userId) : await agentModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!['pending', 'active', 'cancel'].includes(enquiryStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid status provided' });
    }

    const contact = await contactSchema.findById(contactId);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact enquiry not found' });
    }

    const updatedContact = await contactSchema
      .findByIdAndUpdate(
        contactId,
        { $set: { enquiryStatus, updatedBy: userId, updatedByModel: isAdmin ? 'Admin' : 'Agent', updatedAt: new Date() } },
        { new: true, runValidators: true }
      )
      .populate('updatedBy', 'firstName lastName email')
      .lean();

    res.json({ success: true, message: 'Contact enquiry status updated successfully', enquiry: updatedContact });
  } catch (error) {
    console.error('Error updating contact enquiry status:', error);
    res.status(500).json({ success: false, message: 'Server error updating contact enquiry status' });
  }
};

// Delete Contact Enquiry
export const deleteContactEnquiry = async (req, res) => {
  try {
    const contactId = req.params.id;
    const userId = req.id;
    const isAdmin = req.isAdmin;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized: Please log in' });
    }

    const user = isAdmin ? await adminModel.findById(userId) : await agentModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const contact = await contactSchema.findById(contactId);
    if (!contact) {
      return res.status(404).json({ success: false, message: 'Contact enquiry not found' });
    }

    await contact.deleteOne();

    res.json({ success: true, message: 'Contact enquiry deleted successfully' });
  } catch (error) {
    console.error('Error deleting contact enquiry:', error);
    res.status(500).json({ success: false, message: 'Server error deleting contact enquiry' });
  }
};
