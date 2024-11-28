const mongoose = require("mongoose")
const bcrypt = require('bcrypt');

var AdminSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // Store hashed passwords
    role:     { type: String, required: true},
})

// Pre-save middleware to hash the password
AdminSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next(); // Skip if password is not modified
    }

    try {
        // Generate a salt and hash the password
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

module.exports = mongoose.model("Admin", AdminSchema);