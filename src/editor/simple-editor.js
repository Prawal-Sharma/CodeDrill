// Simple CodeMirror Integration for Chrome Extension
// This version works without bundling by loading CodeMirror from CDN

class SimpleCodeEditor {
    constructor(container, language = 'python') {
        this.container = container;
        this.language = language;
        this.editor = null;
        this.initialize();
    }
    
    initialize() {
        // Clear container
        this.container.innerHTML = '';
        
        // Create editor container structure
        const editorContainer = document.createElement('div');
        editorContainer.className = 'code-editor-container';
        
        // Create header with language indicator
        const header = document.createElement('div');
        header.className = 'code-editor-header';
        header.innerHTML = `<span>📝 ${this.language.charAt(0).toUpperCase() + this.language.slice(1)}</span>`;
        
        // Create line numbers container
        const lineNumbers = document.createElement('div');
        lineNumbers.className = 'line-numbers';
        lineNumbers.id = 'line-numbers';
        
        // Create textarea
        const textarea = document.createElement('textarea');
        textarea.className = 'code-textarea';
        textarea.id = 'code-editor-textarea';
        textarea.spellcheck = false;
        textarea.autocomplete = 'off';
        textarea.autocorrect = 'off';
        textarea.autocapitalize = 'off';
        
        // Create syntax overlay
        const syntaxOverlay = document.createElement('div');
        syntaxOverlay.className = 'syntax-overlay';
        syntaxOverlay.id = 'syntax-overlay';
        
        // Assemble editor
        editorContainer.appendChild(header);
        editorContainer.appendChild(lineNumbers);
        editorContainer.appendChild(syntaxOverlay);
        editorContainer.appendChild(textarea);
        
        this.container.appendChild(editorContainer);
        
        // Store references
        this.editor = textarea;
        this.lineNumbers = lineNumbers;
        this.syntaxOverlay = syntaxOverlay;
        
        // Apply styles
        this.applyStyles();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Set initial template (after editor reference is set)
        this.setTemplate();
        
        // Initial update
        this.updateLineNumbers();
        this.updateSyntaxHighlighting();
    }
    
    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            /* Enhanced Code Editor Container */
            .code-editor-container {
                position: relative;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                background-color: #ffffff;
                overflow: hidden;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }
            
            /* Editor Header */
            .code-editor-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 8px 12px;
                font-size: 12px;
                font-weight: 600;
                border-bottom: 1px solid #e5e7eb;
                display: flex;
                align-items: center;
                gap: 8px;
            }
            
            /* Line Numbers */
            .line-numbers {
                position: absolute;
                left: 0;
                top: 47px; /* Account for header height */
                width: 40px;
                height: 180px;
                background-color: #f8fafc;
                border-right: 1px solid #e2e8f0;
                font-family: 'Courier New', Courier, monospace;
                font-size: 12px;
                line-height: 1.5;
                color: #64748b;
                padding: 10px 8px;
                text-align: right;
                white-space: pre;
                overflow: hidden;
                z-index: 1;
                box-sizing: border-box;
            }
            
            /* Syntax Overlay */
            .syntax-overlay {
                position: absolute;
                left: 40px;
                top: 47px; /* Account for header height */
                right: 0;
                height: 180px;
                font-family: 'Courier New', Courier, monospace;
                font-size: 13px;
                line-height: 1.5;
                padding: 10px;
                white-space: pre-wrap;
                word-wrap: break-word;
                pointer-events: none;
                overflow: hidden;
                z-index: 2;
                box-sizing: border-box;
            }
            
            /* Code Textarea */
            .code-textarea {
                position: relative;
                width: 100%;
                height: 180px;
                font-family: 'Courier New', Courier, monospace;
                font-size: 13px;
                padding: 10px;
                padding-left: 50px; /* Account for line numbers */
                margin-top: 47px; /* Account for header height */
                border: none;
                background-color: transparent;
                color: transparent; /* Hide text, let overlay show syntax highlighting */
                caret-color: #1f2937; /* Show cursor */
                resize: none;
                outline: none;
                line-height: 1.5;
                tab-size: 4;
                z-index: 3;
                box-sizing: border-box;
            }
            
            .code-textarea:focus {
                caret-color: #3b82f6;
            }
            
            .code-textarea.dark-mode {
                caret-color: #f1f5f9;
            }
            
            .code-textarea.dark-mode:focus {
                caret-color: #3b82f6;
            }
            
            /* Dark mode for container */
            .code-editor-container.dark-mode {
                background-color: #1e293b;
                border-color: #475569;
            }
            
            .code-editor-container.dark-mode .line-numbers {
                background-color: #0f172a;
                border-right-color: #334155;
                color: #64748b;
            }
            
            /* Syntax highlighting styles */
            .syntax-keyword {
                color: #7c3aed;
                font-weight: 600;
            }
            
            .syntax-string {
                color: #059669;
            }
            
            .syntax-comment {
                color: #6b7280;
                font-style: italic;
            }
            
            .syntax-function {
                color: #2563eb;
                font-weight: 500;
            }
            
            .syntax-number {
                color: #dc2626;
                font-weight: 500;
            }
            
            .syntax-operator {
                color: #7c2d12;
                font-weight: 500;
            }
            
            .syntax-bracket {
                color: #1f2937;
                font-weight: 600;
            }
            
            /* Dark mode syntax highlighting */
            .code-editor-container.dark-mode .syntax-keyword {
                color: #a78bfa;
            }
            
            .code-editor-container.dark-mode .syntax-string {
                color: #34d399;
            }
            
            .code-editor-container.dark-mode .syntax-comment {
                color: #9ca3af;
            }
            
            .code-editor-container.dark-mode .syntax-function {
                color: #60a5fa;
            }
            
            .code-editor-container.dark-mode .syntax-number {
                color: #f87171;
            }
            
            .code-editor-container.dark-mode .syntax-operator {
                color: #fbbf24;
            }
            
            .code-editor-container.dark-mode .syntax-bracket {
                color: #f1f5f9;
            }
        `;
        
        if (!document.getElementById('editor-styles')) {
            style.id = 'editor-styles';
            document.head.appendChild(style);
        }
    }
    
    setTemplate() {
        const templates = {
            python: `def solution(nums, target):
    # Your code here
    pass`,
            javascript: `function solution(nums, target) {
    // Your code here
    
}`
        };
        
        this.editor.value = templates[this.language] || templates.python;
    }
    
    updateTemplate(problemTitle, language) {
        this.language = language;
        const templates = this.getProblemTemplate(problemTitle, language);
        this.editor.value = templates;
        
        // Update language indicator in header
        const header = this.container.querySelector('.code-editor-header');
        if (header) {
            header.innerHTML = `<span>📝 ${this.language.charAt(0).toUpperCase() + this.language.slice(1)}</span>`;
        }
        
        // Refresh syntax highlighting with new language
        this.updateLineNumbers();
        this.updateSyntaxHighlighting();
    }
    
    getProblemTemplate(problemTitle, language) {
        const functionMap = {
            'Two Sum': { name: 'twoSum', params: 'nums, target' },
            'Reverse String': { name: 'reverseString', params: 's' },
            'Valid Palindrome': { name: 'isPalindrome', params: 's' },
            'Maximum Subarray': { name: 'maxSubArray', params: 'nums' },
            'Valid Parentheses': { name: 'isValid', params: 's' },
            'Merge Two Sorted Lists': { name: 'mergeTwoLists', params: 'list1, list2' },
            'Best Time to Buy and Sell Stock': { name: 'maxProfit', params: 'prices' },
            'Climbing Stairs': { name: 'climbStairs', params: 'n' },
            'Longest Common Prefix': { name: 'longestCommonPrefix', params: 'strs' },
            'Binary Search': { name: 'search', params: 'nums, target' },
            'Container With Most Water': { name: 'maxArea', params: 'height' },
            '3Sum': { name: 'threeSum', params: 'nums' },
            'Remove Duplicates from Sorted Array': { name: 'removeDuplicates', params: 'nums' },
            'Plus One': { name: 'plusOne', params: 'digits' },
            'Rotate Array': { name: 'rotate', params: 'nums, k' },
            'Single Number': { name: 'singleNumber', params: 'nums' },
            'Intersection of Two Arrays II': { name: 'intersect', params: 'nums1, nums2' },
            'Valid Anagram': { name: 'isAnagram', params: 's, t' },
            'Group Anagrams': { name: 'groupAnagrams', params: 'strs' },
            'Contains Duplicate': { name: 'containsDuplicate', params: 'nums' },
            'Product of Array Except Self': { name: 'productExceptSelf', params: 'nums' },
            'Maximum Depth of Binary Tree': { name: 'maxDepth', params: 'root' },
            'Same Tree': { name: 'isSameTree', params: 'p, q' },
            'Invert Binary Tree': { name: 'invertTree', params: 'root' },
            'House Robber': { name: 'rob', params: 'nums' },
            'Coin Change': { name: 'coinChange', params: 'coins, amount' },
            'Number of Islands': { name: 'numIslands', params: 'grid' }
        };
        
        const func = functionMap[problemTitle] || { name: 'solution', params: 'input' };
        
        if (language === 'python') {
            return `def ${func.name}(${func.params}):
    # Your code here
    pass`;
        } else if (language === 'javascript') {
            return `function ${func.name}(${func.params}) {
    // Your code here
    
}`;
        }
        
        return '';
    }
    
    setupEventListeners() {
        // Update line numbers and syntax highlighting on input
        this.editor.addEventListener('input', () => {
            this.updateLineNumbers();
            this.updateSyntaxHighlighting();
        });
        
        // Handle scroll synchronization
        this.editor.addEventListener('scroll', () => {
            if (this.lineNumbers) {
                this.lineNumbers.scrollTop = this.editor.scrollTop;
            }
            if (this.syntaxOverlay) {
                this.syntaxOverlay.scrollTop = this.editor.scrollTop;
            }
        });
        
        // Handle tab key for proper indentation
        this.editor.addEventListener('keydown', (e) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.editor.selectionStart;
                const end = this.editor.selectionEnd;
                const value = this.editor.value;
                
                // Insert 4 spaces instead of tab
                this.editor.value = value.substring(0, start) + '    ' + value.substring(end);
                this.editor.selectionStart = this.editor.selectionEnd = start + 4;
                
                // Trigger input event to update highlighting
                this.updateLineNumbers();
                this.updateSyntaxHighlighting();
            }
        });
    }
    
    updateLineNumbers() {
        if (!this.lineNumbers) return;
        
        const lines = this.editor.value.split('\n');
        let lineNumbersContent = '';
        
        for (let i = 1; i <= lines.length; i++) {
            lineNumbersContent += i + '\n';
        }
        
        this.lineNumbers.textContent = lineNumbersContent;
    }
    
    updateSyntaxHighlighting() {
        if (!this.syntaxOverlay) return;
        
        const code = this.editor.value;
        const highlightedCode = this.applySyntaxHighlighting(code);
        this.syntaxOverlay.innerHTML = highlightedCode;
    }
    
    applySyntaxHighlighting(code) {
        if (this.language === 'python') {
            return this.highlightPython(code);
        } else if (this.language === 'javascript') {
            return this.highlightJavaScript(code);
        }
        return this.escapeHtml(code);
    }
    
    highlightPython(code) {
        // Python keywords
        const keywords = ['def', 'class', 'if', 'elif', 'else', 'for', 'while', 'in', 'not', 'and', 'or', 
                         'import', 'from', 'as', 'return', 'pass', 'break', 'continue', 'try', 'except', 
                         'finally', 'with', 'lambda', 'global', 'nonlocal', 'True', 'False', 'None'];
        
        const functions = ['print', 'len', 'range', 'enumerate', 'zip', 'map', 'filter', 'sorted', 'max', 'min', 'sum'];
        
        let highlighted = this.escapeHtml(code);
        
        // Highlight strings
        highlighted = highlighted.replace(/(["'])(?:(?=(\\?))\2.)*?\1/g, '<span class="syntax-string">$&</span>');
        
        // Highlight comments
        highlighted = highlighted.replace(/#.*/g, '<span class="syntax-comment">$&</span>');
        
        // Highlight numbers
        highlighted = highlighted.replace(/\b\d+\.?\d*\b/g, '<span class="syntax-number">$&</span>');
        
        // Highlight keywords
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="syntax-keyword">${keyword}</span>`);
        });
        
        // Highlight built-in functions
        functions.forEach(func => {
            const regex = new RegExp(`\\b${func}\\b(?=\\()`, 'g');
            highlighted = highlighted.replace(regex, `<span class="syntax-function">${func}</span>`);
        });
        
        // Highlight operators
        highlighted = highlighted.replace(/[+\-*/=<>!&|^~%]/g, '<span class="syntax-operator">$&</span>');
        
        // Highlight brackets
        highlighted = highlighted.replace(/[()[\]{}]/g, '<span class="syntax-bracket">$&</span>');
        
        return highlighted;
    }
    
    highlightJavaScript(code) {
        // JavaScript keywords
        const keywords = ['function', 'var', 'let', 'const', 'if', 'else', 'for', 'while', 'do', 'switch', 
                         'case', 'default', 'break', 'continue', 'return', 'try', 'catch', 'finally', 
                         'throw', 'new', 'this', 'typeof', 'instanceof', 'true', 'false', 'null', 'undefined'];
        
        const functions = ['console', 'Math', 'Array', 'Object', 'String', 'Number', 'Boolean', 'Date'];
        
        let highlighted = this.escapeHtml(code);
        
        // Highlight strings
        highlighted = highlighted.replace(/(["'`])(?:(?=(\\?))\2.)*?\1/g, '<span class="syntax-string">$&</span>');
        
        // Highlight comments
        highlighted = highlighted.replace(/\/\/.*|\/\*[\s\S]*?\*\//g, '<span class="syntax-comment">$&</span>');
        
        // Highlight numbers
        highlighted = highlighted.replace(/\b\d+\.?\d*\b/g, '<span class="syntax-number">$&</span>');
        
        // Highlight keywords
        keywords.forEach(keyword => {
            const regex = new RegExp(`\\b${keyword}\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="syntax-keyword">${keyword}</span>`);
        });
        
        // Highlight built-in objects/functions
        functions.forEach(func => {
            const regex = new RegExp(`\\b${func}\\b`, 'g');
            highlighted = highlighted.replace(regex, `<span class="syntax-function">${func}</span>`);
        });
        
        // Highlight operators
        highlighted = highlighted.replace(/[+\-*/=<>!&|^~%]/g, '<span class="syntax-operator">$&</span>');
        
        // Highlight brackets
        highlighted = highlighted.replace(/[()[\]{}]/g, '<span class="syntax-bracket">$&</span>');
        
        return highlighted;
    }
    
    escapeHtml(text) {
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }
    
    getValue() {
        return this.editor.value;
    }
    
    setValue(content) {
        this.editor.value = content;
    }
    
    clear() {
        this.editor.value = '';
    }
    
    focus() {
        this.editor.focus();
    }
    
    setDarkMode(enabled) {
        const container = this.container.querySelector('.code-editor-container');
        if (enabled) {
            this.editor.classList.add('dark-mode');
            if (container) container.classList.add('dark-mode');
        } else {
            this.editor.classList.remove('dark-mode');
            if (container) container.classList.remove('dark-mode');
        }
    }
    
    // Add basic keyboard shortcuts
    setupKeyboardShortcuts() {
        this.editor.addEventListener('keydown', (e) => {
            // Tab key for indentation
            if (e.key === 'Tab') {
                e.preventDefault();
                const start = this.editor.selectionStart;
                const end = this.editor.selectionEnd;
                const value = this.editor.value;
                
                // Insert 4 spaces for tab
                this.editor.value = value.substring(0, start) + '    ' + value.substring(end);
                this.editor.selectionStart = this.editor.selectionEnd = start + 4;
            }
            
            // Auto-closing brackets
            const pairs = {
                '(': ')',
                '[': ']',
                '{': '}',
                '"': '"',
                "'": "'"
            };
            
            if (pairs[e.key]) {
                e.preventDefault();
                const start = this.editor.selectionStart;
                const end = this.editor.selectionEnd;
                const value = this.editor.value;
                
                this.editor.value = value.substring(0, start) + e.key + pairs[e.key] + value.substring(end);
                this.editor.selectionStart = this.editor.selectionEnd = start + 1;
            }
        });
    }
}

// Export for use in popup.js
if (typeof window !== 'undefined') {
    window.SimpleCodeEditor = SimpleCodeEditor;
}