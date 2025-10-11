/**
 * Text Hierarchy Utility
 * Provides consistent text styling classes for headings and subheadings across the application
 */

export const textHierarchy = {
  // Main headings - always white in dark mode, gray-900 in light mode
  mainHeading: (isDarkMode: boolean) => 
    `text-2xl sm:text-3xl lg:text-4xl font-bold transition-colors duration-200 leading-tight ${
      isDarkMode ? 'text-white' : 'text-gray-900'
    }`,
  
  // Large headings - same as main but smaller
  largeHeading: (isDarkMode: boolean) => 
    `text-3xl font-bold transition-colors duration-200 ${
      isDarkMode ? 'text-white' : 'text-gray-900'
    }`,
  
  // Subheadings - use theme secondary color for both modes
  subheading: () => 
    `text-base sm:text-lg transition-colors duration-200 leading-relaxed max-w-2xl text-theme-secondary`,
  
  // Large subheadings - same as subheading but larger
  largeSubheading: () => 
    `text-lg transition-colors duration-200 text-theme-secondary`,
  
  // Section headings - smaller than main headings
  sectionHeading: (isDarkMode: boolean) => 
    `text-xl font-semibold transition-colors duration-200 ${
      isDarkMode ? 'text-white' : 'text-gray-900'
    }`,
  
  // Card titles - medium size
  cardTitle: (isDarkMode: boolean) => 
    `text-lg font-semibold group-hover:text-theme-primary transition-colors leading-tight ${
      isDarkMode ? 'text-white' : 'text-gray-900'
    }`,
  
  // Card descriptions - use theme secondary
  cardDescription: () => 
    `text-sm mt-2 leading-relaxed text-theme-secondary`,
  
  // Meta text - smaller, muted
  metaText: (isDarkMode: boolean) => 
    `text-sm transition-colors duration-200 ${
      isDarkMode ? 'text-gray-400' : 'text-gray-500'
    }`
}

/**
 * Hook to get text hierarchy classes
 */
export function useTextHierarchy() {
  return textHierarchy
}
