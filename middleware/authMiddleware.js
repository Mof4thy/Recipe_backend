    const jwt = require('jsonwebtoken');
    const User = require('../models/User');

    const auth = async (req, res, next) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');

            if (!token) {   
                res.status(401).json({ message: 'Not authorized, no token' })
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');

            if (!user) {
                throw new Error('Authentication failed');
            }

            req.user = user;
            
            next();
            
        } catch (error) {
            res.status(401).json({ error: 'Unauthorized' });
        }
    };


    module.exports = auth