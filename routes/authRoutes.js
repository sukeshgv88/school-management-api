const express = require('express');
const bcrypt = require('bcrypt'); // Ensure this is bcrypt, not bcryptjs
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticateJWT } = require('../middleware/authMiddleware');

const router = express.Router();
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET;

console.log("🔍 JWT_SECRET Loaded:", !!JWT_SECRET); // Debugging check

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (Superadmin or School Admin)
 * @access  Public
 */
router.post('/register', async (req, res) => {
    try {
        console.log("📌 Incoming Registration Request:", req.body);
        const { name, email, password, role, schoolId } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ error: "All fields (name, email, password, role) are required" });
        }

        // Validate role
        const validRoles = ['superadmin', 'schooladmin'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ error: `Invalid role. Must be one of: ${validRoles.join(', ')}` });
        }

        if (role === 'schooladmin' && !schoolId) {
            return res.status(400).json({ error: "School ID is required for school administrators" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "Email is already registered" });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        console.log("🔄 Generated Hash for Registration:", hashedPassword);

        const newUser = new User({ name, email, password: hashedPassword, role, schoolId });
        await newUser.save();

        console.log("✅ User registered successfully:", newUser);
        res.status(201).json({ message: "User registered successfully", userId: newUser._id });

    } catch (error) {
        console.error("❌ Registration Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        console.log("🔹 Login Attempt:", { email });

        const user = await User.findOne({ email });
        if (!user) {
            console.log("❌ User not found in database");
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        console.log("🔍 User Found:", user);

        // Compare password with hashed password
        const isMatch = await bcrypt.compare(password, user.password);
        console.log("✅ Password Match:", isMatch ? "✔ MATCH" : "❌ NO MATCH");

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Generate JWT token
        if (!JWT_SECRET) {
            console.error("❌ JWT_SECRET is missing. Please set it in .env file.");
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: '1h' }
        );

        console.log("🔹 Login Successful: Token Generated");
        res.json({ message: "Login successful", token });

    } catch (error) {
        console.error("❌ Login Error:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;