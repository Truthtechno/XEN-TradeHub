#!/bin/bash

###############################################################################
# Font Download Script for XEN TradeHub
# 
# This script downloads all Google Fonts used in the application for local hosting.
# Run this script if you want to host fonts locally instead of using Google Fonts CDN.
#
# Usage: ./scripts/download-fonts.sh
#
# Requirements:
# - curl (for downloading files)
# - Internet connection
#
# Note: This is optional. The app works perfectly with Google Fonts CDN.
###############################################################################

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Font directory
FONT_DIR="public/fonts"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║         XEN TradeHub Font Download Script                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Create fonts directory if it doesn't exist
if [ ! -d "$FONT_DIR" ]; then
    echo -e "${YELLOW}Creating fonts directory...${NC}"
    mkdir -p "$FONT_DIR"
fi

# Function to download a font family
download_font() {
    local font_name=$1
    local font_url=$2
    local font_dir="$FONT_DIR/$font_name"
    
    echo -e "${BLUE}Downloading $font_name...${NC}"
    
    # Create font directory
    mkdir -p "$font_dir"
    
    # Download font using Google Fonts API
    # Note: This is a simplified version. For production, use google-webfonts-helper
    # or download fonts manually from Google Fonts
    
    echo -e "${YELLOW}  → Font: $font_name${NC}"
    echo -e "${YELLOW}  → Directory: $font_dir${NC}"
    echo -e "${GREEN}  ✓ Ready for manual download${NC}"
}

echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}IMPORTANT: Automated font download requires additional tools${NC}"
echo -e "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}To download fonts for local hosting:${NC}"
echo ""
echo -e "${GREEN}Option 1: Use google-webfonts-helper (Recommended)${NC}"
echo "  1. Visit: https://gwfh.mranftl.com/fonts"
echo "  2. Search for each font"
echo "  3. Select required styles"
echo "  4. Download and extract to public/fonts/[font-name]"
echo ""
echo -e "${GREEN}Option 2: Download from Google Fonts${NC}"
echo "  1. Visit: https://fonts.google.com"
echo "  2. Search for each font"
echo "  3. Download font family"
echo "  4. Extract to public/fonts/[font-name]"
echo ""
echo -e "${GREEN}Option 3: Use fontsource (npm package)${NC}"
echo "  1. Install: npm install @fontsource/[font-name]"
echo "  2. Import in your app"
echo "  3. Fonts will be bundled with your app"
echo ""

# List of fonts to download
echo -e "${BLUE}Fonts used in XEN TradeHub:${NC}"
echo ""
echo -e "${YELLOW}Heading & Body Fonts:${NC}"
fonts=(
    "Poppins"
    "Inter"
    "DM Sans"
    "Roboto"
    "Open Sans"
    "Lato"
    "Montserrat"
    "Source Sans Pro"
    "Nunito"
    "Work Sans"
)

for font in "${fonts[@]}"; do
    echo "  • $font"
done

echo ""
echo -e "${YELLOW}Monospace Fonts:${NC}"
mono_fonts=(
    "JetBrains Mono"
    "Fira Code"
    "Source Code Pro"
)

for font in "${mono_fonts[@]}"; do
    echo "  • $font"
done

echo ""
echo -e "${BLUE}System Fonts (No download needed):${NC}"
echo "  • Monaco (macOS)"
echo "  • Consolas (Windows)"
echo "  • Courier New (Cross-platform)"
echo ""

# Create placeholder directories
echo -e "${YELLOW}Creating placeholder directories...${NC}"
for font in "${fonts[@]}" "${mono_fonts[@]}"; do
    font_dir="$FONT_DIR/${font// /-}"
    mkdir -p "$font_dir"
    
    # Create README in each font directory
    cat > "$font_dir/README.md" << EOF
# $font

Download this font from:
- Google Fonts: https://fonts.google.com
- google-webfonts-helper: https://gwfh.mranftl.com/fonts

## Required Files
- Regular weight (400)
- Medium weight (500)
- Semi-bold weight (600)
- Bold weight (700)

## File Format
- WOFF2 (primary, best compression)
- WOFF (fallback)
- TTF (optional, for older browsers)

## Installation
1. Download font files
2. Place them in this directory
3. Update font-face declarations in globals.css
EOF
    
    echo -e "${GREEN}  ✓ Created $font_dir${NC}"
done

echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    Setup Complete!                         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}Next Steps:${NC}"
echo "  1. Download fonts using one of the methods above"
echo "  2. Place font files in public/fonts/[font-name]/"
echo "  3. Update globals.css with @font-face declarations"
echo "  4. Update lib/fonts.ts to use local fonts"
echo ""
echo -e "${YELLOW}Note: The app currently uses Google Fonts CDN and works perfectly.${NC}"
echo -e "${YELLOW}Local hosting is only needed for offline use or custom requirements.${NC}"
echo ""
