console.log('🚀 Quiz loaded! quiz.js is running');

// Career data loaded from wis.json
let careersData = null;

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

// ===================================
// COLOR TIER LOGIC
// ===================================
// >= 50%  → green
// 34–49%  → yellow
// < 34%   → orange

function getMatchTier(percentage) {
    if (percentage >= 50) return 'green';
    if (percentage >= 34) return 'yellow';
    return 'orange';
}

// ===================================
// STATE
// ===================================
let currentQuestionIndex = 0;
let selectedSkills = [];
let careerScores = {};

// ===================================
// DOM ELEMENTS
// ===================================
const startBtn = document.getElementById('startBtn');
const skipBtn = document.getElementById('skipBtn');
const exploreBtn = document.getElementById('exploreBtn');
const retakeBtn = document.getElementById('retakeBtn');
const resultsGrid = document.getElementById('resultsGrid');

const screens = {
    intro: document.getElementById('intro'),
    question1: document.getElementById('question-1'),
    question2: document.getElementById('question-2'),
    question3: document.getElementById('question-3'),
    results: document.getElementById('results')
};

const questionScreens = [
    screens.question1,
    screens.question2,
    screens.question3
];

// ===================================
// EVENT LISTENERS
// ===================================
function initializeEventListeners() {
    if (startBtn) {
        startBtn.addEventListener('click', startQuiz);
    }

    if (skipBtn) {
        skipBtn.addEventListener('click', skipQuiz);
    }

    questionScreens.forEach((screen, index) => {
        const answerButtons = screen.querySelectorAll('.answer-btn');
        answerButtons.forEach(button => {
            button.addEventListener('click', () => selectAnswer(button, index));
        });
    });

    if (exploreBtn) {
        exploreBtn.addEventListener('click', navigateToExplorer);
    }

    if (retakeBtn) {
        retakeBtn.addEventListener('click', retakeQuiz);
    }
}

// ===================================
// QUIZ FLOW
// ===================================
function startQuiz() {
    console.log('📝 Starting quiz...');
    currentQuestionIndex = 0;
    selectedSkills = [];
    careerScores = {};
    switchScreen(screens.intro, screens.question1);
}

function skipQuiz() {
    console.log('⏭️ Skipping quiz...');
    window.location.href = 'careers-explorer.html';
}

function switchScreen(fromScreen, toScreen) {
    fromScreen.classList.remove('active');
    setTimeout(() => {
        fromScreen.style.display = 'none';
        toScreen.style.display = 'flex';
        toScreen.offsetHeight; // trigger reflow
        toScreen.classList.add('active');
    }, 300);
}

function selectAnswer(button, questionIndex) {
    console.log(`✅ Answer selected for question ${questionIndex + 1}`);

    const skillsData = button.getAttribute('data-skills');
    const skills = JSON.parse(skillsData);

    // Visual feedback
    const allAnswers = button.parentElement.querySelectorAll('.answer-btn');
    allAnswers.forEach(btn => btn.classList.remove('selected'));
    button.classList.add('selected');

    // Accumulate skills
    selectedSkills.push(...skills);
    console.log(`📝 Skills selected:`, skills);

    setTimeout(() => {
        nextQuestion();
    }, 400);
}

function nextQuestion() {
    currentQuestionIndex++;

    if (currentQuestionIndex < questionScreens.length) {
        const currentScreen = questionScreens[currentQuestionIndex - 1];
        const nextScreen = questionScreens[currentQuestionIndex];
        switchScreen(currentScreen, nextScreen);
    } else {
        calculateScores();
        showResults();
    }
}

// ===================================
// SCORING
// ===================================
function calculateScores() {
    console.log('🧮 Calculating skill-based scores...');
    const uniqueSelectedSkills = [...new Set(selectedSkills)];
    console.log('📝 Unique skills:', uniqueSelectedSkills);

    careerScores = {};

    if (!careersData || !careersData.roles) {
        console.error('❌ No career data available for scoring');
        return;
    }

    careersData.roles.forEach(career => {
        const careerSkills = career.core_skills || [];
        const matchingSkills = careerSkills.filter(skill =>
            uniqueSelectedSkills.includes(skill)
        );

        const score = careerSkills.length > 0
            ? (matchingSkills.length / careerSkills.length) * 100
            : 0;

        careerScores[career.name] = {
            score: Math.round(score),
            matchingSkills: matchingSkills,
            totalCareerSkills: careerSkills.length,
            matchCount: matchingSkills.length
        };

        console.log(`   ${career.name}: ${Math.round(score)}% (${matchingSkills.length}/${careerSkills.length} skills matched)`);
    });

    console.log('📊 Final career scores:', careerScores);
}

// ===================================
// RESULTS
// ===================================
function showResults() {
    console.log('🎉 Showing results...');

    const allResults = Object.entries(careerScores)
        .map(([name, scoreData]) => {
            const careerObj = careersData.roles.find(c => c.name === name);
            return {
                name,
                score: scoreData.score,
                percentage: scoreData.score,
                matchCount: scoreData.matchCount,
                description: careerObj ? careerObj.overview : '',
                matchingSkills: scoreData.matchingSkills
            };
        })
        .sort((a, b) => {
            if (b.score !== a.score) return b.score - a.score;
            return a.name.localeCompare(b.name);
        });

    const topResults = allResults.filter(c => c.score > 0).slice(0, 3);
    const otherResults = allResults.filter(c => !topResults.includes(c));

    console.log('🎯 Top 3 results:', topResults);
    console.log('📋 Other careers:', otherResults.length);

    renderResults(topResults, otherResults);
    saveToLocalStorage(topResults);

    const lastQuestionScreen = questionScreens[questionScreens.length - 1];
    switchScreen(lastQuestionScreen, screens.results);
}

function renderResults(topResults, otherResults) {
    resultsGrid.innerHTML = '';

    if (topResults.length === 0) {
        resultsGrid.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);">No matches found. Please retake the quiz.</p>';
        return;
    }

    // Top 3 matches with full percentage cards
    topResults.forEach(career => {
        const card = createResultCard(career);
        resultsGrid.appendChild(card);
    });

    // Remaining careers in a compact list
    if (otherResults && otherResults.length > 0) {
        const divider = document.createElement('div');
        divider.className = 'results-divider';
        divider.innerHTML = '<span>OTHER CAREERS TO EXPLORE</span>';
        resultsGrid.appendChild(divider);

        const otherGrid = document.createElement('div');
        otherGrid.className = 'other-careers-grid';

        otherResults.forEach(career => {
            const item = document.createElement('div');
            item.className = 'other-career-item';

            const name = document.createElement('div');
            name.className = 'other-career-name';
            name.textContent = career.name;

            const score = document.createElement('div');
            score.className = 'other-career-score';
            score.textContent = career.score > 0 ? career.score + '% match' : 'Not matched';

            item.appendChild(name);
            item.appendChild(score);
            otherGrid.appendChild(item);
        });

        resultsGrid.appendChild(otherGrid);
    }
}

// Build a result card matching the screenshot layout:
//   [ colored % badge | colored border | career name + description ]
function createResultCard(career) {
    const tier = getMatchTier(career.percentage);

    // Outer card
    const card = document.createElement('div');
    card.className = `result-card tier-${tier}`;

    // Left: percentage badge
    const badge = document.createElement('div');
    badge.className = `match-badge tier-${tier}`;

    const percent = document.createElement('div');
    percent.className = 'match-percent';
    percent.textContent = `${career.percentage}%`;

    const label = document.createElement('div');
    label.className = 'match-label';
    label.textContent = 'Match';

    badge.appendChild(percent);
    badge.appendChild(label);

    // Right: career info wrapper (with colored left border)
    const infoWrapper = document.createElement('div');
    infoWrapper.className = 'career-info-wrapper';

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
    infoWrapper.appendChild(info);

    // Assemble
    card.appendChild(badge);
    card.appendChild(infoWrapper);

    return card;
}

// ===================================
// LOCAL STORAGE
// ===================================
function saveToLocalStorage(results) {
    const simpleScores = {};
    Object.entries(careerScores).forEach(([name, data]) => {
        simpleScores[name] = data.score;
    });

    const quizData = {
        timestamp: Date.now(),
        scores: simpleScores,
        selectedSkills: selectedSkills,
        topMatches: results.slice(0, 3).map(r => r.name)
    };

    try {
        localStorage.setItem('quizResults', JSON.stringify(quizData));
        console.log('💾 Quiz results saved to localStorage');
    } catch (error) {
        console.error('❌ Error saving to localStorage:', error);
    }
}

// ===================================
// NAVIGATION
// ===================================
function navigateToExplorer() {
    console.log('🚀 Navigating to career explorer...');

    const topCareers = Object.entries(careerScores)
        .sort((a, b) => b[1].score - a[1].score)
        .slice(0, 3)
        .map(([name, data]) => ({
            name: encodeURIComponent(name),
            score: data.score
        }));

    const params = new URLSearchParams();
    topCareers.forEach((career, index) => {
        params.append(`match${index + 1}`, career.name);
        params.append(`score${index + 1}`, career.score);
    });

    const url = `career-explorer-2.html?${params.toString()}`;
    console.log('🔗 Navigating to:', url);
    window.location.href = url;
}

function retakeQuiz() {
    console.log('🔄 Retaking quiz...');

    try {
        localStorage.removeItem('quizResults');
    } catch (error) {
        console.error('❌ Error clearing localStorage:', error);
    }

    currentQuestionIndex = 0;
    selectedSkills = [];
    careerScores = {};

    // Clear visual selections
    questionScreens.forEach(screen => {
        const answerButtons = screen.querySelectorAll('.answer-btn');
        answerButtons.forEach(btn => btn.classList.remove('selected'));
    });

    switchScreen(screens.results, screens.intro);
}

// ===================================
// KEYBOARD ACCESSIBILITY
// ===================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        const focused = document.activeElement;
        if (focused.classList.contains('answer-btn') || focused.classList.contains('btn')) {
            focused.click();
        }
    }
});

// ===================================
// INIT
// ===================================
document.addEventListener('DOMContentLoaded', async () => {
    console.log('✅ DOM loaded, initializing quiz...');

    await loadCareerData();

    if (!careersData || !careersData.roles) {
        console.error('❌ Failed to load career data - quiz cannot function');
        return;
    }

    initializeEventListeners();

    const existingResults = localStorage.getItem('quizResults');
    if (existingResults) {
        console.log('📋 Found existing quiz results in localStorage');
    }
});
