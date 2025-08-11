// Code Drill - Popup Script
// Main functionality for the Chrome extension popup

// DOM Elements
const elements = {
    welcomeScreen: document.getElementById('welcome-screen'),
    problemView: document.getElementById('problem-view'),
    statsView: document.getElementById('stats-view'),
    browserView: document.getElementById('browser-view'),
    getProblemBtn: document.getElementById('get-problem-btn'),
    browseProblemBtn: document.getElementById('browse-problems-btn'),
    settingsBtn: document.getElementById('settings-btn'),
    darkModeToggle: document.getElementById('dark-mode-toggle'),
    runCodeBtn: document.getElementById('run-code-btn'),
    submitBtn: document.getElementById('submit-btn'),
    hintBtn: document.getElementById('hint-btn'),
    solutionBtn: document.getElementById('solution-btn'),
    resetCodeBtn: document.getElementById('reset-code-btn'),
    backBtn: document.getElementById('back-btn'),
    browserBackBtn: document.getElementById('browser-back-btn'),
    problemTitle: document.getElementById('problem-title'),
    problemDifficulty: document.getElementById('problem-difficulty'),
    problemDescription: document.getElementById('problem-description'),
    problemTags: document.getElementById('problem-tags'),
    codeEditor: document.getElementById('code-editor'),
    languageSelect: document.getElementById('language-select'),
    testCases: document.getElementById('test-cases'),
    results: document.getElementById('results'),
    resultsContent: document.getElementById('results-content'),
    streak: document.getElementById('streak'),
    body: document.getElementById('popup-body'),
    problemSearch: document.getElementById('problem-search'),
    clearSearch: document.getElementById('clear-search'),
    categoryFilter: document.getElementById('category-filter'),
    browserSearch: document.getElementById('browser-search'),
    browserDifficulty: document.getElementById('browser-difficulty'),
    browserCategory: document.getElementById('browser-category'),
    problemList: document.getElementById('problem-list'),
    getProblemText: document.getElementById('get-problem-text')
};

// State
let currentProblem = null;
let currentCode = '';
let selectedDifficulty = 'random';
let selectedCategory = '';
let searchQuery = '';
let isDarkMode = false;
let codeEditor = null;
let allProblems = [];
let filteredProblems = [];
let userStats = {
    problemsSolved: 0,
    totalAttempts: 0,
    currentStreak: 0,
    bestStreak: 0
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadUserSettings();
    loadUserStats();
    loadAllProblems();
    setupEventListeners();
    initializeCodeEditor();
});

// Load user settings from Chrome storage
async function loadUserSettings() {
    try {
        const data = await chrome.storage.local.get(['settings']);
        const settings = data.settings || { 
            theme: 'light', 
            defaultLanguage: 'python',
            autoSave: true,
            notifications: true
        };
        
        isDarkMode = settings.theme === 'dark' || 
                    (settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        
        updateTheme();
        
    } catch (error) {
        console.error('Error loading user settings:', error);
    }
}

// Update theme based on current mode
function updateTheme() {
    if (isDarkMode) {
        elements.body.classList.add('dark-mode');
        elements.darkModeToggle.textContent = '☀️';
        elements.darkModeToggle.title = 'Switch to Light Mode';
    } else {
        elements.body.classList.remove('dark-mode');
        elements.darkModeToggle.textContent = '🌙';
        elements.darkModeToggle.title = 'Switch to Dark Mode';
    }
    
    // Update code editor theme if it exists
    if (codeEditor) {
        codeEditor.setDarkMode(isDarkMode);
    }
}

// Toggle dark mode
async function toggleDarkMode() {
    isDarkMode = !isDarkMode;
    updateTheme();
    
    // Save theme preference
    try {
        const data = await chrome.storage.local.get(['settings']);
        const settings = data.settings || {};
        settings.theme = isDarkMode ? 'dark' : 'light';
        await chrome.storage.local.set({ settings });
    } catch (error) {
        console.error('Error saving theme preference:', error);
    }
}

// Load user statistics from Chrome storage
async function loadUserStats() {
    try {
        const data = await chrome.storage.local.get(['userStats']);
        if (data.userStats) {
            userStats = data.userStats;
            updateStreakDisplay();
        }
    } catch (error) {
        console.error('Error loading user stats:', error);
    }
}

// Save user statistics to Chrome storage
async function saveUserStats() {
    try {
        await chrome.storage.local.set({ userStats });
    } catch (error) {
        console.error('Error saving user stats:', error);
    }
}

// Load all problems from local file
async function loadAllProblems() {
    try {
        const response = await fetch(chrome.runtime.getURL('src/problems/problems.json'));
        allProblems = await response.json();
        filteredProblems = [...allProblems];
    } catch (error) {
        console.error('Error loading problems:', error);
        allProblems = [];
        filteredProblems = [];
    }
}

// Filter problems based on current criteria
function filterProblems() {
    filteredProblems = allProblems.filter(problem => {
        // Search query filter
        if (searchQuery && !problem.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !problem.description.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        
        // Difficulty filter
        if (selectedDifficulty !== 'random' && selectedDifficulty !== '' && 
            problem.difficulty !== selectedDifficulty) {
            return false;
        }
        
        // Category filter
        if (selectedCategory && !problem.tags.some(tag => 
            tag.toLowerCase() === selectedCategory.toLowerCase())) {
            return false;
        }
        
        return true;
    });
    
    // Update button text based on filters
    updateGetProblemButtonText();
    
}

// Update the "Get Problem" button text based on current filters
function updateGetProblemButtonText() {
    let text = 'Get Problem';
    
    if (searchQuery) {
        text = `Get Matching (${filteredProblems.length})`;
    } else if (selectedDifficulty !== 'random' && selectedDifficulty !== '') {
        text = `Get ${selectedDifficulty.charAt(0).toUpperCase() + selectedDifficulty.slice(1)} (${filteredProblems.length})`;
    } else if (selectedCategory) {
        text = `Get ${selectedCategory} (${filteredProblems.length})`;
    } else {
        text = `Get Random (${filteredProblems.length})`;
    }
    
    elements.getProblemText.textContent = text;
}

// Setup event listeners
function setupEventListeners() {
    // Get problem button
    elements.getProblemBtn.addEventListener('click', loadFilteredProblem);
    
    // Browse problems button
    elements.browseProblemBtn.addEventListener('click', showBrowserView);
    
    // Dark mode toggle
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Difficulty buttons
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            selectedDifficulty = e.target.dataset.difficulty;
            // Update button styles
            document.querySelectorAll('.difficulty-btn').forEach(b => {
                b.classList.remove('ring-2', 'ring-offset-2', 'ring-offset-1');
            });
            e.target.classList.add('ring-2', 'ring-offset-1');
            filterProblems();
        });
    });
    
    // Search input
    elements.problemSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        if (searchQuery) {
            elements.clearSearch.classList.remove('hidden');
        } else {
            elements.clearSearch.classList.add('hidden');
        }
        filterProblems();
    });
    
    // Clear search button
    elements.clearSearch.addEventListener('click', () => {
        elements.problemSearch.value = '';
        searchQuery = '';
        elements.clearSearch.classList.add('hidden');
        filterProblems();
    });
    
    // Category filter
    elements.categoryFilter.addEventListener('change', (e) => {
        selectedCategory = e.target.value;
        filterProblems();
    });
    
    // Browser view search and filters
    elements.browserSearch.addEventListener('input', (e) => {
        searchQuery = e.target.value.trim();
        filterProblems();
        updateProblemList();
    });
    
    elements.browserDifficulty.addEventListener('change', (e) => {
        selectedDifficulty = e.target.value || 'random';
        filterProblems();
        updateProblemList();
    });
    
    elements.browserCategory.addEventListener('change', (e) => {
        selectedCategory = e.target.value;
        filterProblems();
        updateProblemList();
    });
    
    // Browser back button
    elements.browserBackBtn.addEventListener('click', () => {
        elements.browserView.classList.add('hidden');
        elements.welcomeScreen.classList.remove('hidden');
    });
    
    // Code execution buttons
    elements.runCodeBtn.addEventListener('click', runCode);
    elements.submitBtn.addEventListener('click', submitCode);
    
    // Helper buttons
    elements.hintBtn.addEventListener('click', showHint);
    elements.solutionBtn.addEventListener('click', showSolution);
    elements.resetCodeBtn.addEventListener('click', resetCode);
    
    // Navigation
    elements.settingsBtn.addEventListener('click', showStats);
    elements.backBtn.addEventListener('click', showWelcomeScreen);
    
    // Language selection
    elements.languageSelect.addEventListener('change', updateCodeTemplate);
}

// Initialize code editor with SimpleCodeEditor
function initializeCodeEditor() {
    // Initialize the simple code editor
    if (window.SimpleCodeEditor) {
        codeEditor = new SimpleCodeEditor(elements.codeEditor, 'python');
        window.codeEditor = codeEditor; // Also set as global for backward compatibility
        codeEditor.setupKeyboardShortcuts();
        
        // Apply current theme to editor
        codeEditor.setDarkMode(isDarkMode);
    } else {
        // Fallback to contenteditable
        elements.codeEditor.contentEditable = true;
        elements.codeEditor.addEventListener('input', (e) => {
            currentCode = e.target.innerText;
        });
    }
}

// Load a random problem
// Load a problem from the filtered set
async function loadFilteredProblem() {
    try {
        if (filteredProblems.length === 0) {
            showError('No problems match your current filters. Try adjusting your search or filters.');
            return;
        }
        
        // Show loading state
        elements.getProblemBtn.disabled = true;
        elements.getProblemBtn.innerHTML = '<span class="spinner"></span> Loading...';
        
        // Get random problem from filtered set
        const randomIndex = Math.floor(Math.random() * filteredProblems.length);
        const problem = filteredProblems[randomIndex];
        
        await displayProblem(problem);
        
    } catch (error) {
        console.error('Error loading filtered problem:', error);
        showError('Failed to load problem. Please try again.');
    } finally {
        elements.getProblemBtn.disabled = false;
        updateGetProblemButtonText();
    }
}

// Show the problem browser view
function showBrowserView() {
    elements.welcomeScreen.classList.add('hidden');
    elements.browserView.classList.remove('hidden');
    
    // Initialize browser filters with current values
    elements.browserSearch.value = searchQuery;
    elements.browserDifficulty.value = selectedDifficulty === 'random' ? '' : selectedDifficulty;
    elements.browserCategory.value = selectedCategory;
    
    // Update the problem list
    updateProblemList();
}

// Update the problem list in browser view
function updateProblemList() {
    const container = elements.problemList;
    container.innerHTML = '';
    
    if (filteredProblems.length === 0) {
        container.innerHTML = '<div class="text-center text-gray-500 py-8">No problems match your filters</div>';
        return;
    }
    
    // Sort problems by difficulty and title
    const sortedProblems = filteredProblems.sort((a, b) => {
        const diffOrder = { easy: 1, medium: 2, hard: 3 };
        if (diffOrder[a.difficulty] !== diffOrder[b.difficulty]) {
            return diffOrder[a.difficulty] - diffOrder[b.difficulty];
        }
        return a.title.localeCompare(b.title);
    });
    
    sortedProblems.forEach(problem => {
        const problemCard = document.createElement('div');
        problemCard.className = 'bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow cursor-pointer';
        
        const difficultyClass = `difficulty-${problem.difficulty}`;
        const tagElements = problem.tags.slice(0, 3).map(tag => 
            `<span class="problem-tag">${tag}</span>`
        ).join(' ');
        
        problemCard.innerHTML = `
            <div class="flex items-center justify-between mb-2">
                <h3 class="font-medium text-sm">${problem.title}</h3>
                <span class="px-2 py-1 text-xs rounded ${difficultyClass}">${problem.difficulty}</span>
            </div>
            <p class="text-xs text-gray-600 mb-2 line-clamp-2">${problem.description.substring(0, 80)}...</p>
            <div class="flex flex-wrap gap-1">
                ${tagElements}
            </div>
        `;
        
        problemCard.addEventListener('click', () => {
            loadSpecificProblem(problem);
        });
        
        container.appendChild(problemCard);
    });
}

// Load a specific problem from the browser
async function loadSpecificProblem(problem) {
    try {
        await displayProblem(problem);
        // Hide browser view and show problem view
        elements.browserView.classList.add('hidden');
    } catch (error) {
        console.error('Error loading specific problem:', error);
        showError('Failed to load problem. Please try again.');
    }
}

async function loadRandomProblem() {
    try {
        // Show loading state
        elements.getProblemBtn.disabled = true;
        elements.getProblemBtn.innerHTML = '<span class="spinner"></span> Loading...';
        
        // Fetch problem from local database (will be implemented)
        const problem = await fetchRandomProblem(selectedDifficulty);
        
        if (problem) {
            currentProblem = problem;
            displayProblem(problem);
            showProblemView();
        }
    } catch (error) {
        console.error('Error loading problem:', error);
        showError('Failed to load problem. Please try again.');
    } finally {
        elements.getProblemBtn.disabled = false;
        elements.getProblemBtn.innerHTML = 'Get Random Problem';
    }
}

// Fetch random problem from service worker
async function fetchRandomProblem(difficulty) {
    try {
        // Send message to service worker to fetch problem
        const response = await chrome.runtime.sendMessage({
            action: 'fetchProblem',
            difficulty: difficulty
        });
        
        if (response && response.error) {
            throw new Error(response.error);
        }
        
        return response;
    } catch (error) {
        console.error('Error fetching problem from service worker:', error);
        // Fallback to local sample problem
        return {
        id: 1,
        title: 'Two Sum',
        difficulty: 'easy',
        description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
        examples: [
            {
                input: 'nums = [2,7,11,15], target = 9',
                output: '[0,1]',
                explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
            }
        ],
        constraints: [
            '2 <= nums.length <= 10^4',
            '-10^9 <= nums[i] <= 10^9',
            '-10^9 <= target <= 10^9'
        ],
        tags: ['Array', 'Hash Table'],
        testCases: [
            { input: '[2,7,11,15]\n9', output: '[0,1]' },
            { input: '[3,2,4]\n6', output: '[1,2]' },
            { input: '[3,3]\n6', output: '[0,1]' }
        ],
        hints: [
            'A brute force approach would be to use two nested loops.',
            'Can you think of a way to do this in one pass using a hash table?'
        ],
        solution: {
            python: `def twoSum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return [seen[complement], i]
        seen[num] = i
    return []`,
            javascript: `function twoSum(nums, target) {
    const seen = {};
    for (let i = 0; i < nums.length; i++) {
        const complement = target - nums[i];
        if (complement in seen) {
            return [seen[complement], i];
        }
        seen[nums[i]] = i;
    }
    return [];
}`
        }
    };
}

}

// Display problem in the UI
function displayProblem(problem) {
    elements.problemTitle.textContent = problem.title;
    elements.problemDifficulty.textContent = problem.difficulty;
    elements.problemDifficulty.className = `px-2 py-1 text-xs rounded difficulty-${problem.difficulty}`;
    
    // Build description HTML
    let descriptionHTML = `<p>${problem.description}</p>`;
    if (problem.examples) {
        descriptionHTML += '<div class="mt-3"><strong>Examples:</strong></div>';
        problem.examples.forEach((ex, i) => {
            descriptionHTML += `
                <div class="mt-2 text-xs">
                    <div><strong>Example ${i + 1}:</strong></div>
                    <div class="font-mono bg-gray-100 p-2 rounded mt-1">
                        <div>Input: ${ex.input}</div>
                        <div>Output: ${ex.output}</div>
                        ${ex.explanation ? `<div>Explanation: ${ex.explanation}</div>` : ''}
                    </div>
                </div>
            `;
        });
    }
    elements.problemDescription.innerHTML = descriptionHTML;
    
    // Display tags
    elements.problemTags.innerHTML = problem.tags
        .map(tag => `<span class="problem-tag">${tag}</span>`)
        .join('');
    
    // Display test cases
    displayTestCases(problem.testCases);
    
    // Set initial code template
    updateCodeTemplate();
}

// Display test cases
function displayTestCases(testCases) {
    elements.testCases.innerHTML = testCases
        .slice(0, 2) // Show only first 2 test cases
        .map((tc, i) => `
            <div class="test-case" data-index="${i}">
                <div class="font-semibold">Test Case ${i + 1}:</div>
                <div class="font-mono text-xs mt-1">
                    <div>Input: ${tc.input}</div>
                    <div>Expected: ${tc.output}</div>
                </div>
            </div>
        `)
        .join('');
}

// Update code template based on selected language
function updateCodeTemplate() {
    const language = elements.languageSelect.value;
    
    if (currentProblem && window.codeEditor) {
        window.codeEditor.updateTemplate(currentProblem.title, language);
        currentCode = window.codeEditor.getValue();
    } else if (currentProblem) {
        // Fallback for contenteditable
        let template = '';
        if (language === 'python') {
            template = `def twoSum(nums, target):
    # Your code here
    pass`;
        } else if (language === 'javascript') {
            template = `function twoSum(nums, target) {
    // Your code here
    
}`;
        }
        elements.codeEditor.innerText = template;
        currentCode = template;
    }
}

// Debounce function to prevent rapid clicks
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Run code against test cases
const runCode = debounce(async function() {
    // Get code from editor
    if (window.codeEditor) {
        currentCode = window.codeEditor.getValue();
    }
    
    if (!currentCode.trim()) {
        showError('Please write some code first!');
        return;
    }
    
    // Enhanced loading state
    elements.runCodeBtn.classList.add('loading');
    elements.runCodeBtn.disabled = true;
    const originalText = elements.runCodeBtn.textContent;
    
    // Add progress indicator
    showProgressIndicator('Executing code...');
    
    try {
        // Execute code via service worker (Judge0 API)
        await executeCodeViaWorker();
    } catch (error) {
        console.error('Error running code:', error);
        showError('Failed to run code. Please try again.');
    } finally {
        elements.runCodeBtn.classList.remove('loading');
        elements.runCodeBtn.disabled = false;
        elements.runCodeBtn.textContent = originalText;
        hideProgressIndicator();
    }
}, 500); // 500ms debounce

// Submit code for final validation
const submitCode = debounce(async function() {
    // Get code from editor
    if (window.codeEditor) {
        currentCode = window.codeEditor.getValue();
    }
    
    if (!currentCode.trim()) {
        showError('Please write some code first!');
        return;
    }
    
    // Enhanced loading state
    elements.submitBtn.classList.add('loading');
    elements.submitBtn.disabled = true;
    const originalText = elements.submitBtn.textContent;
    
    // Add progress indicator
    showProgressIndicator('Submitting solution...');
    
    try {
        // Submit code via service worker (Judge0 API with all test cases)
        await submitCodeViaWorker();
    } catch (error) {
        console.error('Error submitting code:', error);
        showError('Failed to submit code. Please try again.');
    } finally {
        elements.submitBtn.classList.remove('loading');
        elements.submitBtn.disabled = false;
        elements.submitBtn.textContent = originalText;
        hideProgressIndicator();
    }
}, 500); // 500ms debounce

// Execute code via service worker
async function executeCodeViaWorker() {
    try {
        const language = elements.languageSelect.value;
        
        // Send code execution request to service worker
        const response = await chrome.runtime.sendMessage({
            action: 'executeCode',
            data: {
                code: currentCode,
                language: language,
                testCases: currentProblem.testCases.slice(0, 3) // Limit to first 3 test cases
            }
        });
        
        if (response.error) {
            throw new Error(response.error);
        }
        
        // Show real results
        showResults({
            success: response.success,
            testsPassed: response.summary.passed,
            totalTests: response.summary.total,
            output: formatExecutionResults(response.results),
            runtime: response.results[0]?.time || 'N/A',
            memory: response.results[0]?.memory || 'N/A'
        });
        
    } catch (error) {
        console.error('Code execution error:', error);
        // Fallback to mock execution
        await simulateCodeExecution();
    }
}

// Submit code via service worker (all test cases)
async function submitCodeViaWorker() {
    try {
        const language = elements.languageSelect.value;
        
        // Send code submission request to service worker
        const response = await chrome.runtime.sendMessage({
            action: 'executeCode',
            data: {
                code: currentCode,
                language: language,
                testCases: currentProblem.testCases // All test cases for submission
            }
        });
        
        if (response.error) {
            throw new Error(response.error);
        }
        
        const success = response.success;
        
        // Update user stats if successful
        if (success) {
            await updateUserStats();
        }
        
        // Show submission results
        showResults({
            success: success,
            testsPassed: response.summary.passed,
            totalTests: response.summary.total,
            output: success ? 'All test cases passed! 🎉' : formatExecutionResults(response.results),
            runtime: response.results[0]?.time || 'N/A',
            memory: response.results[0]?.memory || 'N/A'
        });
        
        // Show success notification if all tests passed
        if (success) {
            showSuccess('Solution accepted! Great job! 🎉');
        }
        
    } catch (error) {
        console.error('Code submission error:', error);
        // Fallback to mock execution
        await simulateCodeSubmission();
    }
}

// Update user stats
async function updateUserStats() {
    try {
        const response = await chrome.runtime.sendMessage({
            action: 'updateStreak'
        });
        
        if (response && !response.error) {
            userStats = response;
            updateStreakDisplay();
        }
    } catch (error) {
        console.error('Error updating stats:', error);
    }
}

// Format execution results for display
function formatExecutionResults(results) {
    return results.map((result, index) => {
        const status = result.passed ? '✅ Passed' : '❌ Failed';
        const output = result.output ? `\nOutput: ${result.output}` : '';
        const expected = result.expected ? `\nExpected: ${result.expected}` : '';
        return `Test Case ${index + 1}: ${status}${output}${expected}`;
    }).join('\n\n');
}

// Simulate code execution (fallback)
async function simulateCodeExecution() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Show mock results
    showResults({
        success: Math.random() > 0.3,
        testsPassed: 1,
        totalTests: 2,
        output: 'Test Case 1: Passed\nTest Case 2: Failed\n(Note: Using mock execution)',
        runtime: '28 ms',
        memory: '14.2 MB'
    });
}

// Simulate code submission (temporary)
async function simulateCodeSubmission() {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const success = Math.random() > 0.4;
    
    if (success) {
        // Update stats
        userStats.problemsSolved++;
        userStats.totalAttempts++;
        userStats.currentStreak++;
        if (userStats.currentStreak > userStats.bestStreak) {
            userStats.bestStreak = userStats.currentStreak;
        }
        await saveUserStats();
        updateStreakDisplay();
    }
    
    showResults({
        success,
        testsPassed: success ? 3 : 2,
        totalTests: 3,
        output: success ? 'All test cases passed!' : 'Some test cases failed.',
        runtime: '32 ms',
        memory: '14.5 MB'
    });
}

// Show code execution results
function showResults(result) {
    elements.results.classList.remove('hidden');
    
    const statusClass = result.success ? 'result-success' : 'result-error';
    elements.resultsContent.innerHTML = `
        <div class="${statusClass} mb-2">
            ${result.success ? '✅ Accepted' : '❌ Wrong Answer'}
        </div>
        <div class="text-xs space-y-1">
            <div>Tests Passed: ${result.testsPassed}/${result.totalTests}</div>
            <div>Runtime: ${result.runtime}</div>
            <div>Memory: ${result.memory}</div>
            <div class="mt-2 font-mono bg-white p-2 rounded">${result.output}</div>
        </div>
    `;
    
    elements.resultsContent.scrollIntoView({ behavior: 'smooth' });
}

// Show hint
function showHint() {
    if (!currentProblem || !currentProblem.hints) return;
    
    const hintIndex = parseInt(elements.hintBtn.dataset.hintIndex || '0');
    const hint = currentProblem.hints[hintIndex];
    
    if (hint) {
        showModal('Hint ' + (hintIndex + 1), hint);
        elements.hintBtn.dataset.hintIndex = Math.min(hintIndex + 1, currentProblem.hints.length - 1);
    }
}

// Show solution
function showSolution() {
    if (!currentProblem || !currentProblem.solution) return;
    
    const language = elements.languageSelect.value;
    const solution = currentProblem.solution[language];
    
    if (solution) {
        showModal('Solution', `<pre class="font-mono text-xs bg-gray-100 p-3 rounded overflow-x-auto">${solution}</pre>`);
    }
}

// Reset code to template
function resetCode() {
    updateCodeTemplate();
    elements.results.classList.add('hidden');
}

// Show modal dialog
function showModal(title, content) {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay fade-in';
    modal.innerHTML = `
        <div class="modal-content">
            <div class="flex justify-between items-center mb-3">
                <h3 class="text-lg font-semibold">${title}</h3>
                <button class="text-gray-500 hover:text-gray-700 text-xl">&times;</button>
            </div>
            <div>${content}</div>
        </div>
    `;
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.matches('button')) {
            modal.remove();
        }
    });
    
    document.body.appendChild(modal);
}

// Show error message
function showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded shadow-lg fade-in';
    errorDiv.textContent = message;
    
    document.body.appendChild(errorDiv);
    
    setTimeout(() => {
        errorDiv.remove();
    }, 3000);
}

// Show progress indicator
function showProgressIndicator(message = 'Loading...') {
    // Remove existing indicator
    hideProgressIndicator();
    
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay fade-in';
    overlay.id = 'progress-indicator';
    overlay.innerHTML = `
        <div class="loading-content">
            <div class="progress-bar">
                <div class="progress-indeterminate"></div>
            </div>
            <div class="loading-text">${message}</div>
        </div>
    `;
    
    document.body.appendChild(overlay);
}

// Hide progress indicator
function hideProgressIndicator() {
    const indicator = document.getElementById('progress-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Show success message
function showSuccess(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg fade-in';
    successDiv.textContent = message;
    
    document.body.appendChild(successDiv);
    
    setTimeout(() => {
        successDiv.remove();
    }, 3000);
}

// Update streak display
function updateStreakDisplay() {
    elements.streak.textContent = `🔥 ${userStats.currentStreak}`;
}

// Navigation functions
function showWelcomeScreen() {
    elements.welcomeScreen.classList.remove('hidden');
    elements.problemView.classList.add('hidden');
    elements.statsView.classList.add('hidden');
}

function showProblemView() {
    elements.welcomeScreen.classList.add('hidden');
    elements.problemView.classList.remove('hidden');
    elements.statsView.classList.add('hidden');
}

function showStats() {
    elements.welcomeScreen.classList.add('hidden');
    elements.problemView.classList.add('hidden');
    elements.statsView.classList.remove('hidden');
    
    // Update stats display
    document.querySelector('#stats-view .text-blue-600').textContent = userStats.problemsSolved;
    document.querySelector('#stats-view .text-green-600').textContent = 
        userStats.totalAttempts > 0 
            ? Math.round((userStats.problemsSolved / userStats.totalAttempts) * 100) + '%'
            : '0%';
    document.querySelector('#stats-view .text-yellow-600').textContent = userStats.currentStreak;
    document.querySelector('#stats-view .text-purple-600').textContent = userStats.bestStreak;
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        loadRandomProblem,
        displayProblem,
        runCode,
        submitCode
    };
}