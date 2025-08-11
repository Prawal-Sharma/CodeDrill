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
        
        // Create textarea
        const textarea = document.createElement('textarea');
        textarea.className = 'code-textarea';
        textarea.id = 'code-editor-textarea';
        this.container.appendChild(textarea);
        
        // Apply styles
        this.applyStyles();
        
        // Set initial template
        this.setTemplate();
        
        // Store reference
        this.editor = textarea;
    }
    
    applyStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .code-textarea {
                width: 100%;
                height: 180px;
                font-family: 'Courier New', Courier, monospace;
                font-size: 13px;
                padding: 10px;
                border: 1px solid #e5e7eb;
                border-radius: 4px;
                background-color: #f9fafb;
                color: #1f2937;
                resize: vertical;
                outline: none;
                line-height: 1.5;
                tab-size: 4;
            }
            
            .code-textarea:focus {
                border-color: #3b82f6;
                background-color: white;
                box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
            }
            
            .code-textarea.dark-mode {
                background-color: #1e293b;
                color: #f1f5f9;
                border-color: #475569;
            }
            
            .code-textarea.dark-mode:focus {
                background-color: #0f172a;
                border-color: #3b82f6;
            }
            
            /* Syntax highlighting simulation */
            .code-line {
                display: block;
                padding: 2px 0;
            }
            
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
            '3Sum': { name: 'threeSum', params: 'nums' }
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
        if (enabled) {
            this.editor.classList.add('dark-mode');
        } else {
            this.editor.classList.remove('dark-mode');
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