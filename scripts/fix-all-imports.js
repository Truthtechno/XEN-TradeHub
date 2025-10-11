#!/usr/bin/env node

/**
 * Comprehensive import fixer for all pages and components
 */

const fs = require('fs')
const path = require('path')

class ImportFixer {
  constructor() {
    this.commonIcons = [
      'CheckCircle', 'AlertCircle', 'Zap', 'Code', 'HelpCircle',
      'Eye', 'EyeOff', 'Settings', 'Save', 'RefreshCw',
      'Shield', 'Palette', 'CreditCard', 'Globe', 'Mail',
      'Phone', 'MapPin', 'Link', 'ToggleLeft', 'ToggleRight',
      'TestTube', 'Plus', 'Edit', 'Trash2', 'Search', 'Filter',
      'Calendar', 'User', 'MessageCircle', 'Heart', 'BarChart3',
      'TrendingUp', 'TrendingDown', 'Camera', 'Bell'
    ]
    this.fixedFiles = 0
    this.totalErrors = 0
  }

  async fixAllImports() {
    console.log('🔧 Starting comprehensive import fixes...\n')
    
    try {
      // Fix admin pages
      await this.fixDirectory('/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)', 'admin')
      
      // Fix user pages
      await this.fixDirectory('/Volumes/BRYAN/PROJECTS/CoreFX/app/(authenticated)', 'user')
      
      // Fix components
      await this.fixDirectory('/Volumes/BRYAN/PROJECTS/CoreFX/components', 'component')
      
      // Generate report
      this.generateReport()
      
    } catch (error) {
      console.error('❌ Fix failed:', error.message)
    }
  }

  async fixDirectory(dirPath, type) {
    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️  Directory not found: ${dirPath}`)
      return
    }

    const files = this.getAllFiles(dirPath)
    
    for (const file of files) {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
        await this.fixFile(file, type)
      }
    }
  }

  getAllFiles(dirPath) {
    let files = []
    
    try {
      const items = fs.readdirSync(dirPath)
      
      for (const item of items) {
        const fullPath = path.join(dirPath, item)
        const stat = fs.statSync(fullPath)
        
        if (stat.isDirectory()) {
          files = files.concat(this.getAllFiles(fullPath))
        } else {
          files.push(fullPath)
        }
      }
    } catch (error) {
      console.log(`⚠️  Error reading directory ${dirPath}:`, error.message)
    }
    
    return files
  }

  async fixFile(filePath, type) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const relativePath = filePath.replace('/Volumes/BRYAN/PROJECTS/CoreFX/', '')
      
      // Check if this file has missing imports
      const missingImports = this.findMissingImports(content)
      
      if (missingImports.length > 0) {
        const fixedContent = this.fixImports(content, missingImports)
        
        if (fixedContent !== content) {
          fs.writeFileSync(filePath, fixedContent, 'utf8')
          console.log(`✅ Fixed ${missingImports.length} imports in ${relativePath}`)
          this.fixedFiles++
          this.totalErrors += missingImports.length
        }
      }

    } catch (error) {
      console.log(`❌ Error fixing ${filePath}:`, error.message)
    }
  }

  findMissingImports(content) {
    const missingImports = []
    
    // Find all used components
    const componentRegex = /<([A-Z][a-zA-Z0-9]*)/g
    const usedComponents = new Set()
    let match

    while ((match = componentRegex.exec(content)) !== null) {
      usedComponents.add(match[1])
    }

    // Check which common icons are used but not imported
    for (const component of usedComponents) {
      if (this.commonIcons.includes(component)) {
        const importExists = content.includes(`import { ${component}`) || 
                           content.includes(`import ${component}`) ||
                           content.includes(`import * as ${component}`)
        
        if (!importExists) {
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
    console.log('\n📋 IMPORT FIX REPORT')
    console.log('====================\n')
    
    console.log(`✅ Files Fixed: ${this.fixedFiles}`)
    console.log(`🔧 Total Imports Added: ${this.totalErrors}`)
    
    if (this.fixedFiles > 0) {
      console.log('\n🎉 All missing imports have been fixed!')
      console.log('\n📝 Common icons that were fixed:')
      this.commonIcons.forEach(icon => {
        console.log(`  • ${icon}`)
      })
    } else {
      console.log('\n✅ No import issues found!')
    }
  }
}

// Run fixes if this script is executed directly
if (require.main === module) {
  const fixer = new ImportFixer()
  fixer.fixAllImports().catch(console.error)
}

module.exports = { ImportFixer }
