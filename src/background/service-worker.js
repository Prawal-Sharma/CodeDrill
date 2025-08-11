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
        // Validate input
        if (!code || !code.trim()) {
            throw new Error('Code is required');
        }
        if (!testCases || testCases.length === 0) {
            throw new Error('Test cases are required');
        }
        
        // Map language to Judge0 language ID
        const languageMap = {
            'python': 71,      // Python 3.8.1
            'javascript': 63,  // JavaScript (Node.js 12.14.0)
            'java': 62,        // Java (OpenJDK 13.0.1)
            'cpp': 54          // C++ (GCC 9.2.0)
        };
        
        const languageId = languageMap[language] || 71;
        
        console.log(`Executing ${language} code with ${testCases.length} test cases...`);
        
        // Execute code for each test case with better error handling
        const results = await Promise.allSettled(
            testCases.map(testCase => executeTestCase(code, languageId, testCase))
        );
        
        // Process results, handling failures gracefully
        const processedResults = results.map((result, index) => {
            if (result.status === 'fulfilled') {
                return result.value;
            } else {
                console.error(`Test case ${index + 1} failed:`, result.reason);
                return {
                    passed: false,
                    output: `Execution failed: ${result.reason.message}`,
                    expected: testCases[index].output,
                    time: '0ms',
                    memory: 'N/A',
                    status: 'Error'
                };
            }
        });
        
        const passedCount = processedResults.filter(r => r.passed).length;
        const success = passedCount === processedResults.length;
        
        console.log(`Execution complete: ${passedCount}/${processedResults.length} tests passed`);
        
        return {
            success,
            results: processedResults,
            summary: {
                passed: passedCount,
                total: processedResults.length
            }
        };
    } catch (error) {
        console.error('Code execution error:', error);
        return {
            success: false,
            results: [{
                passed: false,
                output: `System Error: ${error.message}`,
                expected: 'N/A',
                time: '0ms',
                memory: 'N/A',
                status: 'System Error'
            }],
            summary: { passed: 0, total: 1 }
        };
    }
}

// Rate limiting state
let lastApiCall = 0;
const API_CALL_DELAY = 1000; // 1 second between API calls

// Retry with exponential backoff
async function retryWithBackoff(asyncFunction, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await asyncFunction();
        } catch (error) {
            if (attempt === maxRetries - 1) {
                throw error; // Last attempt, throw the error
            }
            
            const delay = baseDelay * Math.pow(2, attempt);
            console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
}

// Execute a single test case
async function executeTestCase(code, languageId, testCase) {
    try {
        // Rate limiting - ensure minimum delay between API calls
        const now = Date.now();
        const timeSinceLastCall = now - lastApiCall;
        if (timeSinceLastCall < API_CALL_DELAY) {
            await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY - timeSinceLastCall));
        }
        lastApiCall = Date.now();
        
        // Prepare submission for Judge0 API
        const submission = {
            source_code: code,
            language_id: languageId,
            stdin: testCase.input,
            expected_output: testCase.output,
            cpu_time_limit: 2,
            memory_limit: 128000
        };
        
        // Try Judge0 API first with retry logic
        const tryJudge0 = async () => {
            const response = await fetch('https://ce.judge0.com/submissions?wait=true&base64_encoded=false', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-RapidAPI-Host': 'ce.judge0.com'
                },
                body: JSON.stringify(submission)
            });
            
            if (!response.ok) {
                throw new Error(`Judge0 API error: ${response.status} ${response.statusText}`);
            }
            
            return response;
        };
        
        try {
            const response = await retryWithBackoff(tryJudge0, 2, 1000);
            const result = await response.json();
            
            // Process Judge0 result
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
            console.log('Judge0 API failed after retries, trying Piston API...', error.message);
            return await executePistonAPI(code, languageId, testCase);
        }
    } catch (error) {
        // Final fallback to local execution for JavaScript
        if (languageId === 63) {
            return executeJavaScriptLocally(code, testCase);
        }
        throw error;
    }
}

// Execute code using Piston API (reliable fallback)
async function executePistonAPI(code, languageId, testCase) {
    // Rate limiting for Piston API
    const now = Date.now();
    const timeSinceLastCall = now - lastApiCall;
    if (timeSinceLastCall < API_CALL_DELAY) {
        await new Promise(resolve => setTimeout(resolve, API_CALL_DELAY - timeSinceLastCall));
    }
    lastApiCall = Date.now();
    
    const tryPiston = async () => {
        // Map Judge0 language IDs to Piston language names
        const pistonLanguageMap = {
            71: 'python',      // Python 3.8.1
            63: 'javascript',  // JavaScript (Node.js)
            62: 'java',        // Java
            54: 'cpp'          // C++
        };
        
        const language = pistonLanguageMap[languageId] || 'python';
        
        // Prepare Piston API request
        const pistonRequest = {
            language: language,
            version: '*', // Use latest version
            files: [
                {
                    name: `main.${language === 'python' ? 'py' : language === 'javascript' ? 'js' : language === 'cpp' ? 'cpp' : 'java'}`,
                    content: code
                }
            ],
            stdin: testCase.input
        };
        
        // Submit to Piston API
        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(pistonRequest)
        });
        
        if (!response.ok) {
            throw new Error(`Piston API error: ${response.status} ${response.statusText}`);
        }
        
        return response;
    };
    
    try {
        const response = await retryWithBackoff(tryPiston, 2, 2000); // Longer delay for Piston
        const result = await response.json();
        
        // Process Piston result
        const output = result.run.stdout || result.run.stderr || '';
        
        // Smart output comparison for Piston
        let passed = false;
        let expected;
        
        try {
            expected = JSON.parse(testCase.output);
            const parsedOutput = JSON.parse(output.trim());
            passed = JSON.stringify(parsedOutput) === JSON.stringify(expected);
        } catch {
            // Fallback to string comparison
            passed = output.trim() === testCase.output.trim();
        }
        
        return {
            passed,
            output: output.trim(),
            expected: testCase.output,
            time: `${result.run.time || 0}ms`,
            memory: 'N/A',
            status: result.run.code === 0 ? (passed ? 'Accepted' : 'Wrong Answer') : 'Runtime Error'
        };
        
    } catch (error) {
        console.error('Piston API failed after retries:', error);
        
        // Ultimate fallback for JavaScript
        if (languageId === 63) {
            return executeJavaScriptLocally(code, testCase);
        }
        
        return {
            passed: false,
            output: `Piston API Error: ${error.message}`,
            expected: testCase.output,
            time: '0ms',
            memory: 'N/A',
            status: 'API Error'
        };
    }
}

// Execute JavaScript code locally (enhanced fallback)
async function executeJavaScriptLocally(code, testCase) {
    try {
        console.log('Local execution - Input:', testCase.input);
        console.log('Local execution - Expected:', testCase.output);
        console.log('Local execution - Code:', code);
        
        // Parse test case input more intelligently
        let inputs = [];
        const inputLines = testCase.input.trim().split('\n');
        
        // Parse each line as a separate parameter
        for (const line of inputLines) {
            try {
                // Try to parse as JSON
                inputs.push(JSON.parse(line));
            } catch {
                // If not JSON, treat as string (remove quotes if present)
                const trimmed = line.trim();
                if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
                    (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
                    inputs.push(trimmed.slice(1, -1));
                } else {
                    inputs.push(trimmed);
                }
            }
        }
        
        console.log('Parsed inputs:', inputs);
        
        // Extract function name from code
        let functionName = null;
        const functionMatch = code.match(/function\s+(\w+)/);
        if (functionMatch) {
            functionName = functionMatch[1];
        }
        
        console.log('Function name:', functionName);
        
        // Create execution context
        let func;
        let output;
        
        if (functionName) {
            // Function declaration - call with parsed parameters
            func = new Function(`
                ${code}
                
                // Call the function with the correct number of parameters
                if (typeof ${functionName} === 'function') {
                    const args = arguments[0];
                    if (Array.isArray(args)) {
                        return ${functionName}.apply(null, args);
                    } else {
                        return ${functionName}(args);
                    }
                } else {
                    throw new Error('Function ${functionName} not found');
                }
            `);
        } else {
            // No function declaration found - try to execute as expression
            func = new Function(`
                ${code}
                
                // Try to find any available function
                const funcNames = ['twoSum', 'reverseString', 'isPalindrome', 'maxSubArray', 'isValid', 
                                 'mergeTwoLists', 'maxProfit', 'climbStairs', 'longestCommonPrefix', 
                                 'search', 'maxArea', 'threeSum', 'removeDuplicates', 'plusOne', 
                                 'rotate', 'singleNumber', 'intersect', 'solution', 'main'];
                
                for (const name of funcNames) {
                    if (typeof eval(name) === 'function') {
                        const args = arguments[0];
                        if (Array.isArray(args)) {
                            return eval(name).apply(null, args);
                        } else {
                            return eval(name)(args);
                        }
                    }
                }
                throw new Error('No executable function found');
            `);
        }
        
        // Execute with timeout protection
        const startTime = Date.now();
        
        // Call function with appropriate parameters
        if (inputs.length === 1) {
            output = func(inputs[0]);
        } else {
            output = func(inputs);
        }
        
        const executionTime = Date.now() - startTime;
        
        console.log('Execution output:', output);
        
        // Parse expected output
        let expected;
        try {
            expected = JSON.parse(testCase.output);
        } catch {
            // Handle string outputs
            const trimmed = testCase.output.trim();
            if ((trimmed.startsWith('"') && trimmed.endsWith('"')) || 
                (trimmed.startsWith("'") && trimmed.endsWith("'"))) {
                expected = trimmed.slice(1, -1);
            } else {
                expected = testCase.output;
            }
        }
        
        console.log('Expected output:', expected);
        
        // Smart comparison
        let passed = false;
        
        // Try different comparison methods
        if (JSON.stringify(output) === JSON.stringify(expected)) {
            passed = true;
        } else if (String(output) === String(expected)) {
            passed = true;
        } else if (Array.isArray(output) && Array.isArray(expected)) {
            // For arrays, try sorting both and comparing (for problems where order doesn't matter)
            const sortedOutput = [...output].sort();
            const sortedExpected = [...expected].sort();
            if (JSON.stringify(sortedOutput) === JSON.stringify(sortedExpected)) {
                passed = true;
            }
        }
        
        console.log('Test passed:', passed);
        
        return {
            passed,
            output: JSON.stringify(output),
            expected: testCase.output,
            time: `${executionTime}ms`,
            memory: 'N/A',
            status: passed ? 'Accepted' : 'Wrong Answer'
        };
    } catch (error) {
        console.error('Local execution error:', error);
        return {
            passed: false,
            output: `Runtime Error: ${error.message}`,
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