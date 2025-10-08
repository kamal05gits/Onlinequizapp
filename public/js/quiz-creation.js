document.addEventListener('DOMContentLoaded', () => {
    const createQuizForm = document.getElementById('createQuizForm');
    const questionsContainer = document.getElementById('questionsContainer');
    const addQuestionBtn = document.getElementById('addQuestionBtn');
    const createQuizMessage = document.getElementById('createQuizMessage');

    const API_BASE_URL = window.location.origin;

    let questionCount = 1;

    // Function to add a new question block
    function addQuestionBlock(initialData = {}) {
        const questionBlock = document.createElement('div');
        questionBlock.classList.add('question-block');
        questionBlock.innerHTML = `
            <label>Question ${questionCount}:</label>
            <input type="text" class="question-text" value="${initialData.questionText || ''}" required>
            <label>Options (comma-separated):</label>
            <input type="text" class="options-input" placeholder="e.g., Option A, Option B, Option C" value="${initialData.options ? initialData.options.join(', ') : ''}" required>
            <label>Correct Answer (must match one of the options):</label>
            <input type="text" class="correct-answer" value="${initialData.correctAnswer || ''}" required>
            <button type="button" class="remove-question-btn">Remove</button>
        `;
        questionsContainer.appendChild(questionBlock);
        questionCount++;

        // Show/hide remove buttons based on total question count
        const removeButtons = document.querySelectorAll('.remove-question-btn');
        if (questionsContainer.children.length > 1) {
            removeButtons.forEach(btn => btn.style.display = 'inline-block');
        } else {
            removeButtons.forEach(btn => btn.style.display = 'none'); // Hide if only one question
        }
    }

    // ADDED: Call addQuestionBlock() here to create the initial question 1 after DOM is loaded
    addQuestionBlock();

    addQuestionBtn.addEventListener('click', () => addQuestionBlock());

    questionsContainer.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-question-btn')) {
            if (questionsContainer.children.length > 1) {
                e.target.closest('.question-block').remove();
                // Re-index questions after removal
                Array.from(questionsContainer.children).forEach((block, index) => {
                    block.querySelector('label').textContent = `Question ${index + 1}:`;
                });
                questionCount = questionsContainer.children.length + 1;
                // If only one question remains, hide its remove button
                if (questionsContainer.children.length === 1) {
                    document.querySelector('.remove-question-btn').style.display = 'none';
                }
            } else {
                alert('You must have at least one question.');
            }
        }
    });

    createQuizForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const quizTitle = document.getElementById('quizTitle').value.trim();
        const quizDescription = document.getElementById('quizDescription').value.trim();
        const questions = [];

        let isValid = true;
        Array.from(questionsContainer.children).forEach((block) => {
            const questionText = block.querySelector('.question-text').value.trim();
            const optionsInput = block.querySelector('.options-input').value.trim();
            const correctAnswer = block.querySelector('.correct-answer').value.trim();

            const options = optionsInput.split(',').map(opt => opt.trim()).filter(opt => opt !== '');

            if (!questionText || options.length < 2 || !correctAnswer || !options.includes(correctAnswer)) {
                isValid = false;
                createQuizMessage.style.color = 'red';
                createQuizMessage.textContent = 'Please fill all question fields correctly. Ensure correct answer is one of the options.';
                return; // Exit this forEach iteration
            }

            questions.push({ questionText, options, correctAnswer });
        });

        if (!isValid || !quizTitle || questions.length === 0) { // Ensure quizTitle is also checked
            createQuizMessage.style.color = 'red';
            createQuizMessage.textContent = 'Please fill all quiz details and ensure all questions are valid.';
            return; // Stop function execution if validation fails
        }

        const token = localStorage.getItem('token');
        if (!token) {
            alert('You must be logged in to create a quiz.');
            window.location.href = '/'; // Redirect to home/login
            return;
        }

        try {
            const response = await fetch(`${API_BASE_URL}/api/quizzes`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title: quizTitle, description: quizDescription, questions }),
            });

            const data = await response.json();

            if (response.ok) {
                createQuizMessage.style.color = 'green';
                createQuizMessage.textContent = data.msg;
                createQuizForm.reset();
                // Reset questions container
                questionsContainer.innerHTML = '';
                questionCount = 1;
                addQuestionBlock(); // Add back one empty question
                setTimeout(() => {
                    window.location.href = '/quiz-list.html'; // Redirect after successful creation
                }, 1500);
            } else {
                createQuizMessage.style.color = 'red';
                createQuizMessage.textContent = data.msg || 'Failed to create quiz.';
            }
        } catch (error) {
            console.error('Error creating quiz:', error);
            createQuizMessage.style.color = 'red';
            createQuizMessage.textContent = 'Network error. Please try again.';
        }
    });
});