export interface ThemeColors {
  primary: string
  secondary: string
  accent: string
  neutral: string
  success: string
  warning: string
  error: string
  info: string
}

export interface ThemeTypography {
  headingFont: string
  bodyFont: string
  monoFont: string
}

export interface ThemeConfig {
  colors: ThemeColors
  typography: ThemeTypography
  mode: 'light' | 'dark' | 'auto'
  useGradientAccent: boolean
  cardElevation: 'none' | 'low' | 'medium' | 'high'
  lightModeColors?: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    neutralColor: string
    successColor: string
    warningColor: string
    errorColor: string
    infoColor: string
  }
  darkModeColors?: {
    primaryColor: string
    secondaryColor: string
    accentColor: string
    neutralColor: string
    successColor: string
    warningColor: string
    errorColor: string
    infoColor: string
  }
}

export interface ColorContrastResult {
  ratio: number
  level: 'AAA' | 'AA' | 'AA-Large' | 'Fail'
  passed: boolean
}

export interface ThemePreview {
  id: string
  name: string
  description: string
  config: Partial<ThemeConfig>
}

export const defaultThemeConfig: ThemeConfig = {
  colors: {
    primary: '#1E40AF', // Deep Royal Blue
    secondary: '#DC2626', // Signal Red
    accent: '#10B981', // Green for profit
    neutral: '#6B7280', // Neutral gray
    success: '#10B981', // Green
    warning: '#F59E0B', // Amber
    error: '#EF4444', // Red
    info: '#3B82F6', // Blue
  },
  typography: {
    headingFont: 'Poppins',
    bodyFont: 'Inter',
    monoFont: 'JetBrains Mono',
  },
  mode: 'light',
  useGradientAccent: false,
  cardElevation: 'medium',
}

// Color utility functions
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  // Validate hex input
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    console.warn('Invalid hex color provided:', hex, 'using fallback color')
    hex = '#1E40AF' // Default fallback color
  }
  
  // Ensure hex is 7 characters long (#RRGGBB)
  if (hex.length !== 7) {
    console.warn('Invalid hex color length:', hex, 'using fallback color')
    hex = '#1E40AF' // Default fallback color
  }
  
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0
  let s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0)
        break
      case g:
        h = (b - r) / d + 2
        break
      case b:
        h = (r - g) / d + 4
        break
    }
    h /= 6
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  }
}

export function generateColorShades(hex: string): Record<string, string> {
  // Validate hex input
  if (!hex || typeof hex !== 'string') {
    console.warn('Invalid hex color provided to generateColorShades:', hex, 'using fallback color')
    hex = '#1E40AF' // Default fallback color
  }
  
  const { h, s, l } = hexToHsl(hex)
  
  return {
    50: `hsl(${h}, ${Math.max(0, s - 40)}%, ${Math.min(100, l + 45)}%)`,
    100: `hsl(${h}, ${Math.max(0, s - 30)}%, ${Math.min(100, l + 35)}%)`,
    200: `hsl(${h}, ${Math.max(0, s - 20)}%, ${Math.min(100, l + 25)}%)`,
    300: `hsl(${h}, ${Math.max(0, s - 10)}%, ${Math.min(100, l + 15)}%)`,
    400: `hsl(${h}, ${s}%, ${Math.min(100, l + 5)}%)`,
    500: `hsl(${h}, ${s}%, ${l}%)`, // Base color
    600: `hsl(${h}, ${Math.min(100, s + 10)}%, ${Math.max(0, l - 5)}%)`,
    700: `hsl(${h}, ${Math.min(100, s + 20)}%, ${Math.max(0, l - 15)}%)`,
    800: `hsl(${h}, ${Math.min(100, s + 30)}%, ${Math.max(0, l - 25)}%)`,
    900: `hsl(${h}, ${Math.min(100, s + 40)}%, ${Math.max(0, l - 35)}%)`,
    950: `hsl(${h}, ${Math.min(100, s + 50)}%, ${Math.max(0, l - 45)}%)`,
  }
}

export function getContrastText(backgroundColor: string): string {
  // Validate background color input
  if (!backgroundColor || typeof backgroundColor !== 'string') {
    console.warn('Invalid background color provided to getContrastText:', backgroundColor, 'using fallback')
    return '#000000' // Default to black text
  }
  
  const { l } = hexToHsl(backgroundColor)
  return l > 50 ? '#000000' : '#FFFFFF'
}

export function generateThemeCSS(theme: ThemeConfig): string {
  const primaryShades = generateColorShades(theme.colors.primary)
  const secondaryShades = generateColorShades(theme.colors.secondary)
  const accentShades = generateColorShades(theme.colors.accent)
  const neutralShades = generateColorShades(theme.colors.neutral)
  
  const isDark = theme.mode === 'dark'
  
  return `
    :root {
      /* Primary Colors */
      --color-primary-50: ${primaryShades[50]};
      --color-primary-100: ${primaryShades[100]};
      --color-primary-200: ${primaryShades[200]};
      --color-primary-300: ${primaryShades[300]};
      --color-primary-400: ${primaryShades[400]};
      --color-primary-500: ${primaryShades[500]};
      --color-primary-600: ${primaryShades[600]};
      --color-primary-700: ${primaryShades[700]};
      --color-primary-800: ${primaryShades[800]};
      --color-primary-900: ${primaryShades[900]};
      --color-primary-950: ${primaryShades[950]};
      
      /* Secondary Colors */
      --color-secondary-50: ${secondaryShades[50]};
      --color-secondary-100: ${secondaryShades[100]};
      --color-secondary-200: ${secondaryShades[200]};
      --color-secondary-300: ${secondaryShades[300]};
      --color-secondary-400: ${secondaryShades[400]};
      --color-secondary-500: ${secondaryShades[500]};
      --color-secondary-600: ${secondaryShades[600]};
      --color-secondary-700: ${secondaryShades[700]};
      --color-secondary-800: ${secondaryShades[800]};
      --color-secondary-900: ${secondaryShades[900]};
      --color-secondary-950: ${secondaryShades[950]};
      
      /* Accent Colors */
      --color-accent-50: ${accentShades[50]};
      --color-accent-100: ${accentShades[100]};
      --color-accent-200: ${accentShades[200]};
      --color-accent-300: ${accentShades[300]};
      --color-accent-400: ${accentShades[400]};
      --color-accent-500: ${accentShades[500]};
      --color-accent-600: ${accentShades[600]};
      --color-accent-700: ${accentShades[700]};
      --color-accent-800: ${accentShades[800]};
      --color-accent-900: ${accentShades[900]};
      --color-accent-950: ${accentShades[950]};
      
      /* Neutral Colors */
      --color-neutral-50: ${neutralShades[50]};
      --color-neutral-100: ${neutralShades[100]};
      --color-neutral-200: ${neutralShades[200]};
      --color-neutral-300: ${neutralShades[300]};
      --color-neutral-400: ${neutralShades[400]};
      --color-neutral-500: ${neutralShades[500]};
      --color-neutral-600: ${neutralShades[600]};
      --color-neutral-700: ${neutralShades[700]};
      --color-neutral-800: ${neutralShades[800]};
      --color-neutral-900: ${neutralShades[900]};
      --color-neutral-950: ${neutralShades[950]};
      
      /* Semantic Colors */
      --color-success: ${theme.colors.success};
      --color-warning: ${theme.colors.warning};
      --color-error: ${theme.colors.error};
      --color-info: ${theme.colors.info};
      
      /* Typography */
      --font-heading: '${theme.typography.headingFont}', sans-serif;
      --font-body: '${theme.typography.bodyFont}', sans-serif;
      --font-mono: '${theme.typography.monoFont}', monospace;
      
      /* Background and Text Colors */
      --color-bg: ${isDark ? '#111827' : '#F9FAFB'};
      --color-bg-secondary: ${isDark ? '#1F2937' : '#FFFFFF'};
      --color-bg-tertiary: ${isDark ? '#374151' : '#F3F4F6'};
      --color-text: ${isDark ? '#F9FAFB' : '#111827'};
      --color-text-secondary: ${isDark ? '#D1D5DB' : '#6B7280'};
      --color-text-tertiary: ${isDark ? '#9CA3AF' : '#9CA3AF'};
      --color-border: ${isDark ? '#374151' : '#E5E7EB'};
      --color-border-secondary: ${isDark ? '#4B5563' : '#D1D5DB'};
      
      /* Card Colors */
      --color-card: ${isDark ? '#1F2937' : '#FFFFFF'};
      --color-card-hover: ${isDark ? '#374151' : '#F9FAFB'};
      --color-card-border: ${isDark ? '#374151' : '#E5E7EB'};
      
      /* Shadow Colors */
      --shadow-sm: ${isDark ? '0 1px 2px 0 rgba(0, 0, 0, 0.3)' : '0 1px 2px 0 rgba(0, 0, 0, 0.05)'};
      --shadow-md: ${isDark ? '0 4px 6px -1px rgba(0, 0, 0, 0.3)' : '0 4px 6px -1px rgba(0, 0, 0, 0.1)'};
      --shadow-lg: ${isDark ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : '0 10px 15px -3px rgba(0, 0, 0, 0.1)'};
      --shadow-xl: ${isDark ? '0 20px 25px -5px rgba(0, 0, 0, 0.3)' : '0 20px 25px -5px rgba(0, 0, 0, 0.1)'};
    }
  `
}

// Google Fonts integration
export const GOOGLE_FONTS = [
  { name: 'Poppins', weights: [300, 400, 500, 600, 700, 800] },
  { name: 'Inter', weights: [300, 400, 500, 600, 700, 800] },
  { name: 'DM Sans', weights: [300, 400, 500, 600, 700, 800] },
  { name: 'Roboto', weights: [300, 400, 500, 700] },
  { name: 'Open Sans', weights: [300, 400, 500, 600, 700, 800] },
  { name: 'Lato', weights: [300, 400, 700, 900] },
  { name: 'Montserrat', weights: [300, 400, 500, 600, 700, 800] },
  { name: 'Source Sans Pro', weights: [300, 400, 600, 700] },
  { name: 'SF Mono', weights: [300, 400, 500, 600, 700] },
  { name: 'Nunito', weights: [300, 400, 500, 600, 700, 800] },
  { name: 'Work Sans', weights: [300, 400, 500, 600, 700] },
]

export function generateGoogleFontsURL(fonts: string[]): string {
  const fontFamilies = fonts.map(font => {
    const fontData = GOOGLE_FONTS.find(f => f.name === font)
    if (!fontData) return font
    return `${font.replace(/\s+/g, '+')}:wght@${fontData.weights.join(';')}`
  })
  
  return `https://fonts.googleapis.com/css2?${fontFamilies.map(f => `family=${f}`).join('&')}&display=swap`
}

// Color contrast validation functions
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) {
    return { r: 0, g: 0, b: 0 }
  }
  
  if (hex.length !== 7) {
    return { r: 0, g: 0, b: 0 }
  }
  
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  
  return { r, g, b }
}

export function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
  })
  
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}

export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1)
  const rgb2 = hexToRgb(color2)
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b)
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b)
  
  const brightest = Math.max(lum1, lum2)
  const darkest = Math.min(lum1, lum2)
  
  return (brightest + 0.05) / (darkest + 0.05)
}

export function getContrastLevel(ratio: number): ColorContrastResult {
  let level: 'AAA' | 'AA' | 'AA-Large' | 'Fail'
  let passed: boolean
  
  if (ratio >= 7) {
    level = 'AAA'
    passed = true
  } else if (ratio >= 4.5) {
    level = 'AA'
    passed = true
  } else if (ratio >= 3) {
    level = 'AA-Large'
    passed = true
  } else {
    level = 'Fail'
    passed = false
  }
  
  return { ratio, level, passed }
}

export function validateColorContrast(foreground: string, background: string): ColorContrastResult {
  const ratio = getContrastRatio(foreground, background)
  return getContrastLevel(ratio)
}

// Theme presets
export const themePresets: ThemePreview[] = [
  {
    id: 'default',
    name: 'CoreFX Default',
    description: 'Professional fintech theme with royal blue and signal red',
    config: {
      colors: {
        primary: '#1E40AF',
        secondary: '#DC2626',
        accent: '#10B981',
        neutral: '#6B7280',
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
      },
      typography: {
        headingFont: 'Lato',
        bodyFont: 'Inter',
        monoFont: 'JetBrains Mono',
      },
      mode: 'light',
      useGradientAccent: false,
      cardElevation: 'medium',
      lightModeColors: {
        primaryColor: '#1E40AF',
        secondaryColor: '#000000',
        accentColor: '#10B981',
        neutralColor: '#6B7280',
        successColor: '#10B981',
        warningColor: '#F59E0B',
        errorColor: '#EF4444',
        infoColor: '#3B82F6',
      },
      darkModeColors: {
        primaryColor: '#1f46c7',
        secondaryColor: '#ededed',
        accentColor: '#58cea7',
        neutralColor: '#979ca6',
        successColor: '#58cea7',
        warningColor: '#f8bb54',
        errorColor: '#f47c7c',
        infoColor: '#76a8f9',
      },
    },
  },
  {
    id: 'tradingview',
    name: 'TradingView Pro',
    description: 'Professional trading interface with TradingView Pro colors and fonts',
    config: {
      colors: {
        primary: '#2962FF',
        secondary: '#F23645',
        accent: '#26A69A',
        neutral: '#787B86',
        success: '#26A69A',
        warning: '#FF9800',
        error: '#F23645',
        info: '#2196F3',
      },
      typography: {
        headingFont: 'Roboto',
        bodyFont: 'Roboto',
        monoFont: 'JetBrains Mono',
      },
      mode: 'dark',
      useGradientAccent: true,
      cardElevation: 'high',
      lightModeColors: {
        primaryColor: '#2962FF',
        secondaryColor: '#F23645',
        accentColor: '#26A69A',
        neutralColor: '#787B86',
        successColor: '#26A69A',
        warningColor: '#FF9800',
        errorColor: '#F23645',
        infoColor: '#2196F3',
      },
      darkModeColors: {
        primaryColor: '#2962FF',
        secondaryColor: '#F23645',
        accentColor: '#26A69A',
        neutralColor: '#787B86',
        successColor: '#26A69A',
        warningColor: '#FF9800',
        errorColor: '#F23645',
        infoColor: '#2196F3',
      },
    },
  },
  {
    id: 'revolut',
    name: 'Revolut Style',
    description: 'Clean and modern theme with Revolut brand colors and typography',
    config: {
      colors: {
        primary: '#0075EB',
        secondary: '#FF3B30',
        accent: '#00D4AA',
        neutral: '#8E8E93',
        success: '#00D4AA',
        warning: '#FF6B35',
        error: '#FF3B30',
        info: '#0075EB',
      },
      typography: {
        headingFont: 'Inter',
        bodyFont: 'Inter',
        monoFont: 'SF Mono',
      },
      mode: 'light',
      useGradientAccent: false,
      cardElevation: 'low',
      lightModeColors: {
        primaryColor: '#0075EB',
        secondaryColor: '#FF3B30',
        accentColor: '#00D4AA',
        neutralColor: '#8E8E93',
        successColor: '#00D4AA',
        warningColor: '#FF6B35',
        errorColor: '#FF3B30',
        infoColor: '#0075EB',
      },
      darkModeColors: {
        primaryColor: '#4A9EFF',
        secondaryColor: '#FF6B6B',
        accentColor: '#4DD4AA',
        neutralColor: '#A8A8A8',
        successColor: '#4DD4AA',
        warningColor: '#FF8A65',
        errorColor: '#FF6B6B',
        infoColor: '#4A9EFF',
      },
    },
  },
  {
    id: 'binance',
    name: 'Binance Dark',
    description: 'Professional trading interface with Binance brand colors and typography',
    config: {
      colors: {
        primary: '#F0B90B',
        secondary: '#F84960',
        accent: '#02C076',
        neutral: '#707A8A',
        success: '#02C076',
        warning: '#F0B90B',
        error: '#F84960',
        info: '#F0B90B',
      },
      typography: {
        headingFont: 'Poppins',
        bodyFont: 'Inter',
        monoFont: 'JetBrains Mono',
      },
      mode: 'dark',
      useGradientAccent: true,
      cardElevation: 'high',
      lightModeColors: {
        primaryColor: '#F0B90B',
        secondaryColor: '#F84960',
        accentColor: '#02C076',
        neutralColor: '#707A8A',
        successColor: '#02C076',
        warningColor: '#F0B90B',
        errorColor: '#F84960',
        infoColor: '#F0B90B',
      },
      darkModeColors: {
        primaryColor: '#F0B90B',
        secondaryColor: '#F84960',
        accentColor: '#02C076',
        neutralColor: '#707A8A',
        successColor: '#02C076',
        warningColor: '#F0B90B',
        errorColor: '#F84960',
        infoColor: '#F0B90B',
      },
    },
  },
]
