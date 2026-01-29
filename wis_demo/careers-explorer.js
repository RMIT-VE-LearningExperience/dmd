// Embedded careers data with video URLs for 5 careers and related roles
console.log('🚀 SCRIPT LOADED! careers-explorer.js is running');

// Career color mapping (consistent with quiz)
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

// Quiz results storage
let quizResults = null;

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


// Skill categories mapping
const skillCategories = {
    "Technical": ["Technical knowledge", "Technical knowledge of construction", "Engineering principles", "Technical problem-solving", "Technical precision", "Computer and digital modelling skills", "IT and digital modelling", "Mathematics", "Numerical analysis", "Cost planning", "Software proficiency", "Trade knowledge", "Tool handling", "Vehicle operation"],
    "Leadership & Management": ["Leadership", "On-site leadership", "Decision-making", "Budget management", "Budgeting", "Planning", "Team coordination"],
    "Communication & Organisation": ["Communication", "Organisation", "Scheduling", "Documentation", "Time management", "Negotiation", "Teamwork", "Coordination"],
    "Safety & Compliance": ["Safety awareness", "Health & Safety", "Risk assessment", "Risk management", "Compliance management", "Attention to detail"],
    "Physical & Trade": ["Manual dexterity", "Precision", "Physical fitness", "Physical stamina", "Surface preparation", "Design sense", "Creativity"],
    "Professional & Analytical": ["Problem-solving", "Analytical thinking", "Financial management", "Knowledge of contracts and law", "Focus", "Customer service", "Training"]
};

// Function to categorize a skill
function categorizeSkill(skill) {
    for (const [category, skills] of Object.entries(skillCategories)) {
        if (skills.includes(skill)) {
            return category;
        }
    }
    return "Hands-On Skills"; // Default category
}

// Function to get categories for a career
function getCategoriesForCareer(career) {
    const categories = new Set();
    if (career.core_skills) {
        career.core_skills.forEach(skill => {
            categories.add(categorizeSkill(skill));
        });
    }
    return Array.from(categories);
}

// State
let currentView = 'floating';
let isPaused = false;
let selectedCareer = null;
let careerElements = [];
let filteredCareers = []; // Will be populated after data loads
let selectedCategories = new Set();
let comparisonCareers = [];
let videoFilterActive = false;

// DOM Elements
const floatingView = document.getElementById('floatingView');
const cardView = document.getElementById('cardView');
const floatingContainer = document.getElementById('floatingCareersContainer');
const careersGrid = document.getElementById('careersGrid');
const infoPanel = document.getElementById('infoPanel');
const closeBtn = document.getElementById('closeBtn');
const pauseBtn = document.getElementById('pauseBtn');
const salaryMinSlider = document.getElementById('salaryMin');
const salaryMaxSlider = document.getElementById('salaryMax');
const salaryRangeDisplay = document.getElementById('salaryRangeDisplay');
const rangeFill = document.getElementById('rangeFill');
const skillsFilterContainer = document.getElementById('skillsFilterContainer');
const clearFiltersBtn = document.getElementById('clearFilters');
const noResults = document.getElementById('noResults');
const videoLegend = document.getElementById('videoLegend');
const comparisonPanel = document.getElementById('comparisonPanel');
const closeComparisonBtn = document.getElementById('closeComparisonBtn');
const exploreCenter = document.getElementById('exploreCenter');

// Create skill category filter tags
Object.keys(skillCategories).forEach(category => {
    const tag = document.createElement('div');
    tag.className = 'skill-filter-tag';
    tag.textContent = category;
    tag.dataset.category = category;
    tag.addEventListener('click', () => toggleCategoryFilter(category, tag));
    skillsFilterContainer.appendChild(tag);
});

// Salary Range Slider Logic
function updateRangeSlider() {
    console.log('🎚️ UPDATE RANGE SLIDER called');
    if (!salaryMinSlider || !salaryMaxSlider) {
        console.error('❌ Slider elements not found');
        return;
    }

    let minValue = parseInt(salaryMinSlider.value);
    let maxValue = parseInt(salaryMaxSlider.value);
    console.log('   Current slider values:', minValue, 'to', maxValue);

    // Ensure min doesn't exceed max
    if (minValue > maxValue) {
        minValue = maxValue;
        salaryMinSlider.value = minValue;
    }

    // Update display
    if (salaryRangeDisplay) {
        salaryRangeDisplay.textContent = `$${minValue}k - $${maxValue}k`;
    }

    // Update fill bar
    if (rangeFill) {
        const minPercent = ((minValue - 40) / (200 - 40)) * 100;
        const maxPercent = ((maxValue - 40) / (200 - 40)) * 100;
        rangeFill.style.left = minPercent + '%';
        rangeFill.style.width = (maxPercent - minPercent) + '%';
    }

    // Trigger filtering
    filterCareers();
}

if (salaryMinSlider && salaryMaxSlider) {
    salaryMinSlider.addEventListener('input', updateRangeSlider);
    salaryMaxSlider.addEventListener('input', updateRangeSlider);

    // Initialize slider display (just update UI, don't filter yet)
    const minValue = parseInt(salaryMinSlider.value);
    const maxValue = parseInt(salaryMaxSlider.value);
    if (salaryRangeDisplay) {
        salaryRangeDisplay.textContent = `$${minValue}k - $${maxValue}k`;
    }
    if (rangeFill) {
        const minPercent = ((minValue - 40) / (200 - 40)) * 100;
        const maxPercent = ((maxValue - 40) / (200 - 40)) * 100;
        rangeFill.style.left = minPercent + '%';
        rangeFill.style.width = (maxPercent - minPercent) + '%';
    }
}

// View Toggle
document.querySelectorAll('.toggle-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const view = btn.dataset.view;
        switchView(view);
    });
});

function switchView(view) {
    currentView = view;

    if (view === 'floating') {
        // First remove active from card view to trigger fade-out
        cardView.classList.remove('active');

        // Wait for fade-out, then show floating view
        setTimeout(() => {
            floatingView.style.display = 'flex';
            // Trigger reflow to enable transition
            floatingView.offsetHeight;
            floatingView.classList.add('active');
            pauseBtn.classList.add('visible');
            videoLegend.classList.add('visible');

            document.querySelectorAll('.toggle-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.view === 'floating');
            });

            // Reinitialize floating view
            if (careerElements.length === 0) {
                initFloatingView();
            }

            // Hide card view after transition
            setTimeout(() => {
                cardView.style.display = 'none';
            }, 500);
        }, 500);
    } else {
        // First remove active from floating view to trigger fade-out
        floatingView.classList.remove('active');

        // Wait for fade-out, then show card view
        setTimeout(() => {
            cardView.style.display = 'block';
            // Trigger reflow to enable transition
            cardView.offsetHeight;
            cardView.classList.add('active');
            pauseBtn.classList.remove('visible');
            videoLegend.classList.remove('visible');

            document.querySelectorAll('.toggle-btn').forEach(b => {
                b.classList.toggle('active', b.dataset.view === 'cards');
            });

            // Hide floating view after transition
            setTimeout(() => {
                floatingView.style.display = 'none';
            }, 500);
        }, 500);
    }
}

// Initialize on desktop
if (window.innerWidth >= 769) {
    switchView('floating');
} else {
    switchView('cards');
}

// Floating View Functions
function getRandomPosition(index, total) {
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Calculate max safe radius based on viewport (leave 100px margin from edges)
    const maxSafeRadius = Math.min(
        window.innerWidth / 2 - 100,
        window.innerHeight / 2 - 100
    );

    const orbit = Math.floor(index / 5);
    const angleOffset = (index % 5) * (2 * Math.PI / 5);

    // Tighter orbits: start at 180px, spacing of 70px
    // Explore button is 100px radius, so 180px keeps items clear
    const baseRadius = 180;
    const orbitSpacing = 70;
    const radius = baseRadius + (orbit * orbitSpacing);

    const radiusVariation = (Math.random() - 0.5) * 30;
    const angleVariation = (Math.random() - 0.5) * 0.5;

    const angle = angleOffset + angleVariation + (orbit * 0.3);
    let finalRadius = radius + radiusVariation;

    // Ensure items don't go beyond safe radius
    finalRadius = Math.min(finalRadius, maxSafeRadius);

    const x = centerX + Math.cos(angle) * finalRadius;
    const y = centerY + Math.sin(angle) * finalRadius;

    return { x, y, angle, radius: finalRadius };
}

function createFloatingCareerItem(career, index, total) {
    const item = document.createElement('div');
    item.className = 'career-item';

    const dot = document.createElement('div');
    const color = getCareerColor(career.name);
    dot.className = `career-dot ${color}`;

    const name = document.createElement('div');
    name.className = 'career-name';
    name.textContent = career.name;

    item.appendChild(dot);
    item.appendChild(name);

    // Add play icon if career has video
    if (career.video_url) {
        const playIcon = document.createElement('div');
        playIcon.className = 'video-play-icon';
        item.appendChild(playIcon);
    }

    const pos = getRandomPosition(index, total);
    item.style.left = `${pos.x}px`;
    item.style.top = `${pos.y}px`;
    item.style.transform = 'translate(-50%, -50%)';

    // Add random animation duration for organic floating effect (2.5-3.5s)
    const floatDuration = 2.5 + Math.random() * 1;
    item.style.animationDuration = `${floatDuration}s`;

    item.dataset.angle = pos.angle;
    item.dataset.radius = pos.radius;
    item.dataset.speed = 0.0002 + Math.random() * 0.0003;
    item.dataset.career = JSON.stringify(career);

    item.addEventListener('click', () => {
        if (selectedCareer) {
            selectedCareer.classList.remove('clicked');
        }
        item.classList.add('clicked');
        selectedCareer = item;
        showCareerInfo(career);
    });

    floatingContainer.appendChild(item);
    return item;
}

function initFloatingView() {
    floatingContainer.innerHTML = '';
    careerElements = [];

    filteredCareers.forEach((career, index) => {
        careerElements.push(createFloatingCareerItem(career, index, filteredCareers.length));
    });

    animate();
}

function animate() {
    if (!isPaused && currentView === 'floating') {
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;

        careerElements.forEach(item => {
            let angle = parseFloat(item.dataset.angle);
            const radius = parseFloat(item.dataset.radius);
            const speed = parseFloat(item.dataset.speed);

            angle += speed;
            item.dataset.angle = angle;

            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;

            item.style.left = `${x}px`;
            item.style.top = `${y}px`;
        });
    }

    requestAnimationFrame(animate);
}

// Card View Functions
function createCareerCard(career, matchingLevels = null) {
    const card = document.createElement('div');
    card.className = 'career-card';
    if (career.video_url) {
        card.classList.add('has-video');
    }

    const header = document.createElement('div');
    header.className = 'career-card-header';

    const dot = document.createElement('div');
    const color = getCareerColor(career.name);
    dot.className = `career-card-dot ${color}`;
    dot.style.background = color === 'blue' ? '#4299e1' : '#48bb78';

    const title = document.createElement('div');
    title.className = 'career-card-title';
    title.textContent = career.name;

    header.appendChild(dot);
    header.appendChild(title);

    const salary = document.createElement('div');
    salary.className = 'career-card-salary';
    salary.textContent = career.salary_range;

    const overview = document.createElement('div');
    overview.className = 'career-card-overview';
    overview.textContent = career.overview;

    // Compare button
    const compareBtn = document.createElement('button');
    compareBtn.className = 'compare-btn';
    compareBtn.innerHTML = '+';
    compareBtn.onclick = (e) => {
        e.stopPropagation();
        toggleComparison(career, card, compareBtn);
    };

    card.appendChild(header);
    card.appendChild(salary);
    card.appendChild(overview);

    // Quiz match badge (if quiz results exist)
    if (quizResults && quizResults.scores && quizResults.scores[career.name]) {
        const score = quizResults.scores[career.name];
        const percentage = Math.round((score / 3) * 100);
        const matchBadge = document.createElement('div');
        matchBadge.className = 'quiz-match-badge';
        matchBadge.textContent = `${percentage}% Match`;
        card.appendChild(matchBadge);
    }

    // Salary level match note
    if (matchingLevels && matchingLevels.length > 0 && career.levels) {
        const levelNote = document.createElement('div');
        levelNote.className = 'salary-level-note';

        if (matchingLevels.length === career.levels.length) {
            levelNote.textContent = '✓ All levels match your range';
        } else if (matchingLevels.length === 1) {
            const levelTitle = career.levels[matchingLevels[0]].title;
            levelNote.textContent = `✓ ${levelTitle} matches your range`;
        } else {
            const firstLevel = career.levels[matchingLevels[0]].title;
            const lastLevel = career.levels[matchingLevels[matchingLevels.length - 1]].title;
            levelNote.textContent = `✓ ${firstLevel} to ${lastLevel}`;
        }

        card.appendChild(levelNote);
    }

    card.appendChild(compareBtn);

    card.addEventListener('click', () => {
        showCareerInfo(career);
    });

    return card;
}

function renderCareerCards(careerMatchingLevels = null, isFiltering = false) {
    // If filtering, add fade-out effect first
    if (isFiltering && careersGrid.children.length > 0) {
        careersGrid.classList.add('filtering');

        setTimeout(() => {
            renderCareerCardsInternal(careerMatchingLevels);
            careersGrid.classList.remove('filtering');
        }, 300);
    } else {
        renderCareerCardsInternal(careerMatchingLevels);
    }
}

function renderCareerCardsInternal(careerMatchingLevels = null) {
    careersGrid.innerHTML = '';

    if (filteredCareers.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    filteredCareers.forEach((career, index) => {
        const matchingLevels = careerMatchingLevels ? careerMatchingLevels.get(career.name) : null;
        const card = createCareerCard(career, matchingLevels);

        // Reset and re-apply animation delay for fresh animation
        card.style.animation = 'none';
        // Trigger reflow
        card.offsetHeight;
        card.style.animation = '';

        // Add staggered animation delay (max 50ms per card, capped at 800ms)
        const delay = Math.min(index * 50, 800);
        card.style.animationDelay = `${delay}ms`;

        // Restore selected state if career is in comparison
        const isInComparison = comparisonCareers.find(c => c.name === career.name);
        if (isInComparison) {
            card.classList.add('selected');
            const btn = card.querySelector('.compare-btn');
            btn.classList.add('selected');

            if (comparisonCareers.length === 1) {
                card.classList.add('pending');
                btn.classList.add('pending');
            }
        }

        careersGrid.appendChild(card);
    });
}

// Comparison Functions
function toggleComparison(career, cardElement, buttonElement) {
    const careerIndex = comparisonCareers.findIndex(c => c.name === career.name);

    // If already in comparison, remove it
    if (careerIndex !== -1) {
        comparisonCareers.splice(careerIndex, 1);
        cardElement.classList.remove('selected', 'pending');
        buttonElement.classList.remove('selected', 'pending');
        buttonElement.innerHTML = '+';

        // Update other cards' pending state
        updateComparisonStates();
        return;
    }

    // Check if limit reached
    if (comparisonCareers.length >= 2) {
        // Show visual feedback - shake animation
        showLimitReachedFeedback(cardElement);
        return;
    }

    // Add to comparison
    comparisonCareers.push(career);
    cardElement.classList.add('selected');
    buttonElement.classList.add('selected');

    // If first selection, add pending state
    if (comparisonCareers.length === 1) {
        buttonElement.classList.add('pending');
        cardElement.classList.add('pending');
    } else {
        // Second selection - remove pending from first, trigger comparison
        updateComparisonStates();
        setTimeout(() => {
            showComparison();
        }, 300);
    }
}

function updateComparisonStates() {
    // Find all cards and update their states
    document.querySelectorAll('.career-card').forEach(card => {
        const btn = card.querySelector('.compare-btn');
        if (!btn) return;

        const careerName = card.querySelector('.career-card-title').textContent;
        const isSelected = comparisonCareers.find(c => c.name === careerName);

        if (isSelected) {
            if (comparisonCareers.length === 1) {
                btn.classList.add('pending');
                card.classList.add('pending');
                card.classList.remove('selected');
            } else {
                btn.classList.remove('pending');
                card.classList.remove('pending');
                card.classList.add('selected');
            }
        }
    });
}

function showLimitReachedFeedback(cardElement) {
    // Add shake animation
    cardElement.classList.add('shake');
    setTimeout(() => {
        cardElement.classList.remove('shake');
    }, 500);
}

function showComparison() {
    const leftCareer = comparisonCareers[0];
    const rightCareer = comparisonCareers[1];
    const comparisonContent = document.getElementById('comparisonContent');

    // Check if mobile
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
        // Mobile: section-by-section layout
        comparisonContent.innerHTML = `
            <!-- Titles Section -->
            <div class="comparison-section">
                <div class="mobile-comparison-row">
                    <div class="mobile-career-content">
                        <h3 style="font-size: 16px; margin-bottom: 8px;">${leftCareer.name}</h3>
                        <button class="change-career-btn" onclick="changeCareer(0)">Change</button>
                        <div class="comparison-salary" style="margin-top: 8px;">${leftCareer.salary_range}</div>
                    </div>
                    <div class="mobile-career-content">
                        <h3 style="font-size: 16px; margin-bottom: 8px;">${rightCareer.name}</h3>
                        <button class="change-career-btn" onclick="changeCareer(1)">Change</button>
                        <div class="comparison-salary" style="margin-top: 8px;">${rightCareer.salary_range}</div>
                    </div>
                </div>
            </div>

            <!-- Overview Section -->
            <div class="comparison-section">
                <div class="comparison-section-title">Overview</div>
                <div class="mobile-comparison-row">
                    <div class="mobile-career-content">
                        <div class="mobile-career-name">${leftCareer.name}</div>
                        <p class="comparison-text">${leftCareer.overview}</p>
                    </div>
                    <div class="mobile-career-content">
                        <div class="mobile-career-name">${rightCareer.name}</div>
                        <p class="comparison-text">${rightCareer.overview}</p>
                    </div>
                </div>
            </div>

            <!-- Skills Section -->
            <div class="comparison-section">
                <div class="comparison-section-title">Core Skills</div>
                <div class="mobile-comparison-row">
                    <div class="mobile-career-content">
                        <div class="mobile-career-name">${leftCareer.name}</div>
                        <div class="skills-container" id="mobileLeftSkills"></div>
                    </div>
                    <div class="mobile-career-content">
                        <div class="mobile-career-name">${rightCareer.name}</div>
                        <div class="skills-container" id="mobileRightSkills"></div>
                    </div>
                </div>
            </div>

            <!-- Education Section -->
            <div class="comparison-section">
                <div class="comparison-section-title">Core Education</div>
                <div class="mobile-comparison-row">
                    <div class="mobile-career-content">
                        <div class="mobile-career-name">${leftCareer.name}</div>
                        <ul class="education-list" id="mobileLeftEducation"></ul>
                    </div>
                    <div class="mobile-career-content">
                        <div class="mobile-career-name">${rightCareer.name}</div>
                        <ul class="education-list" id="mobileRightEducation"></ul>
                    </div>
                </div>
            </div>
        `;

        // Populate skills for mobile
        const mobileLeftSkills = document.getElementById('mobileLeftSkills');
        leftCareer.core_skills.forEach(skill => {
            const tag = document.createElement('div');
            tag.className = 'skill-tag';
            tag.innerHTML = `<div class="skill-dot"></div><span>${skill}</span>`;
            mobileLeftSkills.appendChild(tag);
        });

        const mobileRightSkills = document.getElementById('mobileRightSkills');
        rightCareer.core_skills.forEach(skill => {
            const tag = document.createElement('div');
            tag.className = 'skill-tag';
            tag.innerHTML = `<div class="skill-dot"></div><span>${skill}</span>`;
            mobileRightSkills.appendChild(tag);
        });

        // Populate education for mobile
        const mobileLeftEducation = document.getElementById('mobileLeftEducation');
        leftCareer.core_education.forEach(edu => {
            const li = document.createElement('li');
            li.className = 'education-item';
            li.textContent = edu;
            mobileLeftEducation.appendChild(li);
        });

        const mobileRightEducation = document.getElementById('mobileRightEducation');
        rightCareer.core_education.forEach(edu => {
            const li = document.createElement('li');
            li.className = 'education-item';
            li.textContent = edu;
            mobileRightEducation.appendChild(li);
        });
    } else {
        // Desktop: side-by-side layout
        comparisonContent.innerHTML = `
            <div class="comparison-side">
                <h3>
                    <span id="compareLeftTitle">${leftCareer.name}</span>
                    <button class="change-career-btn" onclick="changeCareer(0)">Change</button>
                </h3>
                <div class="comparison-salary">${leftCareer.salary_range}</div>

                <div class="comparison-section">
                    <div class="comparison-section-title">Overview</div>
                    <p class="comparison-text">${leftCareer.overview}</p>
                </div>

                <div class="comparison-section">
                    <div class="comparison-section-title">Core Skills</div>
                    <div class="skills-container" id="compareLeftSkills"></div>
                </div>

                <div class="comparison-section">
                    <div class="comparison-section-title">Core Education</div>
                    <ul class="education-list" id="compareLeftEducation"></ul>
                </div>
            </div>

            <div class="comparison-side">
                <h3>
                    <span id="compareRightTitle">${rightCareer.name}</span>
                    <button class="change-career-btn" onclick="changeCareer(1)">Change</button>
                </h3>
                <div class="comparison-salary">${rightCareer.salary_range}</div>

                <div class="comparison-section">
                    <div class="comparison-section-title">Overview</div>
                    <p class="comparison-text">${rightCareer.overview}</p>
                </div>

                <div class="comparison-section">
                    <div class="comparison-section-title">Core Skills</div>
                    <div class="skills-container" id="compareRightSkills"></div>
                </div>

                <div class="comparison-section">
                    <div class="comparison-section-title">Core Education</div>
                    <ul class="education-list" id="compareRightEducation"></ul>
                </div>
            </div>
        `;

        // Populate skills for desktop
        const leftSkills = document.getElementById('compareLeftSkills');
        leftCareer.core_skills.forEach(skill => {
            const tag = document.createElement('div');
            tag.className = 'skill-tag';
            tag.innerHTML = `<div class="skill-dot"></div><span>${skill}</span>`;
            leftSkills.appendChild(tag);
        });

        const rightSkills = document.getElementById('compareRightSkills');
        rightCareer.core_skills.forEach(skill => {
            const tag = document.createElement('div');
            tag.className = 'skill-tag';
            tag.innerHTML = `<div class="skill-dot"></div><span>${skill}</span>`;
            rightSkills.appendChild(tag);
        });

        // Populate education for desktop
        const leftEducation = document.getElementById('compareLeftEducation');
        leftCareer.core_education.forEach(edu => {
            const li = document.createElement('li');
            li.className = 'education-item';
            li.textContent = edu;
            leftEducation.appendChild(li);
        });

        const rightEducation = document.getElementById('compareRightEducation');
        rightCareer.core_education.forEach(edu => {
            const li = document.createElement('li');
            li.className = 'education-item';
            li.textContent = edu;
            rightEducation.appendChild(li);
        });
    }

    comparisonPanel.classList.add('visible');
}

// Global function to change a career in comparison
function changeCareer(index) {
    // Remove the career at the specified index
    const removedCareer = comparisonCareers[index];
    comparisonCareers.splice(index, 1);

    // Close comparison panel
    comparisonPanel.classList.remove('visible');

    // Update visual states
    document.querySelectorAll('.career-card').forEach(card => {
        const careerName = card.querySelector('.career-card-title').textContent;
        if (careerName === removedCareer.name) {
            card.classList.remove('selected', 'pending');
            const btn = card.querySelector('.compare-btn');
            if (btn) {
                btn.classList.remove('selected', 'pending');
                btn.innerHTML = '+';
            }
        }
    });

    // Update remaining career to pending state
    updateComparisonStates();
}

function clearComparison() {
    comparisonCareers = [];
    comparisonPanel.classList.remove('visible');

    // Remove all selected and pending states
    document.querySelectorAll('.career-card').forEach(card => {
        card.classList.remove('selected', 'pending');
        const btn = card.querySelector('.compare-btn');
        if (btn) {
            btn.classList.remove('selected', 'pending');
            btn.innerHTML = '+';
        }
    });
}

// Show Career Info
function showCareerInfo(career) {
    document.getElementById('careerTitle').textContent = career.name;
    document.getElementById('careerSalary').textContent = career.salary_range || 'Salary varies';

    // Video iframe
    const videoContainer = document.getElementById('videoContainer');
    if (career.video_url) {
        videoContainer.innerHTML = `<iframe src="${career.video_url}" allowfullscreen></iframe>`;
        videoContainer.style.display = 'block';
    } else {
        videoContainer.style.display = 'none';
    }

    document.getElementById('careerOverview').textContent = career.overview;

    // Core Skills
    const skillsContainer = document.getElementById('coreSkills');
    skillsContainer.innerHTML = '';
    if (career.core_skills && career.core_skills.length > 0) {
        career.core_skills.forEach(skill => {
            const tag = document.createElement('div');
            tag.className = 'skill-tag';
            tag.innerHTML = `
                <div class="skill-dot"></div>
                <span>${skill}</span>
            `;
            skillsContainer.appendChild(tag);
        });
    }

    // Core Education
    const educationList = document.getElementById('coreEducation');
    educationList.innerHTML = '';
    if (career.core_education && career.core_education.length > 0) {
        career.core_education.forEach(edu => {
            const li = document.createElement('li');
            li.className = 'education-item';
            li.textContent = edu;
            educationList.appendChild(li);
        });
    }

    // Career Levels - Accordion
    const levelsContainer = document.getElementById('careerLevels');
    levelsContainer.innerHTML = '';
    if (career.levels && career.levels.length > 0) {
        career.levels.forEach((level, index) => {
            const card = document.createElement('div');
            card.className = 'level-card';
            if (index === 0) card.classList.add('active'); // First item open by default

            card.innerHTML = `
                <div class="level-header">
                    <div class="level-title">${level.title}</div>
                    <div class="level-chevron">▼</div>
                </div>
                <div class="level-content">
                    <div class="level-content-inner">
                        <div class="level-summary">${level.summary}</div>
                        <div class="level-experience">${level.typical_experience}</div>
                    </div>
                </div>
            `;

            const header = card.querySelector('.level-header');
            header.addEventListener('click', () => {
                card.classList.toggle('active');
            });

            levelsContainer.appendChild(card);
        });
    }

    // Related Roles Section
    const relatedRolesContainer = document.getElementById('relatedRoles');
    relatedRolesContainer.innerHTML = '';
    if (career.related_roles && career.related_roles.length > 0) {
        const relatedRolesSection = document.getElementById('relatedRolesSection');
        relatedRolesSection.style.display = 'block';

        career.related_roles.forEach(roleName => {
            const tag = document.createElement('div');
            tag.className = 'related-role-tag';
            tag.textContent = roleName;
            tag.onclick = () => {
                const relatedCareer = careersData.roles.find(c => c.name === roleName);
                if (relatedCareer) {
                    showCareerInfo(relatedCareer);
                }
            };
            relatedRolesContainer.appendChild(tag);
        });
    } else {
        document.getElementById('relatedRolesSection').style.display = 'none';
    }

    infoPanel.classList.add('visible');
}

// Filters - FIXED SALARY LOGIC
function parseSalaryRange(salaryString) {
    const match = salaryString.match(/\$?([\d,]+)/g);
    if (!match) {
        console.log('❌ No match found for:', salaryString);
        return { min: 0, max: 0 };
    }

    const numbers = match.map(s => parseInt(s.replace(/[$,]/g, '')));
    const result = {
        min: numbers[0] || 0,
        max: numbers[1] || numbers[0] || 0
    };
    console.log('📊 Parsed', salaryString, '→', result);
    return result;
}

// Calculate which career levels fall within a salary range
function getMatchingLevels(career, filterMin, filterMax) {
    if (!career.levels || career.levels.length === 0) {
        return null;
    }

    const careerSalary = parseSalaryRange(career.salary_range);
    const levelCount = career.levels.length;

    // Distribute salary range evenly across levels
    const salaryPerLevel = (careerSalary.max - careerSalary.min) / levelCount;

    const matchingLevels = [];

    for (let i = 0; i < levelCount; i++) {
        const levelMin = careerSalary.min + (salaryPerLevel * i);
        const levelMax = careerSalary.min + (salaryPerLevel * (i + 1));

        // Check if this level overlaps with filter range
        if (levelMax >= filterMin && levelMin <= filterMax) {
            matchingLevels.push(i);
        }
    }

    return matchingLevels;
}

function filterCareers() {
    // Safety check for slider elements
    if (!salaryMinSlider || !salaryMaxSlider) {
        console.error('Salary sliders not found');
        filteredCareers = careersData.roles;
        renderCareerCards();
        return;
    }

    const filterMin = parseInt(salaryMinSlider.value) * 1000;
    const filterMax = parseInt(salaryMaxSlider.value) * 1000;

    console.log('🔍 FILTERING with range: $' + (filterMin/1000) + 'k - $' + (filterMax/1000) + 'k');
    console.log('   Filter range:', filterMin, '-', filterMax);

    // Store matching levels for each career
    const careerMatchingLevels = new Map();

    filteredCareers = careersData.roles.filter(career => {
        // Salary filter
        const careerSalary = parseSalaryRange(career.salary_range);

        // Check if ranges overlap
        const overlaps = careerSalary.max >= filterMin && careerSalary.min <= filterMax;

        console.log('   ' + career.name + ':',
            'Career range:', careerSalary.min, '-', careerSalary.max,
            'Overlaps?', overlaps);

        if (!overlaps) return false;

        // Calculate which levels match
        const matchingLevels = getMatchingLevels(career, filterMin, filterMax);
        if (matchingLevels && matchingLevels.length > 0) {
            careerMatchingLevels.set(career.name, matchingLevels);
        }

        // Category filter
        if (selectedCategories.size > 0) {
            const careerCategories = getCategoriesForCareer(career);
            const hasAnyCategory = careerCategories.some(cat => selectedCategories.has(cat));
            if (!hasAnyCategory) return false;
        }

        // Video filter
        if (videoFilterActive) {
            if (!career.video_url) return false;
        }

        return true;
    });

    console.log('✅ RESULT: ' + filteredCareers.length + ' out of ' + careersData.roles.length + ' careers match');
    console.log('---');

    // Pass isFiltering=true to trigger animation
    renderCareerCards(careerMatchingLevels, true);

    // Update floating view if active
    if (currentView === 'floating') {
        careerElements = [];
        initFloatingView();
    }
}

function toggleCategoryFilter(category, element) {
    if (selectedCategories.has(category)) {
        selectedCategories.delete(category);
        element.classList.remove('active');
    } else {
        selectedCategories.add(category);
        element.classList.add('active');
    }
    filterCareers();
}

clearFiltersBtn.addEventListener('click', () => {
    salaryMinSlider.value = 40;
    salaryMaxSlider.value = 200;
    updateRangeSlider();
    selectedCategories.clear();
    document.querySelectorAll('.skill-filter-tag').forEach(tag => {
        tag.classList.remove('active');
    });
    videoFilterActive = false;
    videoLegend.classList.remove('active');
    filterCareers();
});

// Event Listeners
closeBtn.addEventListener('click', () => {
    infoPanel.classList.remove('visible');
    if (selectedCareer) {
        selectedCareer.classList.remove('clicked');
        selectedCareer = null;
    }
});

closeComparisonBtn.addEventListener('click', () => {
    clearComparison();
});

pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.classList.toggle('paused');
});

// Video legend click to filter
videoLegend.addEventListener('click', () => {
    videoFilterActive = !videoFilterActive;
    videoLegend.classList.toggle('active');

    // In floating view, filter the careers
    if (currentView === 'floating') {
        filteredCareers = careersData.roles.filter(career => {
            if (videoFilterActive) {
                return career.video_url;
            }
            return true;
        });
        careerElements = [];
        initFloatingView();
    } else {
        // In card view, use the main filter function
        filterCareers();
    }
});

// Explore center click to switch to card view
if (exploreCenter) {
    exploreCenter.addEventListener('click', () => {
        switchView('cards');
    });
}

// Load quiz results from localStorage
function loadQuizResults() {
    try {
        const quizData = localStorage.getItem('quizResults');
        if (quizData) {
            quizResults = JSON.parse(quizData);
            console.log('📋 Loaded quiz results from localStorage:', quizResults);
        }
    } catch (error) {
        console.error('❌ Error loading quiz results:', error);
        quizResults = null;
    }
}

// Initialize - load data then render
async function initialize() {
    console.log('🎯 INITIALIZING career explorer...');

    // Load career data from wis.json
    await loadCareerData();

    if (!careersData || !careersData.roles) {
        console.error('❌ Failed to initialize: no career data');
        return;
    }

    console.log('🎯 Rendering', careersData.roles.length, 'careers');
    loadQuizResults();
    filteredCareers = careersData.roles;
    renderCareerCards();
    console.log('✅ INITIALIZATION COMPLETE');
}

// Start initialization
initialize();

// Handle window resize
let resizeTimeout;
let previousWidth = window.innerWidth;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        if (currentView === 'floating' && careerElements.length > 0) {
            careerElements.forEach((item, index) => {
                const pos = getRandomPosition(index, careerElements.length);
                item.dataset.angle = pos.angle;
                item.dataset.radius = pos.radius;
                item.style.left = `${pos.x}px`;
                item.style.top = `${pos.y}px`;
            });
        }

        // Regenerate comparison if open and crossed mobile/desktop threshold
        const currentWidth = window.innerWidth;
        const crossedThreshold = (previousWidth <= 768 && currentWidth > 768) ||
                                (previousWidth > 768 && currentWidth <= 768);

        if (crossedThreshold && comparisonPanel.classList.contains('visible') && comparisonCareers.length === 2) {
            showComparison();
        }

        previousWidth = currentWidth;
    }, 250);
});
