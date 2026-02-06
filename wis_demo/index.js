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
    // Navigate to the games section or a games hub page
    // For now, go to the construction planner as the primary game
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

    // Hamburger menu (placeholder - expand as needed)
    const menuBtn = document.querySelector('.menu-btn');
    if (menuBtn) {
        menuBtn.addEventListener('click', () => {
            console.log('☰ Menu clicked');
            // TODO: Open navigation drawer / sidebar
        });
    }
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
