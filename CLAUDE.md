# Code Drill - Chrome Extension Context

## Project Overview
Code Drill is a Chrome extension that allows users to practice LeetCode-style coding problems directly in their browser. Users can get random problems, solve them in a built-in code editor, run test cases, and track their progress.

## Architecture

### Tech Stack
- **Manifest Version:** V3 (required for Chrome Web Store)
- **Code Editor:** CodeMirror 6 (lightweight, performant)
- **Code Execution:** Judge0 API (primary), Piston API (fallback)
- **Styling:** Tailwind CSS
- **Storage:** Chrome Storage API + IndexedDB
- **Build Tool:** Webpack/Vite (to be configured)

### Directory Structure
```
CodeDrill/
├── manifest.json          # Chrome extension manifest (V3)
├── src/
│   ├── popup/            # Extension popup UI
│   │   ├── popup.html    # Main popup interface
│   │   ├── popup.js      # Popup logic
│   │   └── popup.css     # Popup styles
│   ├── background/       # Background service worker
│   │   └── service-worker.js
│   ├── editor/           # Code editor integration
│   │   └── editor.js     # CodeMirror setup
│   ├── problems/         # Problem database
│   │   └── problems.json # Local problem storage
│   └── utils/            # Utility functions
│       ├── api.js        # API integrations (Judge0, Piston)
│       └── storage.js    # Chrome storage helpers
├── assets/
│   └── icons/           # Extension icons
└── lib/                 # Third-party libraries
    └── codemirror/      # CodeMirror library files
```

## Core Features

### 1. Problem Management
- Random problem selection with difficulty filters (Easy/Medium/Hard)
- Tag-based filtering (Array, String, DP, Tree, etc.)
- Local problem database with option to fetch from APIs
- Problem schema: title, description, examples, constraints, test cases, hints, solutions

### 2. Code Editor
- CodeMirror 6 integration
- Syntax highlighting for Python and JavaScript
- Theme switching (light/dark)
- Auto-indentation and code formatting
- Boilerplate code templates

### 3. Code Execution
- Judge0 API integration (20K free submissions)
- Piston API as fallback
- Local JavaScript execution using Web Workers
- Test case validation with detailed output

### 4. Progress Tracking
- Problems solved count
- Success rate by difficulty
- Streak tracking
- Time spent per problem
- Local data persistence using Chrome Storage API

### 5. User Experience
- 400x600px popup interface
- Hint system with progressive revelation
- Solution viewer with explanations
- Daily coding challenge
- Keyboard shortcuts

## API Integrations

### Judge0 API
- Endpoint: https://ce.judge0.com
- Free tier: 20K submissions
- Supports 60+ languages
- Returns runtime, memory usage, and detailed output

### Piston API (Fallback)
- Endpoint: https://emkc.org/api/v2/piston
- Rate limit: 5 requests/second
- Alternative execution engine

## Development Workflow

### Testing the Extension
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode"
3. Click "Load unpacked" and select the CodeDrill directory
4. The extension icon should appear in the toolbar

### Running Tests
```bash
npm test           # Run all tests
npm run lint       # Check code style
npm run build      # Build for production
```

### Committing Changes
- Follow conventional commit format
- Test all changes locally before committing
- Update this document as features are added

## Current Status (December 2024)

### ✅ Major Improvements Completed
- **Reliable Code Execution System**: Fixed Judge0 API authentication, added Piston API fallback, enhanced local JavaScript execution
- **Smart Multi-Parameter Support**: Fixed parsing of complex inputs like `[1,2,4]\n[1,3,4]` for functions with multiple parameters  
- **Enhanced Error Handling**: Implemented rate limiting, exponential backoff retry logic, comprehensive error recovery
- **Professional UI/UX**: Responsive design (320-450px), loading animations, debounced interactions, visual feedback
- **17 Curated Problems**: All problems have proper function templates matching their requirements
- **Robust Fallback Chain**: Judge0 → Piston API → Local JavaScript execution with detailed logging

### ✅ Technical Achievements  
- Resolved API authentication (401) and rate limiting (429) errors
- Enhanced function detection and invocation in local execution
- Smart output comparison with multiple comparison methods
- Comprehensive input validation and sanitization
- Better results display with success celebrations

### 🚧 Next Phase: Content Expansion & Advanced Features
- Expand problem database to 35+ problems  
- Implement professional syntax highlighting
- Add dark mode toggle
- Create problem search and filtering
- Enhanced progress analytics

### 📋 Architecture Notes
- Chrome Extension Manifest V3 with proper service worker
- Multi-API execution system with intelligent fallbacks
- Local storage for user data and progress tracking
- Custom SimpleCodeEditor with language-specific templates
- Tailwind CSS with custom animations and responsive design

## Important Notes

### Chrome Extension Requirements
- Manifest V3 is mandatory (V2 deprecated)
- Remote code execution is prohibited
- All JavaScript must be bundled with the extension
- Content Security Policy restrictions apply

### Performance Considerations
- Keep bundle size under 5MB
- Lazy load features when possible
- Use Chrome Storage API efficiently
- Implement caching for API responses

### Security
- Never store API keys in plain text
- Validate all user input
- Sanitize code before execution
- Use HTTPS for all external requests

## Manual Setup Required

### For Development
1. Enable Chrome Developer Mode
2. Load unpacked extension from project directory

### For Production (Optional)
1. Chrome Web Store Developer Account ($5 one-time fee)
2. Judge0 API key for higher rate limits
3. GitHub authentication for repository access

## Future Enhancements
- LeetCode account integration
- Export solutions to GitHub Gist
- Competition mode with timer
- More language support
- Offline mode with cached problems
- Code templates library

## Resources
- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [CodeMirror Documentation](https://codemirror.net/docs/)
- [Judge0 API Docs](https://ce.judge0.com/)
- [Tailwind CSS](https://tailwindcss.com/)

---
Last Updated: January 2025