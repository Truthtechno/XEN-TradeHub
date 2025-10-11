'use client'

import { useSettings } from '@/lib/settings-context'
import { useEffect } from 'react'
import { generateColorShades, generateGoogleFontsURL } from '@/lib/theme-config'

export function OptimizedDynamicStyles() {
  const { settings } = useSettings()

  useEffect(() => {
    // Only run if we have settings and we're on the client
    if (!settings || typeof window === 'undefined') return

    // Skip this component to prevent conflicts with the main theme script
    console.log('OptimizedDynamicStyles: Skipped to prevent conflicts with main theme script')
    return

    // Add a longer delay to ensure the inline script has already run
    const timeoutId = setTimeout(() => {
      console.log('OptimizedDynamicStyles: Applying theme settings', settings)
    
    // Apply CSS custom properties for dynamic styling
    const root = document.documentElement
    
    // Determine current theme mode
    const isDarkMode = settings.theme === 'dark' || 
      (settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
      document.documentElement.classList.contains('dark')
    
    // Use mode-specific colors with fallbacks
    const lightColors = settings.lightModeColors || {
      primaryColor: settings.primaryColor || '#1E40AF',
      secondaryColor: settings.secondaryColor || '#DC2626',
      accentColor: settings.accentColor || '#10B981',
      neutralColor: settings.neutralColor || '#6B7280',
      successColor: settings.successColor || '#10B981',
      warningColor: settings.warningColor || '#F59E0B',
      errorColor: settings.errorColor || '#EF4444',
      infoColor: settings.infoColor || '#3B82F6',
    }
    
    const darkColors = settings.darkModeColors || {
      primaryColor: '#3B82F6',
      secondaryColor: '#F87171',
      accentColor: '#34D399',
      neutralColor: '#9CA3AF',
      successColor: '#34D399',
      warningColor: '#FBBF24',
      errorColor: '#F87171',
      infoColor: '#60A5FA',
    }
    
    // Select colors based on current mode
    const colors = isDarkMode ? darkColors : lightColors
    
    // Apply primary color and generate shades
    if (colors.primaryColor) {
      root.style.setProperty('--color-primary', colors.primaryColor)
      const primaryShades = generateColorShades(colors.primaryColor)
      Object.entries(primaryShades).forEach(([shade, color]) => {
        root.style.setProperty(`--color-primary-${shade}`, color)
      })
    }
    
    // Apply secondary color and generate shades
    if (colors.secondaryColor) {
      root.style.setProperty('--color-secondary', colors.secondaryColor)
      const secondaryShades = generateColorShades(colors.secondaryColor)
      Object.entries(secondaryShades).forEach(([shade, color]) => {
        root.style.setProperty(`--color-secondary-${shade}`, color)
      })
    }
    
    // Apply accent color and generate shades
    if (colors.accentColor) {
      root.style.setProperty('--color-accent', colors.accentColor)
      const accentShades = generateColorShades(colors.accentColor)
      Object.entries(accentShades).forEach(([shade, color]) => {
        root.style.setProperty(`--color-accent-${shade}`, color)
      })
    }
    
    // Apply neutral color and generate shades
    if (colors.neutralColor) {
      root.style.setProperty('--color-neutral', colors.neutralColor)
      const neutralShades = generateColorShades(colors.neutralColor)
      Object.entries(neutralShades).forEach(([shade, color]) => {
        root.style.setProperty(`--color-neutral-${shade}`, color)
      })
    }
    
    // Apply semantic colors
    if (colors.successColor) {
      root.style.setProperty('--color-success', colors.successColor)
      const successShades = generateColorShades(colors.successColor)
      Object.entries(successShades).forEach(([shade, color]) => {
        root.style.setProperty(`--color-success-${shade}`, color)
      })
    }
    
    if (colors.warningColor) {
      root.style.setProperty('--color-warning', colors.warningColor)
      const warningShades = generateColorShades(colors.warningColor)
      Object.entries(warningShades).forEach(([shade, color]) => {
        root.style.setProperty(`--color-warning-${shade}`, color)
      })
    }
    
    if (colors.errorColor) {
      root.style.setProperty('--color-error', colors.errorColor)
      const errorShades = generateColorShades(colors.errorColor)
      Object.entries(errorShades).forEach(([shade, color]) => {
        root.style.setProperty(`--color-error-${shade}`, color)
      })
    }
    
    if (colors.infoColor) {
      root.style.setProperty('--color-info', colors.infoColor)
      const infoShades = generateColorShades(colors.infoColor)
      Object.entries(infoShades).forEach(([shade, color]) => {
        root.style.setProperty(`--color-info-${shade}`, color)
      })
    }
    
    // Apply typography
    if (settings.headingFont) {
      root.style.setProperty('--font-heading', `'${settings.headingFont}', sans-serif`)
    }
    if (settings.bodyFont) {
      root.style.setProperty('--font-body', `'${settings.bodyFont}', sans-serif`)
    }
    if (settings.monoFont) {
      root.style.setProperty('--font-mono', `'${settings.monoFont}', monospace`)
    }
    
    // Load Google Fonts if needed
    if (settings.headingFont || settings.bodyFont || settings.monoFont) {
      const fonts = [
        settings.headingFont,
        settings.bodyFont,
        settings.monoFont
      ].filter(Boolean)
      
      if (fonts.length > 0) {
        const googleFontsURL = generateGoogleFontsURL(fonts)
        const existingLink = document.querySelector('link[href*="fonts.googleapis.com"]')
        
        if (!existingLink) {
          const link = document.createElement('link')
          link.rel = 'stylesheet'
          link.href = googleFontsURL
          document.head.appendChild(link)
        }
      }
    }
    
    // Update favicon
    if (settings.faviconUrl) {
      const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link')
      favicon.setAttribute('rel', 'icon')
      favicon.setAttribute('href', settings.faviconUrl)
      if (!document.querySelector('link[rel="icon"]')) {
        document.head.appendChild(favicon)
      }
    }
    
    // Update page title
    const expectedTitle = `${settings.siteName} - Forex Learning & Trading Ecosystem`
    if (settings.siteName && document.title !== expectedTitle) {
      document.title = expectedTitle
    }
    
    // Don't add theme-loaded here - let the monitoring script handle it
    // This ensures we don't have multiple competing signals
    
    }, 300) // 300ms delay to ensure all inline scripts and settings are processed
    
    return () => clearTimeout(timeoutId)
    
  }, [
    settings.primaryColor,
    settings.secondaryColor,
    settings.accentColor,
    settings.neutralColor,
    settings.successColor,
    settings.warningColor,
    settings.errorColor,
    settings.infoColor,
    settings.headingFont,
    settings.bodyFont,
    settings.monoFont,
    settings.theme,
    settings.faviconUrl,
    settings.siteName,
    settings.lightModeColors,
    settings.darkModeColors
  ])

  return null
}
