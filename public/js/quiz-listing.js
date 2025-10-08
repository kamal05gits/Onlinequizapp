document.addEventListener('DOMContentLoaded', async () => {
    const quizList = document.getElementById('quizList');
    const quizListMessage = document.getElementById('quizListMessage');

    const API_BASE_URL = window.location.origin;

    try {
        const response = await fetch(`${API_BASE_URL}/api/quizzes`);
        const quizzes = await response.json();

        if (response.ok) {
            if (quizzes.length === 0) {
                quizListMessage.textContent = 'No quizzes available yet. Be the first to create one!';
            } else {
                quizzes.forEach(quiz => {
                    const listItem = document.createElement('li');
                    listItem.innerHTML = `
                        <span>${quiz.title} (by ${quiz.createdBy ? quiz.createdBy.username : 'Unknown'})</span>
                        <a href="/take-quiz.html?id=${quiz._id}">Take Quiz</a>
                    `;
                    quizList.appendChild(listItem);
                });
            }
        } else {
            quizListMessage.style.color = 'red';
            quizListMessage.textContent = data.msg || 'Failed to load quizzes.';
        }
    } catch (error) {
        console.error('Error fetching quizzes:', error);
        quizListMessage.style.color = 'red';
        quizListMessage.textContent = 'Network error. Could not load quizzes.';
    }
});