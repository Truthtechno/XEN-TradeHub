#!/usr/bin/env node

/**
 * Fix remaining import issues by directly checking and fixing specific files
 */

const fs = require('fs')
const path = require('path')

class RemainingImportFixer {
  constructor() {
    this.fixedFiles = 0
    this.totalErrors = 0
  }

  async fixRemainingImports() {
    console.log('🔧 Fixing remaining import issues...\n')
    
    // List of files that still have import issues
    const problemFiles = [
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/academy/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/analytics/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/banners/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/calendar/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/coaching/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/courses/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/enquiry/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/events/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/features/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/forecasts/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/new-notifications/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/notifications/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/reports/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/resources/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/settings/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/signals/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/tools/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/trade/page.tsx',
      '/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)/admin/users/page.tsx'
    ]

    for (const filePath of problemFiles) {
      await this.fixFile(filePath)
    }

    this.generateReport()
  }

  async fixFile(filePath) {
    try {
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  File not found: ${filePath}`)
        return
      }

      const content = fs.readFileSync(filePath, 'utf8')
      const relativePath = filePath.replace('/Volumes/BRYAN/PROJECTS/CoreFX/', '')
      
      // Check if this file actually has missing imports
      const missingImports = this.findActualMissingImports(content)
      
      if (missingImports.length > 0) {
        const fixedContent = this.fixImports(content, missingImports)
        
        if (fixedContent !== content) {
          fs.writeFileSync(filePath, fixedContent, 'utf8')
          console.log(`✅ Fixed ${missingImports.length} imports in ${relativePath}`)
          this.fixedFiles++
          this.totalErrors += missingImports.length
        } else {
          console.log(`ℹ️  No changes needed for ${relativePath}`)
        }
      } else {
        console.log(`✅ ${relativePath} already has all imports`)
      }

    } catch (error) {
      console.log(`❌ Error fixing ${filePath}:`, error.message)
    }
  }

  findActualMissingImports(content) {
    const missingImports = []
    
    // Find all used components
    const componentRegex = /<([A-Z][a-zA-Z0-9]*)/g
    const usedComponents = new Set()
    let match

    while ((match = componentRegex.exec(content)) !== null) {
      usedComponents.add(match[1])
    }

    // Common icons that might be missing
    const commonIcons = [
      'CheckCircle', 'AlertCircle', 'Zap', 'Code', 'HelpCircle',
      'Eye', 'EyeOff', 'Settings', 'Save', 'RefreshCw',
      'Shield', 'Palette', 'CreditCard', 'Globe', 'Mail',
      'Phone', 'MapPin', 'Link', 'ToggleLeft', 'ToggleRight',
      'TestTube', 'Plus', 'Edit', 'Trash2', 'Search', 'Filter'
    ]

    // Check which common icons are used but not imported
    for (const component of usedComponents) {
      if (commonIcons.includes(component)) {
        // More thorough check for imports
        const hasImport = content.includes(`import { ${component}`) || 
                         content.includes(`import ${component}`) ||
                         content.includes(`import * as ${component}`) ||
                         content.includes(`{ ${component}`) ||
                         content.includes(`${component},`) ||
                         content.includes(`, ${component}`)
        
        if (!hasImport) {
          missingImports.push(component)
        }
      }
    }

    return missingImports
  }

  fixImports(content, missingImports) {
    if (missingImports.length === 0) return content

    // Find existing lucide-react import
    const lucideImportRegex = /import\s+{([^}]+)}\s+from\s+['"]lucide-react['"]/g
    const lucideMatch = lucideImportRegex.exec(content)
    
    if (lucideMatch) {
      // Add missing imports to existing lucide-react import
      const existingImports = lucideMatch[1].split(',').map(imp => imp.trim())
      const allImports = [...new Set([...existingImports, ...missingImports])].sort()
      
      const newImport = `import { ${allImports.join(', ')} } from 'lucide-react'`
      return content.replace(lucideMatch[0], newImport)
    } else {
      // Create new lucide-react import
      const newImport = `import { ${missingImports.join(', ')} } from 'lucide-react'\n`
      
      // Find the best place to insert the import
      const lines = content.split('\n')
      let insertIndex = 0
      
      // Find the last import statement
      for (let i = 0; i < lines.length; i++) {
        if (lines[i].startsWith('import ')) {
          insertIndex = i + 1
        }
      }
      
      lines.splice(insertIndex, 0, newImport)
      return lines.join('\n')
    }
  }

  generateReport() {
    console.log('\n📋 REMAINING IMPORT FIX REPORT')
    console.log('===============================\n')
    
    console.log(`✅ Files Fixed: ${this.fixedFiles}`)
    console.log(`🔧 Total Imports Added: ${this.totalErrors}`)
    
    if (this.fixedFiles > 0) {
      console.log('\n🎉 Remaining import issues have been fixed!')
    } else {
      console.log('\n✅ No remaining import issues found!')
    }
  }
}

// Run fixes if this script is executed directly
if (require.main === module) {
  const fixer = new RemainingImportFixer()
  fixer.fixRemainingImports().catch(console.error)
}

module.exports = { RemainingImportFixer }
