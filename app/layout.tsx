import type { Metadata } from 'next'
import { Inter, Poppins, JetBrains_Mono, Lato } from 'next/font/google'
import './globals.css'
import { MainLayout } from '@/components/layout/main-layout'
import { OptimizedDynamicStyles } from '@/components/optimized-dynamic-styles'
import { DynamicFavicon } from '@/components/dynamic-favicon'
import { Providers } from '@/components/providers'

// Load default fonts - these will be overridden by dynamic styles
const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap'
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap'
})

const jetbrainsMono = JetBrains_Mono({ 
  subsets: ['latin'],
  variable: '--font-jetbrains-mono',
  display: 'swap'
})

const lato = Lato({ 
  subsets: ['latin'],
  weight: ['300', '400', '700', '900'],
  variable: '--font-lato',
  display: 'swap'
})

export const metadata: Metadata = {
  title: 'CoreFX - Professional Trading Education Platform',
  description: 'Master forex trading with CoreFX. Premium signals, courses, and personalized coaching. Transform your financial future with our proven system.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html 
      lang="en" 
      className={`${inter.variable} ${poppins.variable} ${jetbrainsMono.variable} ${lato.variable}`}
      style={{
        visibility: 'hidden',
        backgroundColor: 'var(--color-bg, #FFFFFF)',
        color: 'var(--color-text, #0F172A)'
      }}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // SINGLE ULTRA-CRITICAL SCRIPT: This is the ONLY script that should handle theme loading
              (function() {
                // Prevent multiple executions
                if (window.themeLoaded) return;
                window.themeLoaded = true;
                
                try {
                  // Get theme and settings in one go
                  const savedTheme = localStorage.getItem('theme') || 'light';
                  const savedSettings = localStorage.getItem('corefx-settings');
                  
                  // Determine theme state
                  let isDark = false;
                  if (savedTheme === 'dark') {
                    isDark = true;
                  } else if (savedTheme === 'light') {
                    isDark = false;
                  } else if (savedTheme === 'auto') {
                    isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  } else {
                    isDark = false; // Default to light mode
                  }
                  
                  // Apply theme classes and CSS variables IMMEDIATELY
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.body.classList.add('dark');
                    // Set dark mode CSS variables immediately
                    document.documentElement.style.setProperty('--color-bg', '#0F172A');
                    document.documentElement.style.setProperty('--color-text', '#F8FAFC');
                    document.documentElement.style.setProperty('--color-bg-secondary', '#1E293B');
                    document.documentElement.style.setProperty('--color-text-secondary', '#CBD5E1');
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.body.classList.remove('dark');
                    // Set light mode CSS variables immediately
                    document.documentElement.style.setProperty('--color-bg', '#FFFFFF');
                    document.documentElement.style.setProperty('--color-text', '#0F172A');
                    document.documentElement.style.setProperty('--color-bg-secondary', '#F8FAFC');
                    document.documentElement.style.setProperty('--color-text-secondary', '#475569');
                  }
                  
                  // Apply saved settings immediately if available
                  if (savedSettings) {
                    try {
                      const settings = JSON.parse(savedSettings);
                      const root = document.documentElement;
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

                  // Mark theme as loaded immediately - no delays
                  document.documentElement.classList.add('theme-loaded');
                  
                  // Re-enable transitions after a brief delay to prevent flicker
                  setTimeout(() => {
                    document.documentElement.classList.add('loaded');
                  }, 200);
                  
                } catch (e) {
                  console.warn('Theme script error:', e);
                  // Still show content even if theme loading fails
                  document.documentElement.classList.add('theme-loaded');
                  
                  // Re-enable transitions after a brief delay to prevent flicker
                  setTimeout(() => {
                    document.documentElement.classList.add('loaded');
                  }, 200);
                }
              })();
            `,
          }}
        />
        <style
          dangerouslySetInnerHTML={{
            __html: `
              /* Force theme state immediately */
              html { visibility: hidden !important; }
              html.theme-loaded { visibility: visible !important; }
              html:not(.theme-loaded) { 
                background-color: var(--color-bg, #FFFFFF) !important; 
                color: var(--color-text, #0F172A) !important; 
              }
              html:not(.theme-loaded).dark { 
                background-color: var(--color-bg, #0F172A) !important; 
                color: var(--color-text, #F8FAFC) !important; 
              }
              /* Force text colors in dark mode */
              .dark, .dark * {
                color: var(--color-text, #F8FAFC) !important;
              }
              .dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6 {
                color: var(--color-text, #F8FAFC) !important;
              }
              .dark p, .dark span, .dark div {
                color: var(--color-text, #F8FAFC) !important;
              }
            `,
          }}
        />
      </head>
      <body className="font-body antialiased">
        <Providers>
          {/* OptimizedDynamicStyles disabled to prevent conflicts with single script */}
          <DynamicFavicon />
          {children}
        </Providers>
      </body>
    </html>
  )
}
