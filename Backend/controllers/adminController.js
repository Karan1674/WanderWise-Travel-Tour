import adminModel from '../models/adminModel.js';
import agentModel from '../models/agentModel.js';
import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import packageModel from '../models/packageModel.js';
import mongoose from 'mongoose';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const AdminDashboard = async (req, res) => {
    try {
        const userId = req.id;
        const isAdmin = req.isAdmin;

        if (!userId) {
            return res.json({ message: 'Unauthorized: Please log in', type: 'error', success: false });
        }

        let userData;
        if (isAdmin) {
            userData = await adminModel.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
        } else {
            userData = await agentModel.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
        }

        if (!userData) {
            return res.status(404).json({ message: 'User not found', type: 'error', success: false });
        }

        // Fetch metrics
        const agentCount = await agentModel.countDocuments({ isActive: true });
        const usersCount = await userModel.countDocuments();

        // Since schemas are unavailable, set earnings to 0
        const packageEarnings = 0;
        const productEarnings = 0;

        // Return empty arrays for unavailable schemas
        const bookings = [];
        const enquiries = [];
        const packages = [];
        const products = [];
        const faqs = [];

        res.json({
            success: true,
            message: 'Dashboard data loaded successfully',
            type: 'success',
            user: userData,
            isAdmin,
            agentCount,
            usersCount,
            productEarnings,
            packageEarnings,
            bookings,
            enquiries,
            packages,
            products,
            faqs
        });
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        res.status(500).json({ message: 'Server error loading dashboard', type: 'error', success: false });
    }
};


export const getAllAgents = async (req, res) => {
    try {
        const { page = 1, search = '', statusFilter = 'all' } = req.query;
        const limit = 10;
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
        const limit = 10;

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
        const limit = 5;
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

// POST /package - Add new package
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

// PUT /package/:id - Edit package
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

// GET /delete-package/:id - Delete package
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
