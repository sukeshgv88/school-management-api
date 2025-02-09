const School = require('../../models/School');

class SchoolManager {
    constructor({ config, cache }) {
        this.config = config;
        this.cache = cache;
    }

    async createSchool(data) {
        const school = new School(data);
        await school.save();
        return school;
    }

    async getAllSchools() {
        return await School.find();
    }

    async getSchoolById(id) {
        return await School.findById(id);
    }

    async updateSchool(id, updateData) {
        return await School.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteSchool(id) {
        return await School.findByIdAndDelete(id);
    }
}

module.exports = SchoolManager;