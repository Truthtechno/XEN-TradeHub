/**
 * Font Configuration for XEN TradeHub
 * 
 * This file centralizes all font loading using Next.js Google Fonts.
 * All fonts are loaded from Google Fonts CDN with proper fallbacks.
 * 
 * Available Fonts:
 * - Heading Fonts: Poppins, Inter, DM Sans, Roboto, Open Sans, Lato, Montserrat, Source Sans Pro, Nunito, Work Sans
 * - Body Fonts: Inter, Poppins, DM Sans, Roboto, Open Sans, Lato, Montserrat, Source Sans Pro, Nunito, Work Sans
 * - Monospace Fonts: JetBrains Mono, Fira Code, Source Code Pro, Monaco, Consolas, Courier New
 */

import { 
  Inter, 
  Poppins, 
  JetBrains_Mono, 
  Lato,
  DM_Sans,
  Roboto,
  Open_Sans,
  Montserrat,
  Source_Sans_3,
  Nunito,
  Work_Sans,
  Fira_Code,
  Source_Code_Pro
} from 'next/font/google'

// ============================================
// HEADING & BODY FONTS
// ============================================

export const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true,
})

export const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true,
})

export const dmSans = DM_Sans({ 
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true,
})

export const roboto = Roboto({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '700', '900'],
  variable: '--font-roboto',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true,
})

export const openSans = Open_Sans({ 
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true,
})

export const lato = Lato({ 
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-lato',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true,
})

export const montserrat = Montserrat({ 
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true,
})

export const sourceSansPro = Source_Sans_3({ 
  subsets: ['latin'],
  variable: '--font-source-sans-pro',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true,
})

export const nunito = Nunito({ 
  subsets: ['latin'],
  variable: '--font-nunito',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true,
})

export const workSans = Work_Sans({ 
  subsets: ['latin'],
  variable: '--font-work-sans',
  display: 'swap',
  fallback: ['system-ui', 'arial'],
  preload: true,
})

// ============================================
// MONOSPACE FONTS
// ============================================

export const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
  fallback: ['monospace'],
  preload: true,
})

export const firaCode = Fira_Code({ 
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
  fallback: ['monospace'],
  preload: true,
})

export const sourceCodePro = Source_Code_Pro({ 
  subsets: ['latin'],
  variable: '--font-source-code-pro',
  display: 'swap',
  fallback: ['monospace'],
  preload: true,
})

// ============================================
// FONT MAPPING
// ============================================

/**
 * Maps font names to their CSS variable names
 * Used for dynamic font switching in settings
 */
export const fontVariables = {
  // Heading & Body Fonts
  'Inter': '--font-inter',
  'Poppins': '--font-poppins',
  'DM Sans': '--font-dm-sans',
  'Roboto': '--font-roboto',
  'Open Sans': '--font-open-sans',
  'Lato': '--font-lato',
  'Montserrat': '--font-montserrat',
  'Source Sans Pro': '--font-source-sans-pro',
  'Nunito': '--font-nunito',
  'Work Sans': '--font-work-sans',
  
  // Monospace Fonts
  'JetBrains Mono': '--font-jetbrains-mono',
  'Fira Code': '--font-fira-code',
  'Source Code Pro': '--font-source-code-pro',
  
  // System Fonts (no variable needed)
  'Monaco': 'Monaco',
  'Consolas': 'Consolas',
  'Courier New': 'Courier New',
}

/**
 * Get all font CSS variables for the HTML element
 */
export function getAllFontVariables() {
  return [
    inter.variable,
    poppins.variable,
    dmSans.variable,
    roboto.variable,
    openSans.variable,
    lato.variable,
    montserrat.variable,
    sourceSansPro.variable,
    nunito.variable,
    workSans.variable,
    jetbrainsMono.variable,
    firaCode.variable,
    sourceCodePro.variable,
  ].join(' ')
}

/**
 * Get font family string for a given font name
 * Handles both Google Fonts and system fonts
 */
export function getFontFamily(fontName: string): string {
  const variable = fontVariables[fontName as keyof typeof fontVariables]
  
  // If it's a CSS variable, use it with fallback
  if (variable && variable.startsWith('--')) {
    return `var(${variable}), sans-serif`
  }
  
  // Otherwise, it's a system font
  return fontName
}
