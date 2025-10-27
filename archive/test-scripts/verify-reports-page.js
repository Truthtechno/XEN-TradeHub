#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying Reports Page Syntax...\n');

const filePath = path.join(__dirname, 'app/(admin)/admin/reports/page.tsx');
const content = fs.readFileSync(filePath, 'utf8');

// Check for basic syntax issues
const checks = [
  {
    name: 'File exists',
    test: () => fs.existsSync(filePath),
    error: 'File not found'
  },
  {
    name: 'Has export default',
    test: () => content.includes('export default function ReportsPage()'),
    error: 'Missing export default function'
  },
  {
    name: 'Has proper imports',
    test: () => content.includes("'use client'") && content.includes('import React'),
    error: 'Missing required imports'
  },
  {
    name: 'Conditional rendering syntax',
    test: () => {
      const pattern = /\{\(reportType === 'overview' \|\| reportType === '\w+'\) && \(/g;
      const matches = content.match(pattern);
      return matches && matches.length >= 10;
    },
    error: 'Conditional rendering syntax issues'
  },
  {
    name: 'Balanced parentheses',
    test: () => {
      let count = 0;
      for (let char of content) {
        if (char === '(') count++;
        if (char === ')') count--;
        if (count < 0) return false;
      }
      return count === 0;
    },
    error: 'Unbalanced parentheses'
  },
  {
    name: 'Balanced curly braces',
    test: () => {
      let count = 0;
      for (let char of content) {
        if (char === '{') count++;
        if (char === '}') count--;
        if (count < 0) return false;
      }
      return count === 0;
    },
    error: 'Unbalanced curly braces'
  },
  {
    name: 'Balanced JSX tags',
    test: () => {
      const openDivs = (content.match(/<div/g) || []).length;
      const closeDivs = (content.match(/<\/div>/g) || []).length;
      return openDivs === closeDivs;
    },
    error: 'Unbalanced div tags'
  },
  {
    name: 'Card components properly closed',
    test: () => {
      const openCards = (content.match(/<Card/g) || []).length;
      const closeCards = (content.match(/<\/Card>/g) || []).length;
      return openCards === closeCards;
    },
    error: 'Unbalanced Card components'
  }
];

let passed = 0;
let failed = 0;

checks.forEach(check => {
  try {
    if (check.test()) {
      console.log(`✅ ${check.name}`);
      passed++;
    } else {
      console.log(`❌ ${check.name}: ${check.error}`);
      failed++;
    }
  } catch (error) {
    console.log(`❌ ${check.name}: ${error.message}`);
    failed++;
  }
});

console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed === 0) {
  console.log('✅ All syntax checks passed!');
  console.log('📝 The file appears to be syntactically correct.');
  console.log('\n🔄 Next steps:');
  console.log('   1. Stop dev server (Ctrl+C)');
  console.log('   2. Run: rm -rf .next');
  console.log('   3. Run: npm run dev');
  console.log('   4. Hard refresh browser (Cmd+Shift+R)\n');
  process.exit(0);
} else {
  console.log('❌ Syntax issues detected!');
  console.log('📝 Please review the errors above.\n');
  process.exit(1);
}
