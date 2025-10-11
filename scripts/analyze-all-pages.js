#!/usr/bin/env node

/**
 * Comprehensive page analyzer to find all errors and issues
 */

const fs = require('fs')
const path = require('path')

class PageAnalyzer {
  constructor() {
    this.errors = []
    this.warnings = []
    this.pages = []
    this.components = []
  }

  async analyzeAllPages() {
    console.log('🔍 Starting comprehensive page analysis...\n')
    
    try {
      // Analyze admin pages
      await this.analyzeDirectory('/Volumes/BRYAN/PROJECTS/CoreFX/app/(admin)', 'admin')
      
      // Analyze user pages
      await this.analyzeDirectory('/Volumes/BRYAN/PROJECTS/CoreFX/app/(authenticated)', 'user')
      
      // Analyze components
      await this.analyzeDirectory('/Volumes/BRYAN/PROJECTS/CoreFX/components', 'component')
      
      // Analyze API routes
      await this.analyzeDirectory('/Volumes/BRYAN/PROJECTS/CoreFX/app/api', 'api')
      
      // Generate report
      this.generateReport()
      
    } catch (error) {
      console.error('❌ Analysis failed:', error.message)
    }
  }

  async analyzeDirectory(dirPath, type) {
    if (!fs.existsSync(dirPath)) {
      console.log(`⚠️  Directory not found: ${dirPath}`)
      return
    }

    const files = this.getAllFiles(dirPath)
    
    for (const file of files) {
      if (file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.jsx') || file.endsWith('.js')) {
        await this.analyzeFile(file, type)
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

  async analyzeFile(filePath, type) {
    try {
      const content = fs.readFileSync(filePath, 'utf8')
      const relativePath = filePath.replace('/Volumes/BRYAN/PROJECTS/CoreFX/', '')
      
      const fileInfo = {
        path: relativePath,
        type: type,
        errors: [],
        warnings: [],
        imports: [],
        exports: [],
        components: []
      }

      // Check for common errors
      this.checkImportErrors(content, fileInfo)
      this.checkUndefinedComponents(content, fileInfo)
      this.checkSyntaxErrors(content, fileInfo)
      this.checkMissingDependencies(content, fileInfo)
      this.checkUnusedImports(content, fileInfo)
      this.checkConsoleErrors(content, fileInfo)
      this.checkTypeErrors(content, fileInfo)

      if (fileInfo.errors.length > 0 || fileInfo.warnings.length > 0) {
        this.pages.push(fileInfo)
      }

    } catch (error) {
      this.errors.push({
        file: filePath.replace('/Volumes/BRYAN/PROJECTS/CoreFX/', ''),
        type: 'file_read_error',
        message: error.message
      })
    }
  }

  checkImportErrors(content, fileInfo) {
    // Check for missing imports
    const importRegex = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g
    const imports = []
    let match

    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1])
    }

    // Check for used components that might not be imported
    const componentRegex = /<([A-Z][a-zA-Z0-9]*)/g
    const usedComponents = []
    
    while ((match = componentRegex.exec(content)) !== null) {
      usedComponents.push(match[1])
    }

    // Check for common missing imports
    const commonComponents = [
      'CheckCircle', 'AlertCircle', 'Zap', 'Code', 'HelpCircle',
      'Eye', 'EyeOff', 'Settings', 'Save', 'RefreshCw',
      'Shield', 'Palette', 'CreditCard', 'Globe', 'Mail',
      'Phone', 'MapPin', 'Link', 'ToggleLeft', 'ToggleRight',
      'TestTube', 'Plus', 'Edit', 'Trash2', 'Search', 'Filter'
    ]

    for (const component of usedComponents) {
      if (commonComponents.includes(component)) {
        const importExists = content.includes(`import { ${component}`) || 
                           content.includes(`import ${component}`) ||
                           content.includes(`import * as ${component}`)
        
        if (!importExists) {
          fileInfo.errors.push({
            type: 'missing_import',
            component: component,
            message: `Component '${component}' is used but not imported`
          })
        }
      }
    }
  }

  checkUndefinedComponents(content, fileInfo) {
    // Check for undefined components
    const undefinedRegex = /ReferenceError:\s*(\w+)\s+is not defined/g
    let match

    while ((match = undefinedRegex.exec(content)) !== null) {
      fileInfo.errors.push({
        type: 'undefined_component',
        component: match[1],
        message: `Component '${match[1]}' is not defined`
      })
    }
  }

  checkSyntaxErrors(content, fileInfo) {
    // Check for common syntax errors
    const syntaxErrors = [
      { pattern: /import\s+{[^}]*}\s+from\s+['"][^'"]*['"]\s*;?\s*$/gm, message: 'Missing semicolon after import' },
      { pattern: /export\s+default\s+function\s+\w+\s*\([^)]*\)\s*{/gm, message: 'Missing opening brace in function' },
      { pattern: /<[^>]*>\s*$/gm, message: 'Unclosed JSX tag' },
      { pattern: /console\.log\([^)]*$/gm, message: 'Unclosed console.log' }
    ]

    for (const error of syntaxErrors) {
      if (error.pattern.test(content)) {
        fileInfo.warnings.push({
          type: 'syntax_warning',
          message: error.message
        })
      }
    }
  }

  checkMissingDependencies(content, fileInfo) {
    // Check for missing dependencies
    const dependencyRegex = /from\s+['"]([^'"]+)['"]/g
    const dependencies = []
    let match

    while ((match = dependencyRegex.exec(content)) !== null) {
      dependencies.push(match[1])
    }

    // Check for common missing dependencies
    const commonDeps = [
      '@/components/ui/card',
      '@/components/ui/button',
      '@/components/ui/input',
      '@/components/ui/badge',
      '@/lib/settings-context',
      '@/lib/prisma',
      'lucide-react',
      'next/link',
      'next/navigation'
    ]

    for (const dep of dependencies) {
      if (commonDeps.includes(dep)) {
        // This would need to check if the file actually exists
        // For now, we'll just note it
      }
    }
  }

  checkUnusedImports(content, fileInfo) {
    // Check for potentially unused imports
    const importRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]+)['"]/g
    let match

    while ((match = importRegex.exec(content)) !== null) {
      const imports = match[1].split(',').map(imp => imp.trim())
      const source = match[2]

      for (const imp of imports) {
        const cleanImport = imp.replace(/\s+as\s+\w+/, '').trim()
        const usageRegex = new RegExp(`<${cleanImport}|\\b${cleanImport}\\b`, 'g')
        
        if (!usageRegex.test(content)) {
          fileInfo.warnings.push({
            type: 'unused_import',
            import: cleanImport,
            source: source,
            message: `Import '${cleanImport}' might be unused`
          })
        }
      }
    }
  }

  checkConsoleErrors(content, fileInfo) {
    // Check for console errors
    const consoleRegex = /console\.(error|warn)\(/g
    if (consoleRegex.test(content)) {
      fileInfo.warnings.push({
        type: 'console_usage',
        message: 'Console errors/warnings found in code'
      })
    }
  }

  checkTypeErrors(content, fileInfo) {
    // Check for TypeScript errors
    const typeErrors = [
      { pattern: /any\s*\[\]/g, message: 'Use of any[] type' },
      { pattern: /:\s*any\b/g, message: 'Use of any type' },
      { pattern: /@ts-ignore/g, message: 'TypeScript ignore comment found' }
    ]

    for (const error of typeErrors) {
      if (error.pattern.test(content)) {
        fileInfo.warnings.push({
          type: 'type_warning',
          message: error.message
        })
      }
    }
  }

  generateReport() {
    console.log('📋 COMPREHENSIVE PAGE ANALYSIS REPORT')
    console.log('=====================================\n')

    if (this.pages.length === 0) {
      console.log('✅ No errors or warnings found!')
      return
    }

    // Group by type
    const adminPages = this.pages.filter(p => p.type === 'admin')
    const userPages = this.pages.filter(p => p.type === 'user')
    const components = this.pages.filter(p => p.type === 'component')
    const apis = this.pages.filter(p => p.type === 'api')

    console.log(`📊 Analysis Summary:`)
    console.log(`  Admin Pages: ${adminPages.length} with issues`)
    console.log(`  User Pages: ${userPages.length} with issues`)
    console.log(`  Components: ${components.length} with issues`)
    console.log(`  API Routes: ${apis.length} with issues`)
    console.log(`  Total Files: ${this.pages.length} with issues\n`)

    // Report errors by category
    this.reportByCategory('Admin Pages', adminPages)
    this.reportByCategory('User Pages', userPages)
    this.reportByCategory('Components', components)
    this.reportByCategory('API Routes', apis)

    // Summary
    const totalErrors = this.pages.reduce((sum, page) => sum + page.errors.length, 0)
    const totalWarnings = this.pages.reduce((sum, page) => sum + page.warnings.length, 0)

    console.log(`\n🎯 Summary:`)
    console.log(`  Total Errors: ${totalErrors}`)
    console.log(`  Total Warnings: ${totalWarnings}`)
    console.log(`  Files with Issues: ${this.pages.length}`)

    if (totalErrors > 0) {
      console.log(`\n❌ ${totalErrors} errors need to be fixed`)
    }
    if (totalWarnings > 0) {
      console.log(`⚠️  ${totalWarnings} warnings should be reviewed`)
    }
  }

  reportByCategory(title, pages) {
    if (pages.length === 0) return

    console.log(`\n📁 ${title}:`)
    console.log('─'.repeat(50))

    for (const page of pages) {
      console.log(`\n📄 ${page.path}`)
      
      if (page.errors.length > 0) {
        console.log('  ❌ Errors:')
        for (const error of page.errors) {
          console.log(`    • ${error.message}`)
          if (error.component) {
            console.log(`      Component: ${error.component}`)
          }
        }
      }

      if (page.warnings.length > 0) {
        console.log('  ⚠️  Warnings:')
        for (const warning of page.warnings) {
          console.log(`    • ${warning.message}`)
          if (warning.import) {
            console.log(`      Import: ${warning.import}`)
          }
        }
      }
    }
  }
}

// Run analysis if this script is executed directly
if (require.main === module) {
  const analyzer = new PageAnalyzer()
  analyzer.analyzeAllPages().catch(console.error)
}

module.exports = { PageAnalyzer }
