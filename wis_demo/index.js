console.log('🏗️ WIS Career Explorer Welcome Page Loaded!');

// ===================================
// NAVIGATION FUNCTIONS
// ===================================

function navigateToQuiz() {
    console.log('📝 Starting Career Quiz...');
    window.location.href = 'quiz.html';
}

function navigateToCareersExplorer() {
    console.log('🔍 Opening Career Explorer...');
    window.location.href = 'careers-explorer.html';
}

function navigateToGame(gameName) {
    if (gameName === 'construction-planner') {
        console.log('🎮 Starting Construction Planner game...');
        window.location.href = 'construction-planner-game.html';
    } else {
        console.log('🔒 Game not available yet:', gameName);
        showComingSoonMessage(gameName);
    }
}

// ===================================
// LOCKED GAME INTERACTION
// ===================================

function showComingSoonMessage(gameName) {
    const card = document.querySelector(`[data-game="${gameName}"]`);

    // Add shake animation
    card.classList.add('shake');
    setTimeout(() => card.classList.remove('shake'), 500);

    // Show tooltip
    const existingTooltip = card.querySelector('.coming-soon-tooltip');
    if (existingTooltip) return; // Prevent multiple tooltips

    const tooltip = document.createElement('div');
    tooltip.className = 'coming-soon-tooltip';
    tooltip.textContent = 'This game is coming soon!';
    card.appendChild(tooltip);

    setTimeout(() => tooltip.remove(), 2000);
}

// ===================================
// EVENT LISTENERS
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Welcome page initialized');

    // Action card buttons
    const quizButton = document.querySelector('.quiz-card .btn');
    const exploreButton = document.querySelector('.explore-card .btn');

    if (quizButton) {
        quizButton.addEventListener('click', navigateToQuiz);
    }

    if (exploreButton) {
        exploreButton.addEventListener('click', navigateToCareersExplorer);
    }

    // Game card interactions
    const gameCards = document.querySelectorAll('.game-card');

    gameCards.forEach(card => {
        const gameName = card.getAttribute('data-game');
        const isUnlocked = card.classList.contains('unlocked');

        if (isUnlocked) {
            // Unlocked game - make entire card clickable
            card.style.cursor = 'pointer';
            card.addEventListener('click', () => navigateToGame(gameName));

            // Also add specific button listener
            const button = card.querySelector('.btn-game');
            if (button) {
                button.addEventListener('click', (e) => {
                    e.stopPropagation(); // Prevent double navigation
                    navigateToGame(gameName);
                });
            }
        } else {
            // Locked game - show coming soon message
            card.addEventListener('click', () => navigateToGame(gameName));
        }
    });

    console.log('🎮 Game cards initialized:', gameCards.length);
});

// ===================================
// ACCESSIBILITY ENHANCEMENTS
// ===================================

// Keyboard navigation for cards
document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        const focusedElement = document.activeElement;

        if (focusedElement.classList.contains('action-card')) {
            const button = focusedElement.querySelector('.btn');
            if (button) button.click();
        }

        if (focusedElement.classList.contains('game-card')) {
            const gameName = focusedElement.getAttribute('data-game');
            if (gameName) navigateToGame(gameName);
        }
    }
});
