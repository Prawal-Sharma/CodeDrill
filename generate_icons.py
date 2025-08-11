#!/usr/bin/env python3
"""
Generate PNG icons for Code Drill Chrome Extension
Creates icons in sizes: 16x16, 32x32, 48x48, 128x128
"""

from PIL import Image, ImageDraw, ImageFont
import os

def create_icon(size):
    """Create a single icon with the specified size."""
    # Create a new image with transparent background
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Define colors (gradient effect simulated with solid color)
    primary_color = (59, 130, 246)  # Blue
    secondary_color = (139, 92, 246)  # Purple
    
    # Calculate corner radius
    corner_radius = int(size * 0.15)
    
    # Draw rounded rectangle background
    # For simplicity, we'll draw a regular rectangle with rounded corners
    draw.rounded_rectangle(
        [(0, 0), (size, size)],
        radius=corner_radius,
        fill=primary_color
    )
    
    # Add gradient effect by overlaying a semi-transparent gradient
    for i in range(size):
        alpha = int(128 * (i / size))  # Gradient from 0 to 128
        color = (*secondary_color, alpha)
        draw.line([(i, 0), (i, size)], fill=color, width=1)
    
    # Draw "CD" text
    try:
        # Try to use a bold font
        font_size = int(size * 0.35)
        # Use default font since we may not have specific fonts installed
        font = ImageFont.load_default()
        
        # For better appearance, we'll manually scale the text
        text = "CD"
        
        # Get text size
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]
        
        # Calculate position to center text
        x = (size - text_width) // 2
        y = (size - text_height) // 2
        
        # Draw white text
        draw.text((x, y), text, fill=(255, 255, 255, 255), font=font)
        
    except:
        # Fallback: Draw simple "CD" using lines
        # Draw "C"
        c_x = size // 4
        c_y = size // 3
        c_size = size // 4
        draw.arc([(c_x, c_y), (c_x + c_size, c_y + c_size)], 
                 30, 330, fill=(255, 255, 255), width=max(1, size // 16))
        
        # Draw "D"
        d_x = size // 2
        d_y = size // 3
        d_width = size // 4
        d_height = size // 3
        draw.line([(d_x, d_y), (d_x, d_y + d_height)], 
                  fill=(255, 255, 255), width=max(1, size // 16))
        draw.arc([(d_x, d_y), (d_x + d_width, d_y + d_height)], 
                 270, 90, fill=(255, 255, 255), width=max(1, size // 16))
    
    return img

def main():
    """Generate all icon sizes."""
    sizes = [16, 32, 48, 128]
    icons_dir = 'assets/icons'
    
    # Create icons directory if it doesn't exist
    os.makedirs(icons_dir, exist_ok=True)
    
    print("Generating Code Drill icons...")
    
    for size in sizes:
        icon = create_icon(size)
        filename = f'{icons_dir}/icon-{size}.png'
        icon.save(filename, 'PNG')
        print(f"✓ Created {filename} ({size}x{size})")
    
    # Also save the placeholder SVG backup
    print("\nAll icons generated successfully!")
    print("Icons saved in assets/icons/")

if __name__ == '__main__':
    main()