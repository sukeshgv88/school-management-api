const Classroom = require('../../models/Classroom');

class ClassroomManager {
    async createClassroom(data) {
        try {
            if (!data.name || !data.capacity || !data.school) {
                throw new Error("Missing required fields: name, capacity, school");
            }
            const newClassroom = new Classroom(data);
            return await newClassroom.save();
        } catch (error) {
            throw new Error(`Error creating classroom: ${error.message}`);
        }
    }

    async getAllClassrooms() {
        return await Classroom.find().populate('school');
    }

    async getClassroomById(id) {
        return await Classroom.findById(id).populate('school');
    }

    async updateClassroom(id, data) {
        return await Classroom.findByIdAndUpdate(id, data, { new: true }).populate('school');
    }

    async deleteClassroom(id) {
        return await Classroom.findByIdAndDelete(id);
    }
}

module.exports = ClassroomManager;