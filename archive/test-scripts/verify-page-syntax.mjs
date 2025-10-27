import { readFileSync } from 'fs';

console.log('🔍 Verifying Reports Page Syntax...\n');

const content = readFileSync('app/(admin)/admin/reports/page.tsx', 'utf8');

// Count braces and parentheses
const openBraces = (content.match(/{/g) || []).length;
const closeBraces = (content.match(/}/g) || []).length;
const openParens = (content.match(/\(/g) || []).length;
const closeParens = (content.match(/\)/g) || []).length;
const openAngle = (content.match(/</g) || []).length;
const closeAngle = (content.match(/>/g) || []).length;

console.log('📊 Syntax Balance Check:');
console.log(`  Braces: ${openBraces} open, ${closeBraces} close - ${openBraces === closeBraces ? '✅' : '❌'}`);
console.log(`  Parens: ${openParens} open, ${closeParens} close - ${openParens === closeParens ? '✅' : '❌'}`);
console.log(`  Angles: ${openAngle} open, ${closeAngle} close - ${openAngle === closeAngle ? '✅' : '❌'}`);

const balanced = openBraces === closeBraces && openParens === closeParens;

console.log(`\n${balanced ? '✅ Syntax appears balanced!' : '❌ Syntax imbalance detected!'}`);

if (balanced) {
  console.log('\n📝 Next: Check if dev server compiles without errors');
  console.log('   Run: npm run dev');
  console.log('   Then check terminal for compilation errors\n');
} else {
  console.log('\n⚠️  There may still be syntax issues\n');
}

process.exit(balanced ? 0 : 1);
