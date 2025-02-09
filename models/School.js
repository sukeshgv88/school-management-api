const mongoose = require('mongoose');

const SchoolSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: { type: String, required: true },
    principal: { type: String, required: true },
    admin: { type: String, required: true },  // ✅ Ensure admin is required
    address: { type: String, required: true } // ✅ Ensure address is required
}, { timestamps: true });

module.exports = mongoose.model('School', SchoolSchema);