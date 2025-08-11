# Chrome Web Store Assets Guide

This document outlines the required assets for publishing Code Drill to the Chrome Web Store.

## Required Images

### Extension Icons (Already Created ✅)
- **16x16**: `assets/icons/icon-16.png` - Extension toolbar icon
- **32x32**: `assets/icons/icon-32.png` - Extension management page
- **48x48**: `assets/icons/icon-48.png` - Extension detail page
- **128x128**: `assets/icons/icon-128.png` - Chrome Web Store listing

### Promotional Images (Need to Create)

#### 1. Promotional Tile (Required)
- **Size**: 440 x 280 pixels
- **Format**: PNG or JPEG
- **Purpose**: Main promotional image in store listings
- **Recommended content**: App logo, key features, attractive design

#### 2. Marquee Promotional Tile (Optional but Recommended)
- **Size**: 1400 x 560 pixels  
- **Format**: PNG or JPEG
- **Purpose**: Featured placements and promotions
- **Recommended content**: Hero image with app branding

#### 3. Screenshots (Required - minimum 1, maximum 5)
- **Size**: 1280 x 800 or 640 x 400 pixels
- **Format**: PNG or JPEG
- **Purpose**: Show app functionality to users

### Screenshot Content Recommendations

#### Screenshot 1: Welcome Screen
- Show the main interface with problem selection
- Highlight the search and filter functionality
- Include the dark mode toggle

#### Screenshot 2: Code Editor in Action
- Display a problem being solved
- Show syntax highlighting and line numbers
- Include test cases and problem description

#### Screenshot 3: Dark Mode
- Same as Screenshot 2 but in dark mode
- Highlight the professional dark theme

#### Screenshot 4: Problem Browser
- Show the problem browser with filtering
- Display multiple problem cards
- Highlight the organization and search features

#### Screenshot 5: Results and Progress
- Show successful test execution
- Display progress statistics
- Include streak and achievement information

## Store Listing Content

### Short Description (132 characters max)
"Practice coding interview problems with built-in editor, syntax highlighting, and progress tracking. LeetCode-style challenges!"

### Detailed Description (16,000 characters max)
See the detailed description in `PUBLISHING-GUIDE.md`

### Category
**Productivity** or **Developer Tools**

### Keywords/Tags
- coding
- interview
- practice
- leetcode
- algorithms
- programming
- development
- editor
- dark-mode

## How to Take Screenshots

### Method 1: Direct Chrome Extension Screenshots
1. Load the extension in Chrome
2. Open the popup by clicking the extension icon
3. Use Chrome's screenshot tools or system screenshot tools
4. Crop to the recommended dimensions

### Method 2: Browser Developer Tools
1. Open Chrome Developer Tools (F12)
2. Set device dimensions to match screenshot requirements
3. Navigate through the extension features
4. Take screenshots of each state

### Method 3: Design Tools
1. Create mockups using tools like Figma, Canva, or Photoshop
2. Ensure screenshots accurately represent the actual functionality
3. Maintain consistent styling with the actual extension

## Asset Checklist

- [ ] Promotional Tile (440 x 280)
- [ ] Marquee Promotional Tile (1400 x 560) - Optional
- [ ] Screenshot 1: Welcome Screen (1280 x 800)
- [ ] Screenshot 2: Code Editor Light Mode (1280 x 800)  
- [ ] Screenshot 3: Code Editor Dark Mode (1280 x 800)
- [ ] Screenshot 4: Problem Browser (1280 x 800)
- [ ] Screenshot 5: Results & Progress (1280 x 800)
- [x] Extension Icons (16, 32, 48, 128)
- [ ] Store description copy
- [ ] Privacy policy link verification

## Image Quality Guidelines

### Technical Requirements
- High resolution and crisp quality
- Minimal compression artifacts
- Consistent color scheme
- Professional appearance

### Content Guidelines
- Show actual extension functionality
- Avoid placeholder or fake content
- Include realistic user scenarios
- Highlight unique features and benefits

### Branding Guidelines
- Consistent with extension design
- Professional and trustworthy appearance
- Clear value proposition
- Appealing to target developer audience

## Notes

- All images should be created from actual extension screenshots when possible
- Ensure screenshots represent the current version's functionality
- Images will be reviewed by Google as part of the approval process
- Consider creating multiple versions for A/B testing (if doing gradual rollout)

## Tools for Creating Assets

### Free Options
- **GIMP**: Full-featured image editor
- **Canva**: User-friendly design tool with templates
- **Figma**: Professional design tool with Chrome extension templates
- **Chrome DevTools**: Built-in screenshot capabilities

### Paid Options  
- **Adobe Photoshop**: Professional image editing
- **Sketch**: Mac-only design tool
- **Adobe Illustrator**: Vector graphics for icons

## Asset Storage

Store all created assets in:
```
assets/
├── chrome-store/
│   ├── promotional-tile-440x280.png
│   ├── marquee-tile-1400x560.png
│   ├── screenshot-1-welcome.png
│   ├── screenshot-2-editor-light.png
│   ├── screenshot-3-editor-dark.png
│   ├── screenshot-4-browser.png
│   └── screenshot-5-results.png
└── icons/ (existing)
    ├── icon-16.png
    ├── icon-32.png  
    ├── icon-48.png
    └── icon-128.png
```