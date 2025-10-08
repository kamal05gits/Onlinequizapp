document.addEventListener('DOMContentLoaded', () => {
    const resultsQuizTitle = document.getElementById('resultsQuizTitle');
    const scoreDisplay = document.getElementById('scoreDisplay');
    const totalQuestionsDisplay = document.getElementById('totalQuestionsDisplay');
    const correctAnswersList = document.getElementById('correctAnswersList');

    const results = JSON.parse(localStorage.getItem('lastQuizResults'));

    if (results) {
        resultsQuizTitle.textContent = results.quizTitle;
        totalQuestionsDisplay.textContent = results.questions.length;

        let score = 0;
        results.questions.forEach((question, index) => {
            const userAnswer = results.userAnswers[index];
            const isCorrect = userAnswer === question.correctAnswer;
            if (isCorrect) {
                score++;
            }

            const listItem = document.createElement('li');
            listItem.innerHTML = `
                <strong>Q${index + 1}:</strong> ${question.questionText}<br>
                Your Answer: <span style="color: ${isCorrect ? 'green' : 'red'};">${userAnswer || 'Not Answered'}</span><br>
                Correct Answer: <span style="color: green;">${question.correctAnswer}</span>
            `;
            correctAnswersList.appendChild(listItem);
        });

        scoreDisplay.textContent = score;
    } else {
        // No results found, perhaps user navigated directly
        resultsQuizTitle.textContent = 'No quiz results found.';
        scoreDisplay.textContent = 'N/A';
        totalQuestionsDisplay.textContent = 'N/A';
    }
});