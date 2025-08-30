import userModel from '../models/userModel.js';


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