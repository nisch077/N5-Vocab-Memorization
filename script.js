// script.js

// Vocabulary data is loaded from vocabulary-data.js

// Game state
let currentQuestionIndex = 0;
let score = 0;
let currentOptions = [];
let correctAnswer = "";
let selectedLesson = "all";
let filteredVocabulary = [];
let lifelinesUsed = {
    fiftyFifty: false,
    skip: false,
    hint: false
};
let quizMode = "easy";
let questionLimit = 5;
let allQuestions = [];

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

// Mode Selection Functionality
const modeCards = document.querySelectorAll('.mode-card');
const customInput = document.getElementById('custom-input');
const startCustomBtn = document.getElementById('start-custom');
const backToModesBtn = document.getElementById('back-to-modes');
const modeSelectionScreen = document.querySelector('.mode-selection-screen');
const gameScreen = document.querySelector('.game-screen');

// Handle mode card clicks
modeCards.forEach(card => {
    card.addEventListener('click', function() {
        const mode = this.getAttribute('data-mode');
        
        // Remove selected class from all cards
        modeCards.forEach(c => c.classList.remove('selected'));
        
        // Add selected class to clicked card
        this.classList.add('selected');
        
        if (mode === 'custom') {
            // Get filtered vocabulary count
            const availableVocab = getFilteredVocabulary();
            const availableCount = availableVocab.length;
            
            // Update available count display
            document.getElementById('available-count').textContent = availableCount;
            
            // Set max value for input
            document.getElementById('question-count').max = availableCount;
            document.getElementById('question-count').value = Math.min(15, availableCount);
            
            // Show custom input
            customInput.classList.remove('hidden');
            backToModesBtn.classList.remove('hidden');
        } else {
            // Hide custom input
            customInput.classList.add('hidden');
            backToModesBtn.classList.add('hidden');
            
            // Set mode and start quiz
            quizMode = mode;
            setQuestionLimit(mode);
            startQuiz();
        }
    });
});

// Handle custom mode start
startCustomBtn.addEventListener('click', function() {
    const customCount = parseInt(document.getElementById('question-count').value);
    
    if (customCount < 1) {
        alert('Please enter at least 1 question.');
        return;
    }
    
    quizMode = 'custom';
    questionLimit = customCount;
    startQuiz();
});

// Handle back to modes button
backToModesBtn.addEventListener('click', function() {
    customInput.classList.add('hidden');
    backToModesBtn.classList.add('hidden');
    modeCards.forEach(c => c.classList.remove('selected'));
});

// Set question limit based on mode
function setQuestionLimit(mode) {
    switch(mode) {
        case 'easy':
            questionLimit = 5;
            break;
        case 'medium':
            questionLimit = 10;
            break;
        case 'hard':
            questionLimit = 20;
            break;
        default:
            questionLimit = 5;
    }
}

// Start quiz function
function startQuiz() {
    // Get filtered vocabulary
    filteredVocabulary = getFilteredVocabulary();
    
    if (filteredVocabulary.length === 0) {
        alert(`Lesson ${selectedLesson} has no vocabulary yet. Please add vocabulary for this lesson.`);
        return;
    }
    
    // Limit questions based on mode
    if (questionLimit > filteredVocabulary.length) {
        questionLimit = filteredVocabulary.length;
        alert(`Only ${filteredVocabulary.length} questions available for this lesson.`);
    }
    
    // Shuffle and select questions
    allQuestions = [...filteredVocabulary].sort(() => Math.random() - 0.5).slice(0, questionLimit);
    
    // Hide mode selection, show game screen
    modeSelectionScreen.classList.add('hidden');
    gameScreen.classList.remove('hidden');
    
    // Initialize game
    initGame();
}

// Sidebar functionality
document.querySelectorAll('.lesson-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all buttons
        document.querySelectorAll('.lesson-btn').forEach(b => b.classList.remove('active'));
        
        // Add active class to clicked button
        this.classList.add('active');
        
        // Get selected lesson
        selectedLesson = this.getAttribute('data-lesson');
        
        // If "All Lessons" is selected, start quiz directly with all vocabulary
        if (selectedLesson === 'all') {
            quizMode = 'all';
            questionLimit = vocabularyData.length;
            startQuiz();
        } else {
            // For specific lessons, show mode selection screen
            modeSelectionScreen.classList.remove('hidden');
            gameScreen.classList.add('hidden');
            
            // Reset mode selection
            modeCards.forEach(c => c.classList.remove('selected'));
            customInput.classList.add('hidden');
            backToModesBtn.classList.add('hidden');
        }
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

// Reset lifelines
function resetLifelines() {
    lifelinesUsed = {
        fiftyFifty: false,
        skip: false,
        hint: false
    };
    
    // Re-enable all lifeline buttons
    document.getElementById('fifty-fifty').disabled = false;
    document.getElementById('skip').disabled = false;
    document.getElementById('hint').disabled = false;
}

// Initialize game
function initGame() {
    currentQuestionIndex = 0;
    score = 0;
    resetLifelines();
    updateStats();
    loadQuestion();
    
    // Hide results screen if visible
    document.querySelector('.results-screen').classList.remove('active');
}

// Update stats display
function updateStats() {
    document.getElementById('current-question').textContent = currentQuestionIndex + 1;
    document.getElementById('total-questions').textContent = allQuestions.length;
    document.getElementById('score').textContent = score;
}

// Load current question
function loadQuestion() {
    if (currentQuestionIndex >= allQuestions.length) {
        showResults();
        return;
    }

    const currentVocab = allQuestions[currentQuestionIndex];
    document.getElementById('japanese-word').textContent = currentVocab.japanese;
    
    // Generate options
    correctAnswer = currentVocab.meaning;
    
    // Get wrong answers from the full filtered vocabulary
    const wrongAnswers = filteredVocabulary
        .filter(v => v.meaning !== currentVocab.meaning)
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
        btn.style.opacity = '1';
        btn.style.backgroundColor = '';
        btn.style.transform = '';
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
    gameScreen.classList.add('hidden');
    document.querySelector('.results-screen').classList.add('active');
    document.getElementById('final-score').textContent = score;
    document.getElementById('final-total').textContent = allQuestions.length;
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
    if (lifelinesUsed.fiftyFifty) return;
    
    lifelinesUsed.fiftyFifty = true;
    this.disabled = true;
    
    // Find the correct answer button and one random wrong answer to keep
    const optionButtons = Array.from(document.querySelectorAll('.option-btn'));
    const correctButton = optionButtons.find(btn => 
        btn.querySelector('.option-text').textContent === correctAnswer
    );
    
    // Get all wrong answer buttons
    const wrongButtons = optionButtons.filter(btn => 
        btn.querySelector('.option-text').textContent !== correctAnswer
    );
    
    // Randomly select one wrong answer to keep
    const keepWrongButton = wrongButtons[Math.floor(Math.random() * wrongButtons.length)];
    
    // Disable and fade out the other wrong answers
    wrongButtons.forEach(btn => {
        if (btn !== keepWrongButton) {
            btn.disabled = true;
            btn.style.opacity = '0.3';
        }
    });
});

document.getElementById('skip').addEventListener('click', function() {
    if (lifelinesUsed.skip) return;
    
    lifelinesUsed.skip = true;
    this.disabled = true;
    
    // Move to next question
    currentQuestionIndex++;
    updateStats();
    loadQuestion();
});

document.getElementById('hint').addEventListener('click', function() {
    if (lifelinesUsed.hint) return;
    
    lifelinesUsed.hint = true;
    this.disabled = true;
    
    // Highlight the correct answer
    const optionButtons = document.querySelectorAll('.option-btn');
    optionButtons.forEach(btn => {
        if (btn.querySelector('.option-text').textContent === correctAnswer) {
            btn.style.backgroundColor = '#10b981';
            btn.style.transform = 'scale(1.05)';
            
            // Add a subtle pulse animation
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 200);
        }
    });
});

// Initialize with "All Lessons" mode on page load
window.addEventListener('DOMContentLoaded', function() {
    selectedLesson = 'all';
    quizMode = 'all';
    questionLimit = vocabularyData.length;
    startQuiz();
});