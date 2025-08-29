import adminModel from '../models/adminModel.js';
import agentModel from '../models/agentModel.js';
import userModel from '../models/userModel.js';

export const AdminDashboard = async (req, res) => {
    try {
        const userId = req.id;
        const isAdmin = req.isAdmin;

        if (!userId) {
            return res.status(401).json({ message: 'Unauthorized: Please log in', type: 'error', success: false, redirect: '/login' });
        }

        let userData;
        if (isAdmin) {
            userData = await adminModel.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
        } else {
            userData = await agentModel.findById(userId).select('-password -resetPasswordToken -resetPasswordExpires');
        }

        if (!userData) {
            return res.status(404).json({ message: 'User not found', type: 'error', success: false, redirect: '/login' });
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
