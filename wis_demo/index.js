console.log('🏗️ Construct Your Career - Landing Page Loaded!');

// ===================================
// NAVIGATION FUNCTIONS
// ===================================

function navigateToCareersExplorer() {
    console.log('🔍 Opening Career Quiz...');
    window.location.href = 'quiz.html';
}

function navigateToGames() {
    console.log('🎮 Opening Mini Games...');
    const overlay = document.getElementById('dashboardOverlay');
    const fab = document.getElementById('gamesFab');
    if (overlay) {
        overlay.classList.add('active');
        if (fab) {
            fab.classList.add('hidden');
        }
        return;
    }
    // Fallback if overlay isn't present
    window.location.href = 'games/construction-planner/';
}

// ===================================
// EVENT LISTENERS
// ===================================

document.addEventListener('DOMContentLoaded', () => {
    console.log('✅ Landing page initialized');

    // Career Explorer button
    const careerBtn = document.querySelector('.btn-career');
    if (careerBtn) {
        careerBtn.addEventListener('click', navigateToCareersExplorer);
    }

    // Mini Games button
    const gamesBtn = document.querySelector('.btn-games');
    if (gamesBtn) {
        gamesBtn.addEventListener('click', navigateToGames);
    }

    // Hamburger menu is handled by nav.js
});

// ===================================
// ACCESSIBILITY - Keyboard Navigation
// ===================================

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        const focused = document.activeElement;
        if (focused && focused.classList.contains('btn')) {
            focused.click();
        }
    }
});
