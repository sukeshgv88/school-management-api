const express = require('express');
const School = require('../models/School');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/schools
 * @desc    Get all schools (Superadmin only)
 * @access  Private (Superadmin)
 */
router.get('/', authenticateJWT, authorizeRoles(['superadmin']), async (req, res) => {
    try {
        const schools = await School.find();
        res.json(schools);
    } catch (error) {
        console.error("❌ Error fetching schools:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @route   GET /api/schools/:id
 * @desc    Get school by ID (Superadmin can access all, School Admin can access only their assigned school)
 * @access  Private (Superadmin, School Admins)
 */
router.get('/:id', authenticateJWT, authorizeRoles(['superadmin']), async (req, res) => {
    try {
        const school = await School.findById(req.params.id);
        
        if (!school) {
            return res.status(404).json({ error: "School not found" });
        }

        res.json(school);
    } catch (error) {
        console.error("❌ Error fetching school by ID:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @route   POST /api/schools
 * @desc    Create a new school (Superadmin only)
 * @access  Private (Superadmin)
 */
router.post('/', authenticateJWT, authorizeRoles(['superadmin']), async (req, res) => {
    try {
        console.log("🔹 Incoming School Creation Request:", req.body);
        const { name, location, principal, admin, address } = req.body;

        // Validate input
        if (!name || !location || !principal || !admin || !address) {
            return res.status(400).json({ error: "All fields (name, location, principal, admin, address) are required" });
        }

        // Create new school
        const newSchool = new School({ name, location, principal, admin, address });
        await newSchool.save();

        console.log("✅ School created successfully:", newSchool);
        res.status(201).json(newSchool);
    } catch (error) {
        console.error("❌ Error creating school:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @route   PUT /api/schools/:id
 * @desc    Update school details (Superadmin only)
 * @access  Private (Superadmin)
 */
router.put('/:id', authenticateJWT, authorizeRoles(['superadmin']), async (req, res) => {
    try {
        console.log("🔹 Updating School:", req.params.id, req.body);
        const updatedSchool = await School.findByIdAndUpdate(req.params.id, req.body, { new: true });

        if (!updatedSchool) {
            return res.status(404).json({ error: "School not found" });
        }

        console.log("✅ School updated successfully:", updatedSchool);
        res.json(updatedSchool);
    } catch (error) {
        console.error("❌ Error updating school:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @route   DELETE /api/schools/:id
 * @desc    Delete school (Superadmin only)
 * @access  Private (Superadmin)
 */
router.delete('/:id', authenticateJWT, authorizeRoles(['superadmin']), async (req, res) => {
    try {
        console.log("🔹 Deleting School:", req.params.id);
        const deletedSchool = await School.findByIdAndDelete(req.params.id);

        if (!deletedSchool) {
            return res.status(404).json({ error: "School not found" });
        }

        console.log("✅ School deleted successfully");
        res.json({ message: "School deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting school:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;