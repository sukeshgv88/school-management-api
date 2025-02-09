const express = require('express');
const mongoose = require('mongoose');
const Classroom = require('../models/Classroom');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/classrooms
 * @desc    Get all classrooms (Superadmin & School Admins)
 * @access  Private
 */
router.get('/', authenticateJWT, authorizeRoles(['superadmin', 'schooladmin']), async (req, res) => {
    try {
        let classrooms;

        if (req.user.role === "superadmin") {
            classrooms = await Classroom.find(); // Superadmin sees all classrooms
        } else {
            classrooms = await Classroom.find({ school: req.user.schoolId }); // School Admin sees only their classrooms
        }

        res.json(classrooms);
    } catch (error) {
        console.error("❌ Error fetching classrooms:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @route   GET /api/classrooms/:id
 * @desc    Get classroom by ID (Superadmin can access all, School Admin only their own)
 * @access  Private
 */
router.get('/:id', authenticateJWT, authorizeRoles(['superadmin', 'schooladmin']), async (req, res) => {
    try {
        const classroom = await Classroom.findById(req.params.id);

        if (!classroom) {
            return res.status(404).json({ error: "Classroom not found" });
        }

        if (req.user.role !== "superadmin" && classroom.school.toString() !== req.user.schoolId.toString()) {
            return res.status(403).json({ error: "Forbidden: You can only access classrooms within your assigned school" });
        }

        res.json(classroom);
    } catch (error) {
        console.error("❌ Error fetching classroom by ID:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @route   POST /api/classrooms
 * @desc    Create a new classroom (Superadmin & School Admins)
 * @access  Private
 */
router.post('/', authenticateJWT, authorizeRoles(['superadmin', 'schooladmin']), async (req, res) => {
    try {
        console.log("🔹 Incoming Classroom Creation Request:", req.body);
        const { name, school, capacity } = req.body;

        if (!name || !capacity) {
            return res.status(400).json({ error: "All fields (name, capacity) are required" });
        }

        // **Ensure school ID is valid**
        let schoolId = req.user.schoolId; // Default to logged-in admin's school
        if (req.user.role === "superadmin" && school) {
            // Superadmins can specify school ID
            if (!mongoose.Types.ObjectId.isValid(school)) {
                return res.status(400).json({ error: "Invalid school ID format" });
            }
            schoolId = new mongoose.Types.ObjectId(school);
        } else if (school && school !== req.user.schoolId.toString()) {
            return res.status(403).json({ error: "Forbidden: You can only create classrooms for your assigned school" });
        }

        const newClassroom = await Classroom.create({ name, school: schoolId, capacity });

        console.log("✅ Classroom created successfully:", newClassroom);
        res.status(201).json(newClassroom);
    } catch (error) {
        console.error("❌ Error creating classroom:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @route   PUT /api/classrooms/:id
 * @desc    Update classroom details (Superadmin & School Admins)
 * @access  Private
 */
router.put('/:id', authenticateJWT, authorizeRoles(['superadmin', 'schooladmin']), async (req, res) => {
    try {
        console.log("🔹 Updating Classroom:", req.params.id, req.body);

        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({ error: "Classroom not found" });
        }

        // **Ensure school admin only updates classrooms in their school**
        if (req.user.role !== "superadmin" && classroom.school.toString() !== req.user.schoolId.toString()) {
            return res.status(403).json({ error: "Forbidden: You can only update classrooms within your assigned school" });
        }

        const updatedClassroom = await Classroom.findByIdAndUpdate(req.params.id, req.body, { new: true });

        console.log("✅ Classroom updated successfully:", updatedClassroom);
        res.json(updatedClassroom);
    } catch (error) {
        console.error("❌ Error updating classroom:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @route   DELETE /api/classrooms/:id
 * @desc    Delete a classroom (Superadmin & School Admins)
 * @access  Private
 */
router.delete('/:id', authenticateJWT, authorizeRoles(['superadmin', 'schooladmin']), async (req, res) => {
    try {
        console.log("🔹 Deleting Classroom:", req.params.id);

        const classroom = await Classroom.findById(req.params.id);
        if (!classroom) {
            return res.status(404).json({ error: "Classroom not found" });
        }

        // **Ensure school admin only deletes classrooms in their school**
        if (req.user.role !== "superadmin" && classroom.school.toString() !== req.user.schoolId.toString()) {
            return res.status(403).json({ error: "Forbidden: You can only delete classrooms within your assigned school" });
        }

        await Classroom.findByIdAndDelete(req.params.id);

        console.log("✅ Classroom deleted successfully");
        res.json({ message: "Classroom deleted successfully" });
    } catch (error) {
        console.error("❌ Error deleting classroom:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;