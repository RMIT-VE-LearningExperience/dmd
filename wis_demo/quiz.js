console.log('🚀 Quiz loaded! quiz.js is running');

// Career data loaded from wis.json
let careersData = null;

// Career color mapping (consistent with career explorer)
const careerColorMap = {
    'Construction Manager': 'blue',
    'Quantity Surveyor': 'green',
    'Electrician': 'blue',
    'Plumber': 'green',
    'Crane Operator': 'blue',
    'Building Estimator': 'green',
    'Contract Administrator': 'blue',
    'Project Coordinator': 'green',
    'Project Manager': 'blue',
    'Project Engineer': 'green',
    'Health and Safety Officer': 'blue',
    'Waterproofer': 'green',
    'Tiler': 'blue',
    'Heavy Vehicle Operator': 'green',
    'Site Supervisor': 'blue'
};

// Function to get consistent color for a career
function getCareerColor(careerName) {
    return careerColorMap[careerName] || 'blue';
}

// Load career data from JSON file
async function loadCareerData() {
    try {
        const response = await fetch('wis.json');
        careersData = await response.json();
        console.log('✅ Career data loaded from wis.json:', careersData.roles.length, 'careers');
    } catch (error) {
        console.error('❌ Failed to load career data:', error);
        careersData = { roles: [] };
    }
}

// State management
let currentQuestionIndex = 0;
let selectedSkills = []; // Changed from selectedAnswers - now accumulating skills
let careerScores = {};

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
    selectedSkills = [];
    careerScores = {};

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

    // Get the skills from the button data
    const skillsData = button.getAttribute('data-skills');
    const skills = JSON.parse(skillsData);

    // Visual feedback - highlight selected answer
    const allAnswers = button.parentElement.querySelectorAll('.answer-btn');
    allAnswers.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');

    // Accumulate the skills from this answer
    selectedSkills.push(...skills);
    console.log(`📝 Skills selected:`, skills);
    console.log(`📝 Total skills accumulated:`, selectedSkills);

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

// Calculate scores based on skill matching
function calculateScores() {
    console.log('🧮 Calculating skill-based scores...');
    console.log('📝 Selected skills:', selectedSkills);

    careerScores = {};

    if (!careersData || !careersData.roles) {
        console.error('❌ No career data available for scoring');
        return;
    }

    // Calculate match score for each career
    careersData.roles.forEach(career => {
        const careerSkills = career.core_skills || [];

        // Find matching skills between user selections and career requirements
        const matchingSkills = careerSkills.filter(skill =>
            selectedSkills.includes(skill)
        );

        // Calculate score as percentage of selected skills that match this career
        const score = selectedSkills.length > 0
            ? (matchingSkills.length / selectedSkills.length) * 100
            : 0;

        careerScores[career.name] = {
            score: Math.round(score),
            matchingSkills: matchingSkills,
            totalCareerSkills: careerSkills.length,
            matchCount: matchingSkills.length
        };

        console.log(`   ${career.name}: ${Math.round(score)}% (${matchingSkills.length}/${selectedSkills.length} skills match)`);
    });

    console.log('📊 Final career scores:', careerScores);
}

// Show results screen
function showResults() {
    console.log('🎉 Showing results...');

    // Get career data from careersData
    const sortedResults = Object.entries(careerScores)
        .map(([name, scoreData]) => {
            // Find the full career object from careersData
            const careerObj = careersData.roles.find(c => c.name === name);

            return {
                name,
                score: scoreData.score,
                percentage: scoreData.score,
                matchCount: scoreData.matchCount,
                color: getCareerColor(name),
                description: careerObj ? careerObj.overview : '',
                matchingSkills: scoreData.matchingSkills
            };
        })
        .sort((a, b) => {
            // Sort by score descending, then alphabetically
            if (b.score !== a.score) {
                return b.score - a.score;
            }
            return a.name.localeCompare(b.name);
        })
        .filter(career => career.score > 0); // Only show careers with at least 1% match

    console.log('🎯 Sorted results:', sortedResults);

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

    // Create 3 dots, fill based on percentage thresholds
    // 0-33% = 1 dot, 34-66% = 2 dots, 67-100% = 3 dots
    const dotCount = career.percentage >= 67 ? 3 : (career.percentage >= 34 ? 2 : 1);

    for (let i = 0; i < 3; i++) {
        const matchDot = document.createElement('div');
        matchDot.className = 'match-dot';
        if (i < dotCount) {
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
    // Convert careerScores to simple score object for backward compatibility
    const simpleScores = {};
    Object.entries(careerScores).forEach(([name, data]) => {
        simpleScores[name] = data.score;
    });

    const quizData = {
        timestamp: Date.now(),
        scores: simpleScores,
        selectedSkills: selectedSkills,
        topMatches: results.slice(0, 3).map(r => r.name),
        colors: careerColorMap
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
    selectedSkills = [];
    careerScores = {};

    // Clear all selected answers visually
    questionScreens.forEach(screen => {
        const answerButtons = screen.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => btn.classList.remove('selected'));
    });

    // Go back to intro
    switchScreen(screens.results, screens.intro);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ DOM loaded, initializing quiz...');

    // Load career data from wis.json
    await loadCareerData();

    if (!careersData || !careersData.roles) {
        console.error('❌ Failed to load career data - quiz cannot function');
        return;
    }

    initializeEventListeners();

    // Check if there are existing quiz results
    const existingResults = localStorage.getItem('quizResults');
    if (existingResults) {
        console.log('📋 Found existing quiz results in localStorage');
    }
});
