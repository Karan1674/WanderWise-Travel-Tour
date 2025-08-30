import adminModel from '../models/adminModel.js';
import agentModel from '../models/agentModel.js';
import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import fs from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
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
        const limit = 1;
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
