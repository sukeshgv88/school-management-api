const express = require('express');
const Student = require('../models/Student');
const Classroom = require('../models/Classroom');
const { authenticateJWT, authorizeRoles } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   GET /api/students
 * @desc    Get all students (Superadmin only)
 * @access  Private (Superadmin)
 */
router.get('/', authenticateJWT, authorizeRoles(['superadmin','schooladmin']), async (req, res) => {
    try {
        const students = await Student.find().populate('classroom');
        res.json(students);
    } catch (error) {
        console.error("❌ Error fetching students:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @route   GET /api/students/:id
 * @desc    Get student by ID (Superadmin can access all, School Admin can access only their school)
 * @access  Private (Superadmin, School Admins)
 */
router.get('/:id', authenticateJWT, authorizeRoles(['superadmin','schooladmin']), async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate('classroom');

        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        res.json(student);
    } catch (error) {
        console.error("❌ Error fetching student by ID:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @route   POST /api/students
 * @desc    Enroll a new student (School Admins only, tied to their assigned school)
 * @access  Private (School Admins)
 */
router.post('/', authenticateJWT, authorizeRoles(['superadmin', 'schooladmin']), async (req, res) => {
    try {
        console.log("🔹 Incoming Student Enrollment Request:", req.body);
        
        // ✅ Correct field names
        const { name, age, grade, classroom } = req.body;

        // ✅ Validate input fields
        if (!name || !age || !grade || !classroom) {
            return res.status(400).json({ error: "Name, age, grade, and classroom ID are required" });
        }

        // ✅ Ensure the classroom exists in DB
        const existingClassroom = await Classroom.findById(classroom);
        if (!existingClassroom) {
            return res.status(400).json({ error: "Invalid classroom ID" });
        }

        console.log("✅ Classroom Exists:", existingClassroom);

        // ✅ Create new student
        const newStudent = new Student({
            name,
            age,
            grade,
            classroom: existingClassroom._id // ✅ Use correct field name
        });

        await newStudent.save();
        console.log("✅ Student enrolled successfully:", newStudent);

        res.status(201).json(newStudent);
    } catch (error) {
        console.error("❌ Error enrolling student:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @route   PUT /api/students/:id
 * @desc    Update student details (School Admins only for their school)
 * @access  Private (School Admins)
 */
router.put('/:id', authenticateJWT, authorizeRoles(['superadmin','schooladmin']), async (req, res) => {
    try {
        console.log("🔹 Updating Student:", req.params.id, req.body);

        // Find the student
        const student = await Student.findById(req.params.id).populate('classroom');
        if (!student) {
            return res.status(404).json({ error: "Student not found" });
        }

        // Ensure school admin only updates students within their school
        if (student.classroom.school.toString() !== req.user.schoolId.toString()) {
            return res.status(403).json({ error: "Forbidden: You can only update students within your assigned school" });
        }

        // Update student
        const updatedStudent = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });

        console.log("✅ Student updated successfully:", updatedStudent);
        res.json(updatedStudent);
    } catch (error) {
        console.error("❌ Error updating student:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

/**
 * @route   DELETE /api/students/:id
 * @desc    Delete a student (School Admins only for their school)
 * @access  Private (School Admins)
 */
router.delete('/:id', authenticateJWT, authorizeRoles(['superadmin', 'schooladmin']), async (req, res) => {
    try {
        console.log("🔹 Deleting Student:", req.params.id);

        // 🔹 Find the student before deleting
        const student = await Student.findById(req.params.id);
        if (!student) {
            console.warn("⚠️ Student not found:", req.params.id);
            return res.status(404).json({ error: "Student not found" });
        }

        // 🔹 Ensure `_id` exists before calling `toString()`
        if (!student._id) {
            console.error("❌ Student has no _id:", student);
            return res.status(500).json({ error: "Invalid student record" });
        }

        await Student.findByIdAndDelete(req.params.id);

        console.log("✅ Student deleted successfully:", student._id.toString());
        res.json({ message: "Student deleted successfully" });

    } catch (error) {
        console.error("❌ Error deleting student:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

module.exports = router;