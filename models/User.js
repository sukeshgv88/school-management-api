const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['superadmin', 'schooladmin'], default: 'schooladmin' },
    schoolId: { type: mongoose.Schema.Types.ObjectId, ref: 'School' }
});

// ✅ Ensure password is hashed only if it's new or changed
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        if (!this.password.startsWith('$2b$')) {
            console.log("🔄 Hashing Password Before Save...");
            this.password = await bcrypt.hash(this.password, 10);
        } else {
            console.log("⚠️ Password already hashed, skipping...");
        }
    } catch (error) {
        console.error("❌ Error hashing password:", error);
        return next(error);
    }
    next();
});

// ✅ Prevent rehashing on updates via `findOneAndUpdate`
UserSchema.pre('findOneAndUpdate', async function (next) {
    const update = this.getUpdate();
    if (update && update.password) {
        if (!update.password.startsWith('$2b$')) {
            console.log("🔄 Hashing Password Before Update...");
            update.password = await bcrypt.hash(update.password, 10);
        } else {
            console.log("⚠️ Password already hashed, skipping update...");
        }
    }
    next();
});

// ✅ Method to compare passwords during login
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', UserSchema);