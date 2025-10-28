const { execSync } = require('child_process');
const packageJson = require('./package.json');

const currentNodeVersion = execSync('node --version').toString().trim();
const majorVersion = parseInt(currentNodeVersion.replace('v', '').split('.')[0]);

const requiredVersion = 18;

if (majorVersion < requiredVersion) {
  console.error('\n❌ Node.js version error!');
  console.error(`Current version: ${currentNodeVersion}`);
  console.error(`Required version: v${requiredVersion}.0.0 or higher\n`);
  console.error('Please upgrade Node.js:');
  console.error('1. Visit https://nodejs.org/');
  console.error('2. Download and install the latest LTS version (v20+)');
  console.error('3. Restart your terminal and run "npm run dev" again\n');
  console.error('Or use nvm (Node Version Manager):');
  console.error('1. Install nvm from https://github.com/coreybutler/nvm-windows');
  console.error('2. Run: nvm install 20');
  console.error('3. Run: nvm use 20\n');
  process.exit(1);
}

console.log(`✓ Node.js version ${currentNodeVersion} is compatible`);


