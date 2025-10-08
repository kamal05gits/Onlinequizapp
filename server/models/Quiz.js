const mongoose = require('mongoose');

// Define the schema for a single question within a quiz
const QuestionSchema = new mongoose.Schema({
    questionText: {
        type: String,
        required: true
    },
    options: {
        type: [String], // An array of strings for multiple-choice options
        required: true,
        // Custom validator to ensure at least two options are provided
        validate: {
            validator: function(v) {
                return v && v.length >= 2;
            },
            message: 'A question must have at least two options.'
        }
    },
    correctAnswer: {
        type: String, // The text of the correct answer (must match one of the options)
        required: true
    }
});

// Define the schema for the main Quiz model
const QuizSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        unique: true // Ensure quiz titles are unique
    },
    description: {
        type: String // Optional description for the quiz
    },
    questions: [QuestionSchema], // An array of QuestionSchema objects
    createdBy: {
        type: mongoose.Schema.Types.ObjectId, // This field will store the ID of the user who created the quiz
        ref: 'User', // This tells Mongoose that the ID refers to the 'User' model
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now // Automatically set creation date
    }
});

// Export the Quiz model
module.exports = mongoose.model('Quiz', QuizSchema);