const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); // For password hashing

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true // Ensure usernames are unique
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set creation date
    }
});

// Middleware to hash password before saving a user
// 'pre' hook runs before the 'save' operation
UserSchema.pre('save', async function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) {
        next(); // Move to the next middleware or save operation
    }
    // Generate a salt (random string) with 10 rounds
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the generated salt
    this.password = await bcrypt.hash(this.password, salt);
    next(); // Move to the next middleware or save operation
});

// Method to compare entered password with the hashed password in the database
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // Use bcrypt to compare the plain text enteredPassword with the hashed password
    return await bcrypt.compare(enteredPassword, this.password);
};

// Export the User model
module.exports = mongoose.model('User', UserSchema);