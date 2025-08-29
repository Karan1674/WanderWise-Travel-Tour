import userModel from '../models/userModel.js';


// Render Simple User Page 
export const signInUserDashboard = async (req, res) => {
    try {
        const userId = req.id;
        if (!userId) {
            console.log("UserId not Available ");
            req.session = req.session || {};
            req.session.message = 'User ID not available';
            req.session.type = 'error';
            return res.redirect('/');
        }

        const userData = await userModel.findById(userId);

        if (!userData) {
            console.log('No such User Exist in The DataBase');
            req.session = req.session || {};
            req.session.message = 'No such user exists in the database';
            req.session.type = 'error';
            return res.redirect('/');
        }
     
        res.render('client/layout/Home', {
            destinations: [],
            packages: [],
            blogs: [],
            testimonials: [],
            success:true
        });;
    } catch (error) {
        console.error('Sign in error:', error);
        req.session = req.session || {};
        req.session.message = 'Server error during sign-in';
        req.session.type = 'error';
        res.status(500).redirect('/error?status=500&message=Server error during sign-in');
    }
};