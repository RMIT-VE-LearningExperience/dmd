// Embedded careers data with video URLs for 5 careers
const careersData = {
    "roles": [
        {
            "name": "Building Estimator",
            "salary_range": "$65,000 - $120,000",
            "video_url": "https://www.youtube.com/embed/TfnWEG_u9GY",
            "overview": "Building estimators calculate the cost of construction projects, working closely with designers, engineers and contractors to make sure projects are financially viable.",
            "core_skills": ["Numerical analysis", "Attention to detail", "Problem-solving", "Technical knowledge of construction", "Communication", "Organisation", "Teamwork", "Computer and digital modelling skills"],
            "core_education": ["Certificate IV in Building (Construction Estimation)", "Diploma of Building and Construction"],
            "levels": [
                {"title": "Junior Estimator", "summary": "Supports senior estimators by measuring quantities from drawings, updating spreadsheets and assisting with basic cost estimates.", "typical_experience": "Entry-level role for people with a trade background, certificate-level study or strong numeracy skills."},
                {"title": "Building Estimator", "summary": "Prepares detailed cost estimates, researches material and labour rates and helps prepare competitive tenders.", "typical_experience": "1–3 years' experience in estimating or a related construction role plus Certificate IV in Building (Estimation) or similar."},
                {"title": "Senior Estimator", "summary": "Leads estimating on larger or more complex projects, reviews junior work and works directly with clients and project managers.", "typical_experience": "Several years as a building estimator, strong track record on medium to large projects."},
                {"title": "Commercial Manager (Estimating Focus)", "summary": "Oversees the financial performance of projects or a business unit, sets pricing strategies and manages commercial risk.", "typical_experience": "Extensive experience as a senior estimator or quantity surveyor, often with leadership responsibilities."}
            ]
        },
        {
            "name": "Contract Administrator",
            "salary_range": "$60,000 - $110,000",
            "overview": "Contract administrators manage the paperwork, contracts and financial documentation that keep construction projects on track and compliant.",
            "core_skills": ["Organisation", "Attention to detail", "Knowledge of contracts and law", "Communication", "Negotiation", "Problem-solving"],
            "core_education": ["Certificate IV in Building and Construction (Contract Administration)", "Diploma of Construction Management"],
            "levels": [
                {"title": "Assistant Contract Administrator", "summary": "Supports the contract admin team with document control, registers, reports and basic claims.", "typical_experience": "Entry-level, often while completing relevant VET or degree-level study."},
                {"title": "Contract Administrator", "summary": "Manages contract documentation, RFIs, variations and progress claims for specific projects.", "typical_experience": "1–3 years in an assistant CA or project admin role."},
                {"title": "Senior Contract Administrator", "summary": "Leads contract administration on larger projects, mentors junior staff and advises on contractual risks.", "typical_experience": "Several years as a contract administrator on mid to large projects."},
                {"title": "Contract Manager", "summary": "Oversees multiple contracts or major projects, negotiates major agreements and sets standards for contract processes.", "typical_experience": "Extensive CA experience plus strong client and negotiation skills."}
            ]
        },
        {
            "name": "Quantity Surveyor",
            "salary_range": "$70,000 - $140,000",
            "overview": "Quantity surveyors are cost experts who plan, manage and report on construction costs from early design through to project completion.",
            "core_skills": ["Cost planning", "Analytical thinking", "Attention to detail", "Problem-solving", "Financial management", "Negotiation", "Organisation", "IT and digital modelling"],
            "core_education": ["Bachelor of Construction Management", "Graduate Diploma of Construction Management"],
            "levels": [
                {"title": "Graduate Quantity Surveyor", "summary": "Supports senior QS staff with measurement, basic cost plans and financial reporting.", "typical_experience": "Recent graduate or final-year student in construction management or related field."},
                {"title": "Quantity Surveyor", "summary": "Prepares detailed cost plans, bills of quantities and monitors project costs during construction.", "typical_experience": "1–3 years in a QS or estimating role."},
                {"title": "Senior Quantity Surveyor", "summary": "Leads cost management on major projects and provides strategic cost advice to clients and project teams.", "typical_experience": "Extensive QS experience and responsibility for large or complex projects."},
                {"title": "Commercial Manager (QS)", "summary": "Manages the commercial performance of multiple projects or a portfolio, including risk, claims and high-level reporting.", "typical_experience": "Senior QS/estimating background with leadership responsibilities."}
            ]
        },
        {
            "name": "Project Coordinator",
            "salary_range": "$55,000 - $95,000",
            "video_url": "https://www.youtube.com/embed/TfnWEG_u9GY",
            "overview": "Project coordinators keep projects organised by managing schedules, documentation and communication between stakeholders.",
            "core_skills": ["Organisation", "Scheduling", "Communication", "Problem-solving", "Time management", "Documentation", "Attention to detail", "Software proficiency"],
            "core_education": ["Certificate IV or Diploma in Project Management", "Certificate IV or Diploma in Construction Management"],
            "levels": [
                {"title": "Project Assistant", "summary": "Supports project teams with meeting notes, document management and basic reporting.", "typical_experience": "Entry-level or early career admin/coordination role."},
                {"title": "Project Coordinator", "summary": "Coordinates meetings, schedules, documentation and communication for one or more projects.", "typical_experience": "1–3 years in project support or coordination roles."},
                {"title": "Senior Project Coordinator", "summary": "Supports complex or multiple projects, often taking on quasi-project management responsibilities.", "typical_experience": "Several years as a project coordinator on medium to large projects."}
            ]
        },
        {
            "name": "Project Manager",
            "salary_range": "$90,000 - $160,000",
            "overview": "Project managers are responsible for delivering projects safely, on time and on budget, while coordinating teams and stakeholders.",
            "core_skills": ["Leadership", "Decision-making", "Budget management", "Communication", "Negotiation", "Organisation", "Risk management"],
            "core_education": ["Bachelor of Construction Management", "Civil Engineering", "Architecture", "Master of Project Management"],
            "levels": [
                {"title": "Assistant Project Manager", "summary": "Supports a project manager with planning, reporting and coordination tasks.", "typical_experience": "Experienced project coordinator or engineer stepping into management."},
                {"title": "Project Manager", "summary": "Manages scope, time, cost, quality and risk for a project, coordinating teams and resources.", "typical_experience": "Several years in coordination, engineering or site roles."},
                {"title": "Senior Project Manager", "summary": "Leads complex or multiple projects, mentors other project managers and contributes to business strategy.", "typical_experience": "Extensive PM experience and strong stakeholder management skills."},
                {"title": "Project Director", "summary": "Provides strategic leadership across a portfolio of projects and high-value client relationships.", "typical_experience": "Senior or executive-level PM experience across multiple large projects."}
            ]
        },
        {
            "name": "Construction Manager",
            "salary_range": "$100,000 - $180,000",
            "video_url": "https://www.youtube.com/embed/TfnWEG_u9GY",
            "overview": "Construction managers oversee on-site delivery of projects, leading site teams and making sure work is completed safely and efficiently.",
            "core_skills": ["Leadership", "Planning", "Budgeting", "Problem-solving", "Communication", "Time management", "Health & Safety", "Teamwork"],
            "core_education": ["Trade Qualification", "Diploma or Bachelor in Construction Management"],
            "levels": [
                {"title": "Site Supervisor", "summary": "Manages day-to-day site activities for a specific area of work, coordinating trades and monitoring safety.", "typical_experience": "Experienced tradesperson or leading hand with supervisory training."},
                {"title": "Site Manager", "summary": "Responsible for the whole site, including program, logistics, site safety and quality.", "typical_experience": "Several years as a site supervisor or foreperson on busy projects."},
                {"title": "Construction Manager", "summary": "Oversees multiple sites or large projects, sets delivery strategy and supports site and project managers.", "typical_experience": "Extensive experience as a site manager or project manager."},
                {"title": "Operations Manager", "summary": "Manages construction operations across a region or business unit, aligning resources and strategy.", "typical_experience": "Senior-level construction leadership across multiple projects."}
            ]
        },
        {
            "name": "Project Engineer",
            "salary_range": "$70,000 - $130,000",
            "overview": "Project engineers handle the technical aspects of construction, linking design and on-site delivery.",
            "core_skills": ["Engineering principles", "Technical problem-solving", "Coordination", "Documentation", "Communication", "Attention to detail"],
            "core_education": ["Bachelor of Civil Engineering", "Bachelor of Structural Engineering", "Bachelor of Mechanical Engineering"],
            "levels": [
                {"title": "Graduate Engineer", "summary": "Rotates through different areas of the project, learning design, site work and documentation.", "typical_experience": "Recent engineering graduate."},
                {"title": "Project Engineer", "summary": "Manages technical queries, coordinates design changes and quality tests and supports the site team.", "typical_experience": "1–3 years in engineering roles with site exposure."},
                {"title": "Senior Project Engineer", "summary": "Leads engineering teams, coordinates complex technical packages and supports project planning.", "typical_experience": "Strong experience across multiple projects."},
                {"title": "Engineering Manager", "summary": "Oversees engineering delivery across multiple projects or a business unit.", "typical_experience": "Extensive engineering and leadership experience."}
            ]
        },
        {
            "name": "Health and Safety Officer",
            "salary_range": "$65,000 - $115,000",
            "overview": "Health and safety officers focus on keeping workers safe, ensuring legal compliance and promoting a positive safety culture.",
            "core_skills": ["Risk assessment", "Attention to detail", "Communication", "Organisation", "Compliance management", "Training", "Leadership"],
            "core_education": ["Certificate IV in Work Health and Safety", "Diploma of Work Health and Safety"],
            "levels": [
                {"title": "Assistant Safety Officer", "summary": "Supports the WHS team with inspections, incident reporting and toolbox talks.", "typical_experience": "Entry-level role, often with trade or site experience."},
                {"title": "Health and Safety Officer", "summary": "Conducts site inspections, risk assessments and safety training and supports investigations.", "typical_experience": "1–3 years in WHS roles or relevant on-site experience."},
                {"title": "Senior Safety Officer", "summary": "Leads safety on major projects, coaches teams and drives safety initiatives.", "typical_experience": "Extensive WHS experience on large and complex projects."},
                {"title": "Safety Manager", "summary": "Oversees WHS across multiple projects or an organisation, setting policy and strategy.", "typical_experience": "Senior WHS background and leadership capability."}
            ]
        },
        {
            "name": "Waterproofer",
            "salary_range": "$55,000 - $95,000",
            "overview": "Waterproofers protect buildings from leaks and moisture damage by installing specialised membranes and systems.",
            "core_skills": ["Attention to detail", "Surface preparation", "Problem-solving", "Teamwork", "Physical fitness", "Tool handling", "Communication"],
            "core_education": ["Certificate III in Construction Waterproofing (CPC31420)"],
            "levels": [
                {"title": "Apprentice Waterproofer", "summary": "Learns surface preparation, membrane systems and safety procedures under supervision.", "typical_experience": "Entry-level trade assistant or apprentice."},
                {"title": "Qualified Waterproofer", "summary": "Installs waterproofing systems in bathrooms, rooftops, balconies and basements.", "typical_experience": "Completed apprenticeship or Certificate III in Waterproofing."},
                {"title": "Waterproofing Supervisor", "summary": "Leads waterproofing teams, coordinates work with other trades and checks compliance with standards.", "typical_experience": "Experienced tradesperson with leadership responsibility."},
                {"title": "Waterproofing Consultant", "summary": "Advises builders and designers on waterproofing design, defect rectification and compliance.", "typical_experience": "Extensive experience in waterproofing and defect investigation."}
            ]
        },
        {
            "name": "Tiler",
            "salary_range": "$50,000 - $90,000",
            "overview": "Tilers install tiles on walls and floors in bathrooms, kitchens and other spaces, combining precision with a sense of design.",
            "core_skills": ["Precision", "Creativity", "Design sense", "Manual dexterity", "Mathematics", "Surface preparation", "Physical fitness"],
            "core_education": ["Certificate III in Wall and Floor Tiling (CPC31320)"],
            "levels": [
                {"title": "Apprentice Tiler", "summary": "Learns how to prepare surfaces, cut tiles and lay them accurately under supervision.", "typical_experience": "Entry-level trade role."},
                {"title": "Qualified Tiler", "summary": "Installs wall and floor tiles, follows plans and ensures quality finishes.", "typical_experience": "Completed tiling apprenticeship or equivalent experience."},
                {"title": "Specialist Tiler", "summary": "Works on complex patterns, feature walls or high-end materials such as mosaic and stone.", "typical_experience": "Several years tiling experience and strong design skills."},
                {"title": "Tiling Business Owner", "summary": "Runs a tiling business, manages clients, quoting and staff, and coordinates with builders.", "typical_experience": "Experienced tiler with business or leadership skills."}
            ]
        },
        {
            "name": "Plumber",
            "salary_range": "$60,000 - $110,000",
            "video_url": "https://www.youtube.com/embed/TfnWEG_u9GY",
            "overview": "Plumbers install and maintain water, drainage and gas systems, playing a key role in making buildings safe and liveable.",
            "core_skills": ["Problem-solving", "Technical knowledge", "Attention to detail", "Physical fitness", "Safety awareness", "Customer service"],
            "core_education": ["Certificate III in Plumbing (CPC32420)", "Apprenticeship"],
            "levels": [
                {"title": "Apprentice Plumber", "summary": "Learns how to install and maintain plumbing systems under supervision.", "typical_experience": "Entry-level trade apprentice."},
                {"title": "Qualified Plumber", "summary": "Installs, maintains and repairs plumbing systems in residential or commercial settings.", "typical_experience": "Completed apprenticeship and licensing requirements."},
                {"title": "Plumbing Supervisor", "summary": "Leads a team of plumbers, coordinates site work and liaises with builders and inspectors.", "typical_experience": "Several years as a qualified plumber with leadership skills."},
                {"title": "Plumbing Contractor / Business Owner", "summary": "Runs a plumbing business, manages multiple teams and jobs and handles quoting and client relationships.", "typical_experience": "Experienced supervisor or senior plumber with business skills."}
            ]
        },
        {
            "name": "Electrician",
            "salary_range": "$65,000 - $120,000",
            "overview": "Electricians install, maintain and repair electrical systems, making sure buildings are safe, reliable and energy efficient.",
            "core_skills": ["Technical knowledge", "Problem-solving", "Attention to detail", "Safety awareness", "Mathematics", "Communication"],
            "core_education": ["Certificate III in Electrotechnology (Electrician)", "Electrical Apprenticeship (typically 3–4 years)"],
            "levels": [
                {"title": "Electrical Apprentice", "summary": "Learns basic wiring, installation and fault-finding under supervision while completing formal training.", "typical_experience": "Entry-level trade apprentice."},
                {"title": "Qualified Electrician", "summary": "Installs, maintains and repairs electrical systems in residential, commercial or industrial settings.", "typical_experience": "Completed apprenticeship and licensing requirements."},
                {"title": "Senior Electrician / Leading Hand", "summary": "Leads small teams, tackles complex faults and mentors apprentices on site.", "typical_experience": "Several years as a qualified electrician with leadership responsibilities."},
                {"title": "Electrical Supervisor / Project Electrician", "summary": "Plans and coordinates electrical works across larger projects, including safety, quality and scheduling.", "typical_experience": "Experienced senior electrician comfortable with documentation and coordination."},
                {"title": "Electrical Project Manager", "summary": "Manages electrical packages on large projects, overseeing time, cost and quality and coordinating with other trades.", "typical_experience": "Strong field and coordination experience plus project management skills."},
                {"title": "Electrical Contractor / Business Owner", "summary": "Runs an electrical business, managing multiple teams, contracts and client relationships.", "typical_experience": "Extensive experience as a senior electrician or supervisor with business skills."}
            ]
        },
        {
            "name": "Crane Operator",
            "salary_range": "$70,000 - $130,000",
            "video_url": "https://www.youtube.com/embed/TfnWEG_u9GY",
            "overview": "Crane operators operate lifting equipment to move heavy materials and equipment safely around construction sites.",
            "core_skills": ["Technical precision", "Safety awareness", "Coordination", "Communication", "Problem-solving", "Focus"],
            "core_education": ["Certificate III in Rigging or Crane Operations", "High Risk Work Licence"],
            "levels": [
                {"title": "Trainee Crane Operator", "summary": "Learns basic crane operations, hand signals and safety procedures under supervision.", "typical_experience": "Entry-level role, often moving from general labouring or dogging."},
                {"title": "Crane Operator", "summary": "Operates cranes to lift and move materials safely on site within a team.", "typical_experience": "Completed training and licence requirements."},
                {"title": "Senior Crane Operator", "summary": "Handles complex lifts, mentors junior operators and works closely with site management on lift planning.", "typical_experience": "Strong experience operating cranes on busy sites."},
                {"title": "Crane Supervisor / Lift Planner", "summary": "Plans lifts, coordinates teams and ensures compliance with lift plans and safety requirements.", "typical_experience": "Senior crane or rigging background with planning responsibilities."}
            ]
        },
        {
            "name": "Heavy Vehicle Operator",
            "salary_range": "$60,000 - $100,000",
            "overview": "Heavy vehicle operators drive trucks and plant that move materials, equipment and waste to and from construction sites.",
            "core_skills": ["Vehicle operation", "Safety awareness", "Attention to detail", "Teamwork", "Problem-solving", "Physical stamina"],
            "core_education": ["Heavy Rigid (HR) or Heavy Combination (HC) Licence", "On-the-job training"],
            "levels": [
                {"title": "Trainee Heavy Vehicle Operator", "summary": "Drives under supervision and learns site access, loading and safety procedures.", "typical_experience": "Junior driver or labourer obtaining heavy vehicle licence."},
                {"title": "Heavy Vehicle Operator", "summary": "Transports materials and equipment safely to and around construction sites.", "typical_experience": "Licensed heavy vehicle driver with some site experience."},
                {"title": "Senior Heavy Vehicle Operator", "summary": "Manages more complex vehicle operations and supports planning of logistics.", "typical_experience": "Several years of heavy vehicle driving on busy construction or civil sites."},
                {"title": "Transport Supervisor / Fleet Coordinator", "summary": "Coordinates fleets, drivers and delivery schedules across projects.", "typical_experience": "Experienced driver or logistics professional."}
            ]
        },
        {
            "name": "Site Supervisor",
            "salary_range": "$75,000 - $130,000",
            "overview": "Site supervisors coordinate day-to-day work on site, looking after teams, safety, quality and short-term scheduling.",
            "core_skills": ["On-site leadership", "Communication", "Scheduling", "Health & Safety", "Problem-solving", "Attention to detail", "Trade knowledge", "Team coordination"],
            "core_education": ["Trade Qualification (e.g. Carpentry, Tiling, Waterproofing, Plumbing, Electrical)", "Certificate IV in Building and Construction (Site Management) or equivalent"],
            "levels": [
                {"title": "Leading Hand", "summary": "Senior tradesperson who supports the supervisor and coordinates small teams or specific tasks.", "typical_experience": "Experienced tradesperson trusted to lead others."},
                {"title": "Site Supervisor", "summary": "Manages day-to-day site operations, safety and quality for specific areas of work or smaller projects.", "typical_experience": "Several years in a trade plus leadership experience."},
                {"title": "Senior Site Supervisor / General Foreperson", "summary": "Oversees multiple work fronts and coordinates several crews and subcontractors.", "typical_experience": "Extensive supervisory experience across different types of projects."}
            ]
        }
    ]
};

// Skill categories mapping
const skillCategories = {
    "Technical": ["Technical knowledge", "Engineering principles", "Technical problem-solving", "Technical precision", "Computer and digital modelling skills", "IT and digital modelling", "Tool handling", "Mathematics", "Design sense", "Numerical analysis", "Cost planning", "Vehicle operation"],
    "Leadership & Management": ["Leadership", "Decision-making", "Budget management", "Budgeting", "On-site leadership", "Planning", "Coordination", "Team coordination"],
    "Communication & Organisation": ["Communication", "Organisation", "Scheduling", "Documentation", "Time management", "Negotiation", "Teamwork"],
    "Safety & Compliance": ["Safety awareness", "Health & Safety", "Risk assessment", "Compliance management", "Risk management", "Attention to detail"],
    "Hands-On Skills": ["Problem-solving", "Creativity", "Manual dexterity", "Precision", "Physical fitness", "Physical stamina", "Surface preparation", "Focus", "Customer service", "Training", "Software proficiency", "Knowledge of contracts and law", "Analytical thinking", "Financial management", "Trade knowledge"]
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
let filteredCareers = [...careersData.roles];
let selectedCategories = new Set();

// DOM Elements
const floatingView = document.getElementById('floatingView');
const cardView = document.getElementById('cardView');
const floatingContainer = document.getElementById('floatingCareersContainer');
const careersGrid = document.getElementById('careersGrid');
const infoPanel = document.getElementById('infoPanel');
const closeBtn = document.getElementById('closeBtn');
const pauseBtn = document.getElementById('pauseBtn');
const salaryFilter = document.getElementById('salaryFilter');
const skillsFilterContainer = document.getElementById('skillsFilterContainer');
const clearFiltersBtn = document.getElementById('clearFilters');
const noResults = document.getElementById('noResults');
const videoLegend = document.getElementById('videoLegend');

// Create skill category filter tags
Object.keys(skillCategories).forEach(category => {
    const tag = document.createElement('div');
    tag.className = 'skill-filter-tag';
    tag.textContent = category;
    tag.dataset.category = category;
    tag.addEventListener('click', () => toggleCategoryFilter(category, tag));
    skillsFilterContainer.appendChild(tag);
});

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
        floatingView.classList.add('active');
        cardView.classList.remove('active');
        pauseBtn.classList.add('visible');
        videoLegend.classList.add('visible');

        document.querySelectorAll('.toggle-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.view === 'floating');
        });

        // Reinitialize floating view
        if (careerElements.length === 0) {
            initFloatingView();
        }
    } else {
        floatingView.classList.remove('active');
        cardView.classList.add('active');
        pauseBtn.classList.remove('visible');
        videoLegend.classList.remove('visible');

        document.querySelectorAll('.toggle-btn').forEach(b => {
            b.classList.toggle('active', b.dataset.view === 'cards');
        });
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

    const orbit = Math.floor(index / 5);
    const angleOffset = (index % 5) * (2 * Math.PI / 5);

    const baseRadius = 250;
    const orbitSpacing = 120;
    const radius = baseRadius + (orbit * orbitSpacing);

    const radiusVariation = (Math.random() - 0.5) * 50;
    const angleVariation = (Math.random() - 0.5) * 0.5;

    const angle = angleOffset + angleVariation + (orbit * 0.3);
    const finalRadius = radius + radiusVariation;

    const x = centerX + Math.cos(angle) * finalRadius;
    const y = centerY + Math.sin(angle) * finalRadius;

    return { x, y, angle, radius: finalRadius };
}

function createFloatingCareerItem(career, index, total) {
    const item = document.createElement('div');
    item.className = 'career-item';

    const dot = document.createElement('div');
    dot.className = `career-dot ${Math.random() > 0.5 ? 'blue' : 'green'}`;

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
function createCareerCard(career) {
    const card = document.createElement('div');
    card.className = 'career-card';
    if (career.video_url) {
        card.classList.add('has-video');
    }

    const header = document.createElement('div');
    header.className = 'career-card-header';

    const dot = document.createElement('div');
    dot.className = `career-card-dot ${Math.random() > 0.5 ? 'blue' : 'green'}`;
    dot.style.background = Math.random() > 0.5 ? '#4299e1' : '#48bb78';

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

    card.appendChild(header);
    card.appendChild(salary);
    card.appendChild(overview);

    card.addEventListener('click', () => {
        showCareerInfo(career);
    });

    return card;
}

function renderCareerCards() {
    careersGrid.innerHTML = '';

    if (filteredCareers.length === 0) {
        noResults.style.display = 'block';
        return;
    }

    noResults.style.display = 'none';

    filteredCareers.forEach(career => {
        careersGrid.appendChild(createCareerCard(career));
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

    infoPanel.classList.add('visible');
}

// Filters
function parseSalaryRange(salaryString) {
    const match = salaryString.match(/\$?([\d,]+)/g);
    if (!match) return { min: 0, max: 0 };

    const numbers = match.map(s => parseInt(s.replace(/,/g, '')));
    return {
        min: numbers[0] || 0,
        max: numbers[1] || numbers[0] || 0
    };
}

function filterCareers() {
    const salaryRange = salaryFilter.value;

    filteredCareers = careersData.roles.filter(career => {
        // Salary filter
        if (salaryRange) {
            const careerSalary = parseSalaryRange(career.salary_range);
            const [min, max] = salaryRange.includes('+')
                ? [parseInt(salaryRange), Infinity]
                : salaryRange.split('-').map(s => parseInt(s));

            if (max === undefined) {
                if (careerSalary.max < min * 1000) return false;
            } else if (max === Infinity) {
                if (careerSalary.max < min * 1000) return false;
            } else {
                if (careerSalary.max < min * 1000 || careerSalary.min > max * 1000) return false;
            }
        }

        // Category filter
        if (selectedCategories.size > 0) {
            const careerCategories = getCategoriesForCareer(career);
            const hasAnyCategory = careerCategories.some(cat => selectedCategories.has(cat));
            if (!hasAnyCategory) return false;
        }

        return true;
    });

    renderCareerCards();

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

salaryFilter.addEventListener('change', filterCareers);

clearFiltersBtn.addEventListener('click', () => {
    salaryFilter.value = '';
    selectedCategories.clear();
    document.querySelectorAll('.skill-filter-tag').forEach(tag => {
        tag.classList.remove('active');
    });
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

pauseBtn.addEventListener('click', () => {
    isPaused = !isPaused;
    pauseBtn.classList.toggle('paused');
});

// Initialize
renderCareerCards();

// Handle window resize
let resizeTimeout;
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
    }, 250);
});
