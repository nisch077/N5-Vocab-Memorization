// Vocabulary data is loaded from vocabulary-data.js

// Game state
let currentQuestionIndex = 0;
let score = 0;
let currentOptions = [];
let correctAnswer = "";
let selectedLesson = "all";
let filteredVocabulary = [];

// Sidebar hover functionality
const sidebar = document.getElementById('sidebar');
const sidebarTrigger = document.querySelector('.sidebar-trigger');

sidebarTrigger.addEventListener('mouseenter', function() {
    sidebar.classList.add('show');
});

sidebar.addEventListener('mouseenter', function() {
    sidebar.classList.add('show');
});

sidebar.addEventListener('mouseleave', function() {
    sidebar.classList.remove('show');
});

sidebarTrigger.addEventListener('mouseleave', function() {
    setTimeout(() => {
        if (!sidebar.matches(':hover')) {
            sidebar.classList.remove('show');
        }
    }, 100);
});

// Sidebar functionality
document.querySelectorAll('.lesson-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all buttons
        document.querySelectorAll('.lesson-btn').forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Get selected lesson
        selectedLesson = this.getAttribute('data-lesson');
        
        // Restart game with selected lesson
        initGame();
    });
});

// Filter vocabulary based on selected lesson
function getFilteredVocabulary() {
    if (selectedLesson === "all") {
        return vocabularyData;
    } else {
        return vocabularyData.filter(vocab => vocab.lesson === parseInt(selectedLesson));
    }
}

// Initialize game
function initGame() {
    filteredVocabulary = getFilteredVocabulary();
    
    // Check if there's vocabulary for this lesson
    if (filteredVocabulary.length === 0) {
        alert(`Lesson ${selectedLesson} has no vocabulary yet. Please add vocabulary for this lesson.`);
        return;
    }
    
    currentQuestionIndex = 0;
    score = 0;
    updateStats();
    loadQuestion();
    
    // Hide results screen if visible
    document.querySelector('.results-screen').classList.remove('active');
    document.querySelector('.game-screen').classList.remove('hidden');
}

// Update stats display
function updateStats() {
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    document.getElementById('total-questions').textContent = filteredVocabulary.length;
    document.getElementById('score').textContent = score;
}

// Load current question
function loadQuestion() {
    if (currentQuestionIndex >= filteredVocabulary.length) {
        showResults();
        return;
    }

    const currentVocab = filteredVocabulary[currentQuestionIndex];
    document.getElementById('japanese-word').textContent = currentVocab.japanese;
    
    // Generate options
    correctAnswer = currentVocab.meaning;
    const wrongAnswers = filteredVocabulary
        .filter((v, idx) => idx !== currentQuestionIndex)
        .map(v => v.meaning)
        .sort(() => Math.random() - 0.5)
        .slice(0, 3);
    
    currentOptions = [...wrongAnswers, correctAnswer].sort(() => Math.random() - 0.5);
    
    // Display options
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach((btn, idx) => {
        btn.querySelector('.option-text').textContent = currentOptions[idx];
        btn.classList.remove('correct', 'wrong');
        btn.disabled = false;
    });
}

// Handle answer selection
function selectAnswer(selectedOption, buttonElement) {
    const allButtons = document.querySelectorAll('.option-btn');
    allButtons.forEach(btn => btn.disabled = true);

    if (selectedOption === correctAnswer) {
        buttonElement.classList.add('correct');
        score++;
        document.getElementById('score').textContent = score;
    } else {
        buttonElement.classList.add('wrong');
        // Highlight correct answer
        allButtons.forEach(btn => {
            if (btn.querySelector('.option-text').textContent === correctAnswer) {
                btn.classList.add('correct');
            }
        });
    }

    setTimeout(() => {
        currentQuestionIndex++;
        updateStats();
        loadQuestion();
    }, 1500);
}

// Show results
function showResults() {
    document.querySelector('.game-screen').classList.add('hidden');
    document.querySelector('.results-screen').classList.add('active');
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-total').textContent = filteredVocabulary.length;
}

// Add click event listeners to option buttons
document.querySelectorAll('.option-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        const selectedText = this.querySelector('.option-text').textContent;
        selectAnswer(selectedText, this);
    });
});

// Lifeline placeholders (will be implemented in Step 3)
document.getElementById('fifty-fifty').addEventListener('click', function() {
    console.log('50/50 clicked - will implement in Step 3');
});

document.getElementById('skip').addEventListener('click', function() {
    console.log('Skip clicked - will implement in Step 3');
});

document.getElementById('hint').addEventListener('click', function() {
    console.log('Hint clicked - will implement in Step 3');
});

// Start the game
initGame();