const express = require('express');
const router = express.Router();
const Quiz = require('../models/Quiz');
const jwt = require('jsonwebtoken');

// Middleware to protect routes
const protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded.id; // Attach user ID to request
            next();
        } catch (error) {
            res.status(401).json({ msg: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        res.status(401).json({ msg: 'Not authorized, no token' });
    }
};

// @route   POST /api/quizzes
// @desc    Create a new quiz
// @access  Private (requires authentication)
router.post('/', protect, async (req, res) => {
    const { title, description, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
        return res.status(400).json({ msg: 'Please enter title and at least one question' });
    }

    try {
        const quiz = new Quiz({
            title,
            description,
            questions,
            createdBy: req.user // Get user ID from the protected middleware
        });
        await quiz.save();
        res.status(201).json({ msg: 'Quiz created successfully', quiz });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/quizzes
// @desc    Get all quizzes
// @access  Public
router.get('/', async (req, res) => {
    try {
        const quizzes = await Quiz.find().populate('createdBy', 'username'); // Populate creator's username
        res.json(quizzes);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/quizzes/:id
// @desc    Get a single quiz by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id).populate('createdBy', 'username');
        if (!quiz) {
            return res.status(404).json({ msg: 'Quiz not found' });
        }
        res.json(quiz);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;