const jwt = require('jsonwebtoken');
const SECRET_KEY = 'your_jwt_secret'; // Ensure this is consistent with your actual secret

const protect = (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];  // Extract token from Bearer header
        
        if (!token) {
            return res.status(401).json({ 
                success: false,
                message: 'Access Denied: No Token Provided' 
            });
        }

        const decoded = jwt.verify(token, SECRET_KEY); // Verify token
        req.user = decoded;
        console.log('Authenticated user:', decoded);
        next(); // Proceed to next middleware or route handler
    } catch (err) {
        console.error('Authentication error:', err);
        res.status(401).json({ 
            success: false,
            message: 'Invalid Token' 
        });
    }
};

const authorizeRoles = (...roles) => (req, res, next) => {
    console.log('Checking roles:', roles, 'User role:', req.user?.role);
    
    if (!req.user) {
        return res.status(401).json({ 
            success: false,
            message: 'User not authenticated' 
        });
    }

    if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
            success: false,
            message: `Access Denied: Role '${req.user.role}' is not authorized` 
        });
    }

    next();
};

module.exports = {
    protect,
    authorizeRoles
};
