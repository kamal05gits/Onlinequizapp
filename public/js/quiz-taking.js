document.addEventListener('DOMContentLoaded', async () => {
    const quizTitleDisplay = document.getElementById('quizTitleDisplay');
    const quizContainer = document.getElementById('quizContainer');
    const questionNumberDisplay = document.getElementById('questionNumber');
    const questionTextDisplay = document.getElementById('questionText');
    const optionsContainer = document.getElementById('optionsContainer');
    const nextQuestionBtn = document.getElementById('nextQuestionBtn');
    const quizCompletedSection = document.getElementById('quizCompleted');
    const viewResultsLink = document.getElementById('viewResultsLink');

    const API_BASE_URL = window.location.origin;

    const urlParams = new URLSearchParams(window.location.search);
    const quizId = urlParams.get('id');

    let quizData = null;
    let currentQuestionIndex = 0;
    let userAnswers = []; // Store selected answers for results

    if (!quizId) {
        alert('No quiz ID provided!');
        window.location.href = '/quiz-list.html';
        return;
    }

    async function fetchQuiz() {
        try {
            const response = await fetch(`${API_BASE_URL}/api/quizzes/${quizId}`);
            const data = await response.json();

            if (response.ok) {
                quizData = data;
                quizTitleDisplay.textContent = quizData.title;
                quizContainer.style.display = 'block';
                loadQuestion();
            } else {
                alert(data.msg || 'Quiz not found!');
                window.location.href = '/quiz-list.html';
            }
        } catch (error) {
            console.error('Error fetching quiz:', error);
            alert('Network error. Could not load quiz.');
            window.location.href = '/quiz-list.html';
        }
    }

    function loadQuestion() {
        if (currentQuestionIndex < quizData.questions.length) {
            const question = quizData.questions[currentQuestionIndex];
            questionNumberDisplay.textContent = `Question ${currentQuestionIndex + 1} of ${quizData.questions.length}`;
            questionTextDisplay.textContent = question.questionText;
            optionsContainer.innerHTML = ''; // Clear previous options

            question.options.forEach(option => {
                const button = document.createElement('button');
                button.textContent = option;
                button.classList.add('option-button');
                button.addEventListener('click', () => selectOption(option, button));
                optionsContainer.appendChild(button);
            });

            // Check if there's a previously selected answer for this question
            const prevAnswer = userAnswers[currentQuestionIndex];
            if (prevAnswer) {
                Array.from(optionsContainer.children).forEach(btn => {
                    if (btn.textContent === prevAnswer) {
                        btn.classList.add('selected');
                    }
                });
            }
            nextQuestionBtn.textContent = currentQuestionIndex === quizData.questions.length - 1 ? 'Finish Quiz' : 'Next Question';
        } else {
            finishQuiz();
        }
    }

    function selectOption(selectedOption, button) {
        // Remove 'selected' class from all options first
        Array.from(optionsContainer.children).forEach(btn => btn.classList.remove('selected'));
        // Add 'selected' class to the clicked button
        button.classList.add('selected');
        userAnswers[currentQuestionIndex] = selectedOption;
    }

    nextQuestionBtn.addEventListener('click', () => {
        const selectedOption = userAnswers[currentQuestionIndex];
        if (!selectedOption) {
            alert('Please select an answer before proceeding!');
            return;
        }
        currentQuestionIndex++;
        loadQuestion();
    });

    function finishQuiz() {
        quizContainer.style.display = 'none';
        quizCompletedSection.style.display = 'block';

        // Store results in localStorage for the results page
        localStorage.setItem('lastQuizResults', JSON.stringify({
            quizId: quizData._id,
            quizTitle: quizData.title,
            questions: quizData.questions,
            userAnswers: userAnswers
        }));

        // Redirect to results page after a short delay
        setTimeout(() => {
            viewResultsLink.style.display = 'inline-block';
            window.location.href = `/results.html`;
        }, 1000);
    }

    fetchQuiz();
});