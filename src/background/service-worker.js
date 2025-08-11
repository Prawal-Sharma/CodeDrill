// Code Drill - Service Worker
// Handles background tasks for the Chrome extension

// Extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
    console.log('Code Drill Extension installed/updated', details);
    
    // Initialize default settings
    if (details.reason === 'install') {
        initializeExtension();
    } else if (details.reason === 'update') {
        handleUpdate(details.previousVersion);
    }
});

// Initialize extension on first install
async function initializeExtension() {
    try {
        // Set default user stats
        await chrome.storage.local.set({
            userStats: {
                problemsSolved: 0,
                totalAttempts: 0,
                currentStreak: 0,
                bestStreak: 0,
                lastSolvedDate: null,
                solvedProblems: []
            },
            settings: {
                theme: 'light',
                defaultLanguage: 'python',
                autoSave: true,
                notifications: true,
                dailyGoal: 1
            }
        });
        
        // Set up daily challenge alarm
        chrome.alarms.create('dailyChallenge', {
            periodInMinutes: 1440, // 24 hours
            when: getNextDailyChallenge()
        });
        
        console.log('Extension initialized successfully');
    } catch (error) {
        console.error('Error initializing extension:', error);
    }
}

// Handle extension updates
async function handleUpdate(previousVersion) {
    console.log(`Updated from version ${previousVersion}`);
    
    // Migrate data if needed
    const data = await chrome.storage.local.get(null);
    
    // Add any new fields to existing data structures
    if (data.userStats && !data.userStats.solvedProblems) {
        data.userStats.solvedProblems = [];
        await chrome.storage.local.set({ userStats: data.userStats });
    }
}

// Get next daily challenge time (9 AM local time)
function getNextDailyChallenge() {
    const now = new Date();
    const next = new Date();
    next.setHours(9, 0, 0, 0);
    
    if (next <= now) {
        next.setDate(next.getDate() + 1);
    }
    
    return next.getTime();
}

// Handle alarms
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === 'dailyChallenge') {
        showDailyChallengeNotification();
    }
});

// Show daily challenge notification
async function showDailyChallengeNotification() {
    const settings = await chrome.storage.local.get(['settings']);
    
    if (settings.settings?.notifications) {
        chrome.notifications.create('dailyChallenge', {
            type: 'basic',
            iconUrl: '/assets/icons/icon-128.png',
            title: 'Daily Coding Challenge!',
            message: 'Time for your daily problem! Keep your streak going!',
            buttons: [
                { title: 'Start Now' },
                { title: 'Remind Me Later' }
            ],
            priority: 2
        });
    }
}

// Handle notification button clicks
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
    if (notificationId === 'dailyChallenge') {
        if (buttonIndex === 0) {
            // Open popup to start challenge
            chrome.action.openPopup();
        } else {
            // Snooze for 1 hour
            chrome.alarms.create('dailyChallengeSnooze', {
                delayInMinutes: 60
            });
        }
        chrome.notifications.clear(notificationId);
    }
});

// Message handling from popup and content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log('Message received:', request);
    
    switch (request.action) {
        case 'executeCode':
            handleCodeExecution(request.data)
                .then(sendResponse)
                .catch(error => sendResponse({ error: error.message }));
            return true; // Keep channel open for async response
            
        case 'fetchProblem':
            fetchProblem(request.difficulty)
                .then(sendResponse)
                .catch(error => sendResponse({ error: error.message }));
            return true;
            
        case 'updateStreak':
            updateUserStreak()
                .then(sendResponse)
                .catch(error => sendResponse({ error: error.message }));
            return true;
            
        case 'getStats':
            getUserStats()
                .then(sendResponse)
                .catch(error => sendResponse({ error: error.message }));
            return true;
            
        default:
            sendResponse({ error: 'Unknown action' });
    }
});

// Handle code execution via Judge0 API
async function handleCodeExecution(data) {
    const { code, language, testCases } = data;
    
    try {
        // Map language to Judge0 language ID
        const languageMap = {
            'python': 71,      // Python 3.8.1
            'javascript': 63,  // JavaScript (Node.js 12.14.0)
            'java': 62,        // Java (OpenJDK 13.0.1)
            'cpp': 54          // C++ (GCC 9.2.0)
        };
        
        const languageId = languageMap[language] || 71;
        
        // Execute code for each test case
        const results = await Promise.all(
            testCases.map(testCase => executeTestCase(code, languageId, testCase))
        );
        
        return {
            success: results.every(r => r.passed),
            results,
            summary: {
                passed: results.filter(r => r.passed).length,
                total: results.length
            }
        };
    } catch (error) {
        console.error('Code execution error:', error);
        throw error;
    }
}

// Execute a single test case
async function executeTestCase(code, languageId, testCase) {
    try {
        // Prepare submission for Judge0 API
        const submission = {
            source_code: code,
            language_id: languageId,
            stdin: testCase.input,
            expected_output: testCase.output,
            cpu_time_limit: 2,
            memory_limit: 128000
        };
        
        // Submit to Judge0 API (using the free CE endpoint)
        const response = await fetch('https://ce.judge0.com/submissions?wait=true', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(submission)
        });
        
        if (!response.ok) {
            throw new Error(`Judge0 API error: ${response.status}`);
        }
        
        const result = await response.json();
        
        // Process result
        const passed = result.status.id === 3; // Accepted
        const output = result.stdout || result.stderr || result.compile_output || '';
        
        return {
            passed,
            output: output.trim(),
            expected: testCase.output,
            time: result.time,
            memory: result.memory,
            status: result.status.description
        };
    } catch (error) {
        // Fallback to local execution for JavaScript
        if (languageId === 63) {
            return executeJavaScriptLocally(code, testCase);
        }
        throw error;
    }
}

// Execute JavaScript code locally (fallback)
async function executeJavaScriptLocally(code, testCase) {
    try {
        // Create a sandboxed function
        const func = new Function('input', `
            ${code}
            return main(input);
        `);
        
        const output = func(testCase.input);
        const passed = JSON.stringify(output) === JSON.stringify(testCase.output);
        
        return {
            passed,
            output: JSON.stringify(output),
            expected: testCase.output,
            time: '0ms',
            memory: 'N/A',
            status: 'Executed locally'
        };
    } catch (error) {
        return {
            passed: false,
            output: error.message,
            expected: testCase.output,
            time: '0ms',
            memory: 'N/A',
            status: 'Runtime Error'
        };
    }
}

// Fetch a problem from the database
async function fetchProblem(difficulty) {
    try {
        // Load problems from local file
        const response = await fetch(chrome.runtime.getURL('src/problems/problems.json'));
        const problems = await response.json();
        
        // Filter by difficulty if specified
        let filteredProblems = problems;
        if (difficulty && difficulty !== 'random') {
            filteredProblems = problems.filter(p => p.difficulty === difficulty);
        }
        
        // Get user's solved problems
        const data = await chrome.storage.local.get(['userStats']);
        const solvedIds = data.userStats?.solvedProblems || [];
        
        // Filter out solved problems (optional)
        const unsolvedProblems = filteredProblems.filter(p => !solvedIds.includes(p.id));
        
        // Select random problem
        const problemPool = unsolvedProblems.length > 0 ? unsolvedProblems : filteredProblems;
        const randomIndex = Math.floor(Math.random() * problemPool.length);
        
        return problemPool[randomIndex];
    } catch (error) {
        console.error('Error fetching problem:', error);
        throw error;
    }
}

// Update user streak
async function updateUserStreak() {
    try {
        const data = await chrome.storage.local.get(['userStats']);
        const stats = data.userStats || {};
        
        const today = new Date().toDateString();
        const lastSolved = stats.lastSolvedDate;
        
        if (!lastSolved || lastSolved !== today) {
            // Check if streak should continue or reset
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            
            if (lastSolved === yesterday.toDateString()) {
                // Continue streak
                stats.currentStreak++;
            } else {
                // Reset streak
                stats.currentStreak = 1;
            }
            
            stats.lastSolvedDate = today;
            
            // Update best streak
            if (stats.currentStreak > stats.bestStreak) {
                stats.bestStreak = stats.currentStreak;
            }
            
            await chrome.storage.local.set({ userStats: stats });
            
            // Check for streak milestones
            checkStreakMilestone(stats.currentStreak);
        }
        
        return stats;
    } catch (error) {
        console.error('Error updating streak:', error);
        throw error;
    }
}

// Check for streak milestones and show notifications
function checkStreakMilestone(streak) {
    const milestones = [7, 14, 30, 50, 100];
    
    if (milestones.includes(streak)) {
        chrome.notifications.create(`streak-${streak}`, {
            type: 'basic',
            iconUrl: '/assets/icons/icon-128.png',
            title: `🔥 ${streak} Day Streak!`,
            message: `Amazing! You've maintained a ${streak} day coding streak!`,
            priority: 2
        });
    }
}

// Get user statistics
async function getUserStats() {
    try {
        const data = await chrome.storage.local.get(['userStats']);
        return data.userStats || {};
    } catch (error) {
        console.error('Error getting user stats:', error);
        throw error;
    }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeExtension,
        handleCodeExecution,
        fetchProblem,
        updateUserStreak
    };
}