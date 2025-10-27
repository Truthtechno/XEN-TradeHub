'use client'

import { useSettings } from '@/lib/settings-context'
import { useEffect } from 'react'
import { generateColorShades, generateGoogleFontsURL } from '@/lib/theme-config'

export function DynamicStyles() {
  const { settings } = useSettings()

  console.log('DynamicStyles: Component mounted, settings:', settings)
  
  // Skip this component to prevent conflicts with the main theme script
  console.log('DynamicStyles: Skipped to prevent conflicts with main theme script')
  return null

  // Remove the refreshSettings call that was causing unnecessary re-fetches
  // The settings should already be loaded by the SettingsProvider

  useEffect(() => {
    console.log('DynamicStyles: useEffect triggered')
    console.log('DynamicStyles: Current settings:', settings)
    
    // Save settings to localStorage immediately to prevent flash on reload
    if (settings) {
      localStorage.setItem('app-settings', JSON.stringify(settings))
      localStorage.setItem('theme', settings.theme || 'light')
    }
    
    // Add a small delay to ensure DOM is ready
    const timeoutId = setTimeout(() => {
    
    // Apply CSS custom properties for dynamic styling
    const root = document.documentElement
    
    // Determine current theme mode
    const isDarkMode = settings.theme === 'dark' || 
      (settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
      document.documentElement.classList.contains('dark')
    
    console.log('DynamicStyles: Theme mode detection', {
      theme: settings.theme,
      isDarkMode,
      lightModeColors: settings.lightModeColors,
      darkModeColors: settings.darkModeColors
    })
    
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
    
    console.log('DynamicStyles: Selected colors', {
      isDarkMode,
      lightColors,
      darkColors,
      selectedColors: colors
    })
    
    // Ensure all color values are defined with fallbacks
    const primaryColor = colors.primaryColor
    const secondaryColor = colors.secondaryColor
    const accentColor = colors.accentColor
    const neutralColor = colors.neutralColor
    const successColor = colors.successColor
    const warningColor = colors.warningColor
    const errorColor = colors.errorColor
    const infoColor = colors.infoColor
    
    // Log the generated shades
    console.log('DynamicStyles: Generated shades', {
      primaryShades: generateColorShades(primaryColor),
      successShades: generateColorShades(successColor),
    })
    const headingFont = settings.headingFont || 'Poppins'
    const bodyFont = settings.bodyFont || 'Inter'
    const monoFont = settings.monoFont || 'JetBrains Mono'
    
    // Generate color shades for all theme colors
    const primaryShades = generateColorShades(primaryColor)
    const secondaryShades = generateColorShades(secondaryColor)
    const accentShades = generateColorShades(accentColor)
    const neutralShades = generateColorShades(neutralColor)
    const successShades = generateColorShades(successColor)
    const warningShades = generateColorShades(warningColor)
    const errorShades = generateColorShades(errorColor)
    const infoShades = generateColorShades(infoColor)
    
    // Apply primary color shades
    Object.entries(primaryShades).forEach(([shade, color]) => {
      root.style.setProperty(`--color-primary-${shade}`, color)
    })
    root.style.setProperty('--color-primary', primaryColor)
    
    // Apply secondary color shades
    Object.entries(secondaryShades).forEach(([shade, color]) => {
      root.style.setProperty(`--color-secondary-${shade}`, color)
    })
    root.style.setProperty('--color-secondary', secondaryColor)
    
    // Force immediate update of secondary color
    console.log('DynamicStyles: Setting secondary color to:', secondaryColor)
    root.style.setProperty('--color-secondary', secondaryColor, 'important')
    
    // Force a re-render by triggering a custom event
    window.dispatchEvent(new CustomEvent('theme-updated', {
      detail: { colors, isDarkMode }
    }))
    
    // Double-check that the CSS variable was set correctly
    setTimeout(() => {
      const actualSecondaryColor = root.style.getPropertyValue('--color-secondary')
      console.log('DynamicStyles: Verification - secondary color is:', actualSecondaryColor)
      if (actualSecondaryColor !== secondaryColor) {
        console.warn('DynamicStyles: Secondary color mismatch! Expected:', secondaryColor, 'Got:', actualSecondaryColor)
        root.style.setProperty('--color-secondary', secondaryColor, 'important')
      }
    }, 50)
    
    // Apply accent color shades
    Object.entries(accentShades).forEach(([shade, color]) => {
      root.style.setProperty(`--color-accent-${shade}`, color)
    })
    root.style.setProperty('--color-accent', accentColor)
    
    // Apply neutral color shades
    Object.entries(neutralShades).forEach(([shade, color]) => {
      root.style.setProperty(`--color-neutral-${shade}`, color)
    })
    root.style.setProperty('--color-neutral', neutralColor)
    
    // Apply success color shades
    Object.entries(successShades).forEach(([shade, color]) => {
      root.style.setProperty(`--color-success-${shade}`, color)
    })
    root.style.setProperty('--color-success', successColor)
    
    // Apply warning color shades
    Object.entries(warningShades).forEach(([shade, color]) => {
      root.style.setProperty(`--color-warning-${shade}`, color)
    })
    root.style.setProperty('--color-warning', warningColor)
    
    // Apply error color shades
    Object.entries(errorShades).forEach(([shade, color]) => {
      root.style.setProperty(`--color-error-${shade}`, color)
    })
    root.style.setProperty('--color-error', errorColor)
    
    // Apply info color shades
    Object.entries(infoShades).forEach(([shade, color]) => {
      root.style.setProperty(`--color-info-${shade}`, color)
    })
    root.style.setProperty('--color-info', infoColor)
    
    // Apply typography
    root.style.setProperty('--font-heading', `'${headingFont}', sans-serif`)
    root.style.setProperty('--font-body', `'${bodyFont}', sans-serif`)
    root.style.setProperty('--font-mono', `'${monoFont}', monospace`)
    
    console.log('DynamicStyles: CSS variables applied', {
      primary: root.style.getPropertyValue('--color-primary'),
      secondary: root.style.getPropertyValue('--color-secondary'),
      accent: root.style.getPropertyValue('--color-accent'),
      success: root.style.getPropertyValue('--color-success'),
      warning: root.style.getPropertyValue('--color-warning'),
      error: root.style.getPropertyValue('--color-error'),
      info: root.style.getPropertyValue('--color-info'),
    })
    
    // Log the CSS variable values for debugging
    console.log('DynamicStyles: Final CSS variable values', {
      primary: root.style.getPropertyValue('--color-primary'),
      secondary: root.style.getPropertyValue('--color-secondary'),
      accent: root.style.getPropertyValue('--color-accent'),
      success: root.style.getPropertyValue('--color-success'),
      warning: root.style.getPropertyValue('--color-warning'),
      error: root.style.getPropertyValue('--color-error'),
      info: root.style.getPropertyValue('--color-info'),
    })
    
    // Test if a specific element is using the theme colors
    const testElement = document.createElement('div')
    testElement.className = 'bg-theme-primary'
    testElement.style.position = 'fixed'
    testElement.style.top = '0'
    testElement.style.left = '0'
    testElement.style.width = '10px'
    testElement.style.height = '10px'
    testElement.style.zIndex = '9999'
    document.body.appendChild(testElement)
    
    setTimeout(() => {
      const computedStyle = getComputedStyle(testElement)
      console.log('Test element background color:', computedStyle.backgroundColor)
      console.log('Expected primary color:', primaryColor)
      if (testElement.parentNode) {
        testElement.parentNode.removeChild(testElement)
      }
    }, 100)
    
    // Set theme mode
    const currentTheme = root.getAttribute('data-theme')
    if (currentTheme !== settings.theme) {
      root.setAttribute('data-theme', settings.theme)
      
      // Apply theme class to both document and body
      if (settings.theme === 'dark') {
        document.documentElement.classList.add('dark')
        document.body.classList.add('dark')
      } else if (settings.theme === 'light') {
        document.documentElement.classList.remove('dark')
        document.body.classList.remove('dark')
      } else {
        // Auto theme - follow system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
        if (prefersDark) {
          document.documentElement.classList.add('dark')
          document.body.classList.add('dark')
        } else {
          document.documentElement.classList.remove('dark')
          document.body.classList.remove('dark')
        }
      }
    }
    
    // Load Google Fonts
    const fontsToLoad = [headingFont, bodyFont, monoFont]
    const uniqueFonts = Array.from(new Set(fontsToLoad))
    const fontUrl = generateGoogleFontsURL(uniqueFonts)
    
    // Check if font link already exists
    let fontLink = document.querySelector('link[href*="fonts.googleapis.com"]') as HTMLLinkElement
    if (!fontLink) {
      fontLink = document.createElement('link') as HTMLLinkElement
      fontLink.rel = 'stylesheet'
      document.head.appendChild(fontLink)
    }
    fontLink.setAttribute('href', fontUrl)
    
    // Update favicon if provided and changed
    if (settings.faviconUrl) {
      const existingFavicon = document.querySelector('link[rel="icon"]')
      if (existingFavicon && existingFavicon.getAttribute('href') !== settings.faviconUrl) {
        existingFavicon.setAttribute('href', settings.faviconUrl)
      } else if (!existingFavicon) {
        const favicon = document.createElement('link')
        favicon.rel = 'icon'
        favicon.href = settings.faviconUrl
        document.head.appendChild(favicon)
      }
    }
    
    // Update page title with site name only if changed
    const expectedTitle = `${settings.siteName} - Forex Learning & Trading Ecosystem`
    if (settings.siteName && document.title !== expectedTitle) {
      document.title = expectedTitle
    }
    
    // Listen for theme changes
    const handleThemeChange = () => {
      const newIsDarkMode = settings.theme === 'dark' || 
        (settings.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches) ||
        document.documentElement.classList.contains('dark')
      
      if (newIsDarkMode !== isDarkMode) {
        // Re-run the effect when theme changes
        window.location.reload()
      }
    }
    
    // Add event listener for theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    mediaQuery.addEventListener('change', handleThemeChange)
    
    // Cleanup
    return () => {
      mediaQuery.removeEventListener('change', handleThemeChange)
    }
    
    }, 100) // 100ms delay to ensure DOM is ready
    
    return () => clearTimeout(timeoutId)
    
  }, [
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
