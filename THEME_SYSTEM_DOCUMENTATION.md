# CoreFX Theme System Documentation

## Overview

The CoreFX Theme System is a comprehensive, professional-grade theming solution designed specifically for fintech and trading platforms. It provides dynamic color management, typography control, and real-time theme previews with WCAG-compliant contrast validation.

## Features

### 🎨 **Dynamic Color Management**
- **Primary Colors**: Main brand colors with auto-generated shades (50-950)
- **Semantic Colors**: Success, warning, error, info with consistent naming
- **Contrast Validation**: Real-time WCAG compliance checking
- **Color Presets**: Pre-built themes inspired by TradingView, Revolut, Binance

### 🔤 **Professional Typography**
- **Heading Font**: Poppins (Bold, 600-700 weight)
- **Body Font**: Inter (Regular, 400 weight)
- **Monospace Font**: JetBrains Mono (Medium, 500 weight)
- **Financial Data**: Tabular numbers for precise alignment

### 🌙 **Light/Dark Mode Support**
- **Automatic Detection**: System preference detection
- **Manual Override**: Force light or dark mode
- **Smooth Transitions**: CSS transitions between modes
- **Consistent Contrast**: Maintained across all components

### 🎯 **Professional UI Components**
- **Collapsible Cards**: Organized settings sections
- **Tooltips**: Contextual help and explanations
- **Live Preview**: Real-time theme visualization
- **Theme Showcase**: Comprehensive component preview

## Architecture

### CSS Variables System

The theme system uses CSS custom properties for dynamic theming:

```css
:root {
  /* Primary Colors */
  --color-primary: #1E40AF;
  --color-primary-50: hsl(221, 71%, 95%);
  --color-primary-100: hsl(221, 71%, 85%);
  /* ... more shades */
  --color-primary-950: hsl(221, 71%, 5%);
  
  /* Typography */
  --font-heading: 'Poppins', sans-serif;
  --font-body: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* Theme Colors */
  --color-bg: #FFFFFF;
  --color-text: #0F172A;
  --color-card: #FFFFFF;
  --color-border: #E2E8F0;
}
```

### Tailwind Integration

All theme colors are integrated with Tailwind CSS:

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'theme-primary': {
          50: 'var(--color-primary-50)',
          100: 'var(--color-primary-100)',
          // ... more shades
          DEFAULT: 'var(--color-primary)',
        },
        'theme-bg': 'var(--color-bg)',
        'theme-text': 'var(--color-text)',
        // ... more theme colors
      }
    }
  }
}
```

## Usage

### Basic Theme Application

```tsx
import { useSettings } from '@/lib/settings-context'

function MyComponent() {
  const { settings } = useSettings()
  
  return (
    <div className="bg-theme text-theme">
      <h1 className="font-heading text-2xl font-bold">
        {settings.siteName}
      </h1>
      <p className="font-body text-theme-secondary">
        Professional trading education
      </p>
    </div>
  )
}
```

### Dynamic Color Application

```tsx
function TradingCard({ trade }) {
  return (
    <div 
      className="p-4 rounded-lg border border-theme"
      style={{ 
        backgroundColor: trade.profit > 0 ? 'var(--color-success)' : 'var(--color-error)',
        color: 'white'
      }}
    >
      <span className="font-mono text-lg">
        {trade.symbol}: {trade.price}
      </span>
    </div>
  )
}
```

### Theme Configuration

```tsx
import { validateColorContrast, generateColorShades } from '@/lib/theme-config'

// Validate color contrast
const contrastResult = validateColorContrast('#FFFFFF', '#1E40AF')
console.log(contrastResult.level) // 'AAA', 'AA', 'AA-Large', or 'Fail'

// Generate color shades
const shades = generateColorShades('#1E40AF')
console.log(shades[500]) // Base color
console.log(shades[700]) // Darker shade
```

## Components

### Theme Settings Page

The theme settings page provides a comprehensive interface for customizing the platform's appearance:

- **Theme Presets**: Quick application of professional themes
- **Color Customization**: Individual color pickers with contrast validation
- **Typography Selection**: Font family selection with live preview
- **Mode Selection**: Light, dark, or automatic theme switching
- **Live Preview**: Real-time theme visualization
- **Theme Showcase**: Comprehensive component preview
- **Export/Import**: CSS variables export and theme backup

### Collapsible Cards

Organized settings sections with expandable content:

```tsx
<Collapsible
  title="Theme Colors"
  description="Customize your site's color palette"
  icon={<Palette className="w-5 h-5" />}
  defaultOpen={true}
>
  {/* Color customization controls */}
</Collapsible>
```

### Tooltips

Contextual help and explanations:

```tsx
<Tooltip content="This color affects all primary buttons and links">
  <Info className="w-4 h-4" />
</Tooltip>
```

## Color System

### Primary Colors

- **Primary**: Main brand color (#1E40AF - Deep Royal Blue)
- **Secondary**: Secondary actions (#DC2626 - Signal Red)
- **Accent**: Success states (#10B981 - Green for profit)

### Semantic Colors

- **Success**: Positive feedback and confirmations
- **Warning**: Caution messages and alerts
- **Error**: Error states and destructive actions
- **Info**: Information messages and tips

### Neutral Colors

- **Neutral**: Text and subtle UI elements
- **Background**: Main background colors
- **Card**: Card and surface backgrounds
- **Border**: Border and divider colors

## Typography System

### Font Hierarchy

```css
/* Headings - Poppins */
h1 { font-family: var(--font-heading); font-weight: 700; }
h2 { font-family: var(--font-heading); font-weight: 600; }
h3 { font-family: var(--font-heading); font-weight: 600; }

/* Body Text - Inter */
p { font-family: var(--font-body); font-weight: 400; }
.text-body-sm { font-family: var(--font-body); font-weight: 400; }

/* Financial Data - JetBrains Mono */
.text-financial { font-family: var(--font-mono); font-weight: 500; }
.text-financial-lg { font-family: var(--font-mono); font-weight: 600; }
```

### Utility Classes

```css
.text-subheader {
  font-family: var(--font-heading);
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.025em;
}

.tabular-nums {
  font-variant-numeric: tabular-nums;
  font-feature-settings: 'tnum';
}
```

## Accessibility

### WCAG Compliance

The theme system includes built-in contrast validation:

```tsx
import { validateColorContrast } from '@/lib/theme-config'

const result = validateColorContrast(foreground, background)
// Returns: { ratio: number, level: 'AAA' | 'AA' | 'AA-Large' | 'Fail', passed: boolean }
```

### Color Contrast Levels

- **AAA**: 7:1 ratio (excellent contrast)
- **AA**: 4.5:1 ratio (good contrast)
- **AA-Large**: 3:1 ratio (acceptable for large text)
- **Fail**: Below 3:1 ratio (insufficient contrast)

## Performance

### CSS Variables

- **Zero Runtime Cost**: All theming is handled via CSS variables
- **Instant Updates**: Changes apply immediately without re-renders
- **Minimal Bundle Size**: No JavaScript theming libraries required

### Font Loading

- **Google Fonts Integration**: Automatic font loading and fallbacks
- **Font Display Swap**: Prevents layout shift during font loading
- **Optimized Weights**: Only necessary font weights are loaded

## Migration Guide

### From Old Theme System

1. **Update CSS Classes**: Replace old color classes with new theme classes
2. **Update Component Props**: Use new theme context instead of prop drilling
3. **Update Tailwind Config**: Ensure new theme colors are available
4. **Test Contrast**: Validate all color combinations for accessibility

### Example Migration

```tsx
// Old
<div className="bg-blue-600 text-white">

// New
<div className="bg-theme-primary text-white">
```

## Best Practices

### Color Usage

1. **Consistent Application**: Use theme colors consistently across components
2. **Contrast Validation**: Always validate color combinations for accessibility
3. **Semantic Naming**: Use semantic color names (success, error) over generic ones
4. **Dark Mode Support**: Ensure all colors work in both light and dark modes

### Typography

1. **Font Hierarchy**: Use appropriate font weights and sizes
2. **Financial Data**: Always use monospace fonts for numbers
3. **Readability**: Ensure sufficient contrast and line height
4. **Responsive**: Use responsive font sizes for different screen sizes

### Component Design

1. **Theme Awareness**: Make components theme-aware using CSS variables
2. **Consistent Spacing**: Use consistent spacing and sizing
3. **Hover States**: Include appropriate hover and focus states
4. **Accessibility**: Ensure keyboard navigation and screen reader support

## Troubleshooting

### Common Issues

1. **Colors Not Updating**: Check if CSS variables are properly set
2. **Fonts Not Loading**: Verify Google Fonts integration
3. **Contrast Warnings**: Use contrast validation tools
4. **Dark Mode Issues**: Ensure proper CSS variable overrides

### Debug Tools

```tsx
// Check current theme values
console.log(getComputedStyle(document.documentElement).getPropertyValue('--color-primary'))

// Validate color contrast
const result = validateColorContrast('#FFFFFF', '#1E40AF')
console.log(result)
```

## Future Enhancements

### Planned Features

1. **Theme Presets**: More professional theme presets
2. **Custom Gradients**: Gradient accent support
3. **Animation Themes**: Customizable transition animations
4. **Export/Import**: Theme configuration backup and sharing
5. **A/B Testing**: Theme variation testing capabilities

### Contributing

To contribute to the theme system:

1. Follow the established patterns for color and typography
2. Ensure all changes are accessible and performant
3. Add appropriate tests for new functionality
4. Update documentation for any new features

## Support

For questions or issues with the theme system:

1. Check the troubleshooting section
2. Review the component examples
3. Test with the theme showcase
4. Contact the development team

---

*This documentation is maintained alongside the theme system and should be updated with any changes or new features.*