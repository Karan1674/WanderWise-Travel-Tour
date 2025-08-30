import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import adminModel from '../models/adminModel.js';
import agentModel from '../models/agentModel.js';
import userModel from '../models/userModel.js';

export const homePage = async (req, res) => {
    try {
        const token = req.cookies?.token;

        if (token) {
            const decoded = jwt.verify(token, process.env.SECRET_KEY);
            const userId = decoded.userId;
            let loginedUserData =
            (await adminModel.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires")) ||
            (await agentModel.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires")) ||
            (await userModel.findById(userId).select("-password -resetPasswordToken -resetPasswordExpires"));
    
          if (loginedUserData) {
            return res.json({
              message: "Redirect to Dashboard",
              type: "info",
              success: true,
            });
          } else {
            res.clearCookie("token");
          }
        }

        res.json({
            destinations: [],
            packages: [],
            blogs: [],
            testimonials: [],
            success:true,
            type:'info'
        });
    } catch (error) {
        console.error('Home page error:', error);
        res.status(500).json({ message: 'Internal server error', type: 'error' });
    }
};

export const adminRegister = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        const existingAdmin = await adminModel.findOne({ email });
        if (existingAdmin) {
            return res.json({ message: 'Admin already exists', type: 'error', success:false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newAdmin = new adminModel({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            isAdmin: true,
        });

        await newAdmin.save();
        res.json({ message: 'Admin registered successfully', type: 'success', success:true, success:true });
    } catch (error) {
        console.error('Admin Register Error:', error);
        res.status(500).json({ message: 'Server error during registration', type: 'error' });
    }
};

export const signupUser = async (req, res) => {
    try {
        const { firstName, lastName, email, password, phone } = req.body;

        const existingUser = await userModel.findOne({ email });
        if (existingUser) {
            return res.json({ message: 'Email already registered', type: 'error', success:false });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let profilePicPath = '';
        if (req.file) {
            profilePicPath = req.file.filename;
        }

        const newUser = new userModel({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            phone,
            profilePic: profilePicPath,
        });

        await newUser.save();
        res.json({ message: 'User registered successfully', type: 'success', success:true });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Server error during signup', type: 'error' });
    }
};

export const loginUserOrAdmin = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await adminModel.findOne({ email });
        let role = 'admin';

        if (!user) {
            user = await agentModel.findOne({ email, isActive: true });
            role = 'agent';
        }

        if (!user) {
            user = await userModel.findOne({ email });
            role = 'User';
        }

        if (!user) {
            return res.json({ message: 'User not found', type: 'error', success:false });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ message: 'Invalid credentials', type: 'error', success:false });
        }

        const tokenData = { userId: user._id };
        const token = jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000,
        });

        const userData = await (role === 'admin' ? adminModel : role === 'agent' ? agentModel : userModel)
            .findById(user._id)
            .select('-password -resetPasswordToken -resetPasswordExpires');

        res.json({
            message: 'Login successful',
            type: 'success',
            user: userData,
            role,
            success:true
        });
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: 'Server error during login', type: 'error' });
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie('token');
        res.json({ message: 'Logged out successfully', type: 'success', success:true });
    } catch (error) {
        console.error('Logout Error:', error);
        res.status(500).json({ message: 'Error during logout', type: 'error' });
    }
};

export const forgetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ message: 'Email is required', type: 'error', success:false });
        }

        let user = await agentModel.findOne({ email });
        let userType = 'Agent';
        if (!user) {
            user = await adminModel.findOne({ email });
            userType = 'Admin';
        }
        if (!user) {
            user = await userModel.findOne({ email });
            userType = 'User';
        }
        if (!user) {
            return res.json({ message: 'No user found with this email', type: 'error', success:false });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetTokenExpiry = Date.now() + 60 * 60 * 1000;

        user.resetPasswordToken = resetTokenHash;
        user.resetPasswordExpires = resetTokenExpiry;
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}&type=${userType}`;
        res.json({ message: 'Password reset link sent', type: 'success', resetUrl, email, success:true });
    } catch (error) {
        console.error('Error in forgetPassword:', error);
        res.status(500).json({ message: 'Failed to process password reset request', type: 'error' });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { token, type } = req.query;
        const { password, confirmPassword } = req.body;

        if (!token || !type || !['User', 'Agent', 'Admin'].includes(type)) {
            return res.json({ message: 'Invalid or missing reset token or user type', type: 'error', success:false });
        }
        if (!password || !confirmPassword) {
            return res.json({ message: 'Both password fields are required', type: 'error', success:false });
        }
        if (password !== confirmPassword) {
            return res.json({ message: 'Passwords do not match', type: 'error', success:false });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
        let user;
        if (type === 'Admin') {
            user = await adminModel.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: Date.now() },
            });
        } else if (type === 'Agent') {
            user = await agentModel.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: Date.now() },
            });
        } else if (type === 'User') {
            user = await userModel.findOne({
                resetPasswordToken: hashedToken,
                resetPasswordExpires: { $gt: Date.now() },
            });
        }

        if (!user) {
            return res.json({ message: 'Invalid or expired reset token', type: 'error', success:false });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully', type: 'success', success:true });
    } catch (error) {
        console.error('Error resetting password:', error);
        res.status(500).json({ message: 'Failed to reset password', type: 'error' });
    }
};


