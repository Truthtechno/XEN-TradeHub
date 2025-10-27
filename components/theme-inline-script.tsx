'use client'

// This component renders the theme script inline to prevent flashing
export function ThemeInlineScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
          (function() {
            try {
              // Get theme from localStorage with fallback
              const savedTheme = localStorage.getItem('theme') || 'light';
              const savedSettings = localStorage.getItem('app-settings');
              
              // Apply theme class immediately to prevent flash
              if (savedTheme === 'dark') {
                document.documentElement.classList.add('dark');
                document.body.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
                document.body.classList.remove('dark');
              }
              
              // Apply saved settings immediately if available
              if (savedSettings) {
                try {
                  const settings = JSON.parse(savedSettings);
                  const root = document.documentElement;
                  
                  // Determine if we're in dark mode
                  const isDark = savedTheme === 'dark';
                  
                  // Apply colors based on current theme
                  const colors = isDark ? settings.darkModeColors : settings.lightModeColors;
                  
                  if (colors && typeof colors === 'object') {
                    Object.entries(colors).forEach(([key, value]) => {
                      if (value && typeof value === 'string') {
                        const cssVar = key.replace('Color', '').toLowerCase();
                        root.style.setProperty('--color-' + cssVar, value);
                      }
                    });
                  }
                  
                  // Apply typography
                  if (settings.headingFont && typeof settings.headingFont === 'string') {
                    root.style.setProperty('--font-heading', "'" + settings.headingFont + "', sans-serif");
                  }
                  if (settings.bodyFont && typeof settings.bodyFont === 'string') {
                    root.style.setProperty('--font-body', "'" + settings.bodyFont + "', sans-serif");
                  }
                  if (settings.monoFont && typeof settings.monoFont === 'string') {
                    root.style.setProperty('--font-mono', "'" + settings.monoFont + "', monospace");
                  }
                  
                  // Apply site name to title
                  if (settings.siteName && typeof settings.siteName === 'string') {
                    document.title = settings.siteName + ' - Forex Learning & Trading Ecosystem';
                  }
                  
                  // Apply favicon
                  if (settings.faviconUrl && typeof settings.faviconUrl === 'string') {
                    const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
                    favicon.setAttribute('rel', 'icon');
                    favicon.setAttribute('href', settings.faviconUrl);
                    if (!document.querySelector('link[rel="icon"]')) {
                      document.head.appendChild(favicon);
                    }
                  }
                } catch (parseError) {
                  console.warn('Settings parse error:', parseError);
                }
              }
              
              // Mark theme as loaded to show content
              document.documentElement.classList.add('theme-loaded');
            } catch (e) {
              console.warn('Theme script error:', e);
              // Still show content even if theme loading fails
              document.documentElement.classList.add('theme-loaded');
            }
            
            // Fallback: ensure content is visible after 100ms regardless
            setTimeout(() => {
              document.documentElement.classList.add('theme-loaded');
            }, 100);
          })();
        `,
      }}
    />
  )
}
