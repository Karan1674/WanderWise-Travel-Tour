import jwt from 'jsonwebtoken';

export const isAuthenticated = async (req, res, next) => {
    const token = req.cookies?.token;
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized: No token provided', type: 'error' });
    }

    try {
        const decoded = jwt.verify(token, process.env.SECRET_KEY);
        req.id = decoded.userId;
        next();
    } catch (error) {
        res.clearCookie('token');
        res.status(401).json({ message: 'Invalid token', type: 'error' });
    }
};