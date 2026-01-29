console.log('🚀 Quiz loaded! quiz.js is running');

// Career color mapping (consistent with career explorer)
const careerColors = {
    'Construction Manager': 'blue',
    'Quantity Surveyor': 'green',
    'Electrician': 'blue',
    'Plumber': 'green',
    'Crane Operator': 'blue'
};

// Career descriptions for results page
const careerDescriptions = {
    'Construction Manager': 'Oversee on-site delivery of projects, leading site teams and ensuring work is completed safely and efficiently.',
    'Quantity Surveyor': 'Plan, manage and report on construction costs from early design through to project completion.',
    'Electrician': 'Install, maintain and repair electrical systems, making sure buildings are safe, reliable and energy efficient.',
    'Plumber': 'Install and maintain water, drainage and gas systems, playing a key role in making buildings safe and liveable.',
    'Crane Operator': 'Operate lifting equipment to move heavy materials and equipment safely around construction sites.'
};

// State management
let currentQuestionIndex = 0;
let selectedAnswers = [];
let scores = {};

// DOM elements
const startBtn = document.getElementById('startBtn');
const exploreBtn = document.getElementById('exploreBtn');
const retakeBtn = document.getElementById('retakeBtn');
const resultsGrid = document.getElementById('resultsGrid');

// Get all screens
const screens = {
    intro: document.getElementById('intro'),
    question1: document.getElementById('question-1'),
    question2: document.getElementById('question-2'),
    question3: document.getElementById('question-3'),
    results: document.getElementById('results')
};

// Get all question screens in order
const questionScreens = [
    screens.question1,
    screens.question2,
    screens.question3
];

// Initialize event listeners
function initializeEventListeners() {
    // Start button
    if (startBtn) {
        startBtn.addEventListener('click', startQuiz);
    }

    // Answer buttons for all questions
    questionScreens.forEach((screen, index) => {
        const answerButtons = screen.querySelectorAll('.answer-btn');
        answerButtons.forEach(button => {
            button.addEventListener('click', () => selectAnswer(button, index));
        });
    });

    // Explore button
    if (exploreBtn) {
        exploreBtn.addEventListener('click', navigateToExplorer);
    }

    // Retake button
    if (retakeBtn) {
        retakeBtn.addEventListener('click', retakeQuiz);
    }
}

// Start the quiz
function startQuiz() {
    console.log('📝 Starting quiz...');
    currentQuestionIndex = 0;
    selectedAnswers = [];
    scores = {};

    // Hide intro, show first question
    switchScreen(screens.intro, screens.question1);
}

// Switch between screens with animation
function switchScreen(fromScreen, toScreen) {
    // Fade out current screen
    fromScreen.classList.remove('active');

    // Wait for fade-out, then show new screen
    setTimeout(() => {
        fromScreen.style.display = 'none';
        toScreen.style.display = 'flex';

        // Trigger reflow
        toScreen.offsetHeight;

        // Fade in new screen
        toScreen.classList.add('active');
    }, 300);
}

// Select an answer
function selectAnswer(button, questionIndex) {
    console.log(`✅ Answer selected for question ${questionIndex + 1}`);

    // Get the careers from the button data
    const careersData = button.getAttribute('data-careers');
    const careers = JSON.parse(careersData);

    // Visual feedback - highlight selected answer
    const allAnswers = button.parentElement.querySelectorAll('.answer-btn');
    allAnswers.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');

    // Store the answer
    selectedAnswers[questionIndex] = careers;

    // Wait a moment for visual feedback, then proceed
    setTimeout(() => {
        nextQuestion();
    }, 400);
}

// Move to next question or show results
function nextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex < questionScreens.length) {
        // Show next question
        const currentScreen = questionScreens[currentQuestionIndex - 1];
        const nextScreen = questionScreens[currentQuestionIndex];
        switchScreen(currentScreen, nextScreen);
    } else {
        // All questions answered, calculate and show results
        calculateScores();
        showResults();
    }
}

// Calculate scores based on answers
function calculateScores() {
    console.log('🧮 Calculating scores...');
    scores = {};

    // Initialize scores for all possible careers
    Object.keys(careerColors).forEach(career => {
        scores[career] = 0;
    });

    // Add points for each answer
    selectedAnswers.forEach(careers => {
        careers.forEach(career => {
            if (scores[career] !== undefined) {
                scores[career]++;
            }
        });
    });

    console.log('📊 Final scores:', scores);
}

// Show results screen
function showResults() {
    console.log('🎉 Showing results...');

    // Sort careers by score (descending), then alphabetically
    const sortedResults = Object.entries(scores)
        .map(([name, score]) => ({
            name,
            score,
            percentage: Math.round((score / 3) * 100),
            color: careerColors[name] || 'blue',
            description: careerDescriptions[name] || ''
        }))
        .sort((a, b) => {
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.name.localeCompare(b.name);
        })
        .filter(career => career.score > 0); // Only show careers with at least 1 match

    // Render result cards
    renderResults(sortedResults);

    // Save to localStorage
    saveToLocalStorage(sortedResults);

    // Switch to results screen
    const lastQuestionScreen = questionScreens[questionScreens.length - 1];
    switchScreen(lastQuestionScreen, screens.results);
}

// Render result cards
function renderResults(results) {
    resultsGrid.innerHTML = '';

    if (results.length === 0) {
        resultsGrid.innerHTML = '<p style="text-align: center; color: #718096;">No matches found. Please retake the quiz.</p>';
        return;
    }

    results.forEach(career => {
        const card = createResultCard(career);
        resultsGrid.appendChild(card);
    });
}

// Create a result card element
function createResultCard(career) {
    const card = document.createElement('div');
    card.className = 'result-card';

    // Career dot
    const dot = document.createElement('div');
    dot.className = `career-dot ${career.color}`;

    // Career info
    const info = document.createElement('div');
    info.className = 'career-info';

    const name = document.createElement('div');
    name.className = 'career-name';
    name.textContent = career.name;

    const description = document.createElement('div');
    description.className = 'career-description';
    description.textContent = career.description;

    info.appendChild(name);
    info.appendChild(description);

    // Match info
    const matchInfo = document.createElement('div');
    matchInfo.className = 'match-info';

    const badge = document.createElement('div');
    badge.className = 'match-badge';
    badge.textContent = `${career.percentage}% Match`;

    const dots = document.createElement('div');
    dots.className = 'match-dots';

    // Create 3 dots, fill based on score
    for (let i = 0; i < 3; i++) {
        const matchDot = document.createElement('div');
        matchDot.className = 'match-dot';
        if (i < career.score) {
            matchDot.classList.add('filled');
        }
        dots.appendChild(matchDot);
    }

    matchInfo.appendChild(badge);
    matchInfo.appendChild(dots);

    // Assemble card
    card.appendChild(dot);
    card.appendChild(info);
    card.appendChild(matchInfo);

    return card;
}

// Save quiz results to localStorage
function saveToLocalStorage(results) {
    const quizData = {
        timestamp: Date.now(),
        scores: scores,
        topMatches: results.slice(0, 3).map(r => r.name),
        colors: careerColors
    };

    try {
        localStorage.setItem('quizResults', JSON.stringify(quizData));
        console.log('💾 Quiz results saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving to localStorage:', error);
    }
}

// Navigate to career explorer with quiz results
function navigateToExplorer() {
    console.log('🚀 Navigating to career explorer...');
    window.location.href = 'careers-explorer.html';
}

// Retake the quiz
function retakeQuiz() {
    console.log('🔄 Retaking quiz...');

    // Clear localStorage
    try {
        localStorage.removeItem('quizResults');
        console.log('🗑️ Quiz results cleared from localStorage');
    } catch (error) {
        console.error('❌ Error clearing localStorage:', error);
    }

    // Reset state
    currentQuestionIndex = 0;
    selectedAnswers = [];
    scores = {};

    // Clear all selected answers visually
    questionScreens.forEach(screen => {
        const answerButtons = screen.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => btn.classList.remove('selected'));
    });

    // Go back to intro
    switchScreen(screens.results, screens.intro);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ DOM loaded, initializing quiz...');
    initializeEventListeners();

    // Check if there are existing quiz results
    const existingResults = localStorage.getItem('quizResults');
    if (existingResults) {
        console.log('📋 Found existing quiz results in localStorage');
    }
});
