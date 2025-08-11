// Node.js script to generate PNG icons using Canvas API
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

function createIcon(size) {
    const canvas = createCanvas(size, size);
    const ctx = canvas.getContext('2d');
    
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, size, size);
    gradient.addColorStop(0, '#3B82F6');
    gradient.addColorStop(1, '#8B5CF6');
    
    // Draw rounded rectangle
    const radius = size * 0.15;
    ctx.beginPath();
    ctx.moveTo(radius, 0);
    ctx.lineTo(size - radius, 0);
    ctx.quadraticCurveTo(size, 0, size, radius);
    ctx.lineTo(size, size - radius);
    ctx.quadraticCurveTo(size, size, size - radius, size);
    ctx.lineTo(radius, size);
    ctx.quadraticCurveTo(0, size, 0, size - radius);
    ctx.lineTo(0, radius);
    ctx.quadraticCurveTo(0, 0, radius, 0);
    ctx.closePath();
    
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Draw text "CD"
    ctx.fillStyle = 'white';
    ctx.font = `bold ${size * 0.35}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('CD', size / 2, size / 2);
    
    return canvas;
}

function generateAllIcons() {
    const sizes = [16, 32, 48, 128];
    const iconsDir = path.join(__dirname, 'assets', 'icons');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(iconsDir)) {
        fs.mkdirSync(iconsDir, { recursive: true });
    }
    
    console.log('Generating Code Drill icons...');
    
    sizes.forEach(size => {
        const canvas = createIcon(size);
        const buffer = canvas.toBuffer('image/png');
        const filename = path.join(iconsDir, `icon-${size}.png`);
        
        fs.writeFileSync(filename, buffer);
        console.log(`✓ Created ${filename} (${size}x${size})`);
    });
    
    console.log('\nAll icons generated successfully!');
    console.log('Icons saved in assets/icons/');
}

// Check if canvas module is installed
try {
    require.resolve('canvas');
    generateAllIcons();
} catch (e) {
    console.log('Canvas module not found. Installing...');
    console.log('Run: npm install canvas');
    console.log('Then run this script again.');
}