const Student = require('../../models/Student');
const Classroom = require('../../models/Classroom'); // ✅ Import Classroom model

class StudentManager {
    constructor({ config, cache }) {
        this.config = config;
        this.cache = cache;
    }

    /** ✅ Create Student */
    async createStudent(data) {
        const { name, age, grade, classroom } = data;

        if (!name || !age || !grade || !classroom) {
            throw new Error("Missing required fields: name, age, grade, classroom");
        }

        const existingClassroom = await Classroom.findById(classroom);
        if (!existingClassroom) {
            throw new Error("Invalid classroom ID: No classroom found");
        }

        const newStudent = new Student({ name, age, grade, classroom });
        return await newStudent.save();
    }

    /** ✅ Get All Students */
    async getStudents() {  // <-- ✅ Ensure method name matches route usage
        return await Student.find().populate('classroom');
    }

    /** ✅ Get Students by Classroom */
    async getStudentsByClassroom(classroomId) {
        return await Student.find({ classroom: classroomId }).populate('classroom');
    }

    /** ✅ Get a Single Student */
    async getStudentById(id) {
        return await Student.findById(id).populate('classroom');
    }

    /** ✅ Update Student */
    async updateStudent(id, updateData) {
        return await Student.findByIdAndUpdate(id, updateData, { new: true }).populate('classroom');
    }

    /** ✅ Delete Student */
    async deleteStudent(id) {
        return await Student.findByIdAndDelete(id);
    }
}

module.exports = StudentManager;