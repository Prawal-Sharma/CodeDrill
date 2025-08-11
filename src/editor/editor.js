// CodeMirror Editor Setup
import { EditorView, basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';

// Editor configuration
const editorConfig = {
    python: {
        template: `def twoSum(nums, target):
    # Your code here
    pass`,
        language: python()
    },
    javascript: {
        template: `function twoSum(nums, target) {
    // Your code here
    
}`,
        language: javascript()
    }
};

// Create and initialize CodeMirror editor
export function initializeEditor(container, language = 'python') {
    const config = editorConfig[language];
    
    const state = EditorState.create({
        doc: config.template,
        extensions: [
            basicSetup,
            config.language,
            EditorView.theme({
                "&": {
                    height: "200px",
                    fontSize: "14px"
                },
                ".cm-content": {
                    padding: "10px",
                    fontFamily: "'Courier New', Courier, monospace"
                },
                ".cm-focused": {
                    outline: "2px solid #3b82f6"
                },
                ".cm-editor": {
                    borderRadius: "4px",
                    border: "1px solid #e5e7eb"
                },
                ".cm-editor.cm-focused": {
                    borderColor: "#3b82f6"
                }
            }),
            EditorView.lineWrapping
        ]
    });
    
    const view = new EditorView({
        state,
        parent: container
    });
    
    return view;
}

// Update editor content
export function updateEditorContent(view, content) {
    view.dispatch({
        changes: {
            from: 0,
            to: view.state.doc.length,
            insert: content
        }
    });
}

// Get editor content
export function getEditorContent(view) {
    return view.state.doc.toString();
}

// Change editor language
export function changeEditorLanguage(view, language) {
    const config = editorConfig[language];
    
    // Update the language extension
    view.dispatch({
        effects: EditorState.reconfigure.of([
            basicSetup,
            config.language,
            view.state.facet(EditorView.theme)
        ])
    });
    
    // Update content with new template
    updateEditorContent(view, config.template);
}

// Apply dark theme
export function applyDarkTheme(view) {
    view.dispatch({
        effects: EditorState.reconfigure.of([
            basicSetup,
            view.state.facet(EditorView.editorAttributes),
            oneDark
        ])
    });
}

// Get problem-specific template
export function getProblemTemplate(problemTitle, language) {
    // Map problem titles to function names
    const functionMap = {
        'Two Sum': 'twoSum',
        'Reverse String': 'reverseString',
        'Valid Palindrome': 'isPalindrome',
        'Maximum Subarray': 'maxSubArray',
        'Valid Parentheses': 'isValid',
        'Merge Two Sorted Lists': 'mergeTwoLists',
        'Best Time to Buy and Sell Stock': 'maxProfit',
        'Climbing Stairs': 'climbStairs',
        'Longest Common Prefix': 'longestCommonPrefix',
        'Binary Search': 'search',
        'Container With Most Water': 'maxArea',
        '3Sum': 'threeSum'
    };
    
    const functionName = functionMap[problemTitle] || 'solution';
    
    if (language === 'python') {
        return `def ${functionName}(${getParametersPython(problemTitle)}):
    # Your code here
    pass`;
    } else if (language === 'javascript') {
        return `function ${functionName}(${getParametersJS(problemTitle)}) {
    // Your code here
    
}`;
    }
    
    return '';
}

// Get parameters for Python
function getParametersPython(problemTitle) {
    const params = {
        'Two Sum': 'nums, target',
        'Reverse String': 's',
        'Valid Palindrome': 's',
        'Maximum Subarray': 'nums',
        'Valid Parentheses': 's',
        'Merge Two Sorted Lists': 'list1, list2',
        'Best Time to Buy and Sell Stock': 'prices',
        'Climbing Stairs': 'n',
        'Longest Common Prefix': 'strs',
        'Binary Search': 'nums, target',
        'Container With Most Water': 'height',
        '3Sum': 'nums'
    };
    
    return params[problemTitle] || 'input';
}

// Get parameters for JavaScript
function getParametersJS(problemTitle) {
    // Same as Python for now
    return getParametersPython(problemTitle);
}