import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Access Denied: No Token Provided!' });
    }
    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = verified; 
        next(); 
    } catch (error) {
        return res.status(400).json({ message: 'Invalid Token' });
    }
};


