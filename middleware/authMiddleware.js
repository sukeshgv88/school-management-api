const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to authenticate JWT Token
 */
const authenticateJWT = async (req, res, next) => {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized: No token provided or invalid format" });
    }

    try {
        const token = authHeader.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            return res.status(401).json({ error: "Unauthorized: User not found" });
        }
        next();
    } catch (error) {
        console.error("Authentication Error:", error);
        return res.status(403).json({ error: "Forbidden: Invalid or expired token" });
    }
};

/**
 * Middleware to enforce Role-based Access Control (RBAC)
 */
const authorizeRoles = (allowedRoles) => {
    return (req, res, next) => {
        console.log("🔹 Checking User Role:", { userRole: req.user.role, allowedRoles });

        if (!req.user || !allowedRoles.includes(req.user.role)) {
            console.log("❌ Forbidden: User does not have the required role");
            return res.status(403).json({ error: "Forbidden: Access denied" });
        }

        const { schoolId } = req.params;
        if (req.user.role === 'schooladmin' && req.user.schoolId?.toString() === schoolId) {
            return next(); // School Admin can access their assigned school
        }

        console.log("✅ Role Authorization Passed");
        next();
    };
};


module.exports = { authenticateJWT, authorizeRoles };