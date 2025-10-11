const fs = require('fs');
const path = require('path');

// List of admin API files to update
const adminApiFiles = [
  'app/api/admin/signals/route.ts',
  'app/api/admin/courses/route.ts',
  'app/api/admin/resources/route.ts',
  'app/api/admin/events/route.ts',
  'app/api/admin/notifications/route.ts',
  'app/api/admin/dashboard/stats/route.ts',
  'app/api/admin/polls/route.ts',
  'app/api/admin/trade/registrations/route.ts',
  'app/api/admin/trade/links/route.ts',
  'app/api/admin/subscription-stats/route.ts',
  'app/api/admin/activity-notifications/route.ts',
  'app/api/admin/reports/overview/route.ts',
  'app/api/admin/reports/charts/route.ts',
  'app/api/admin/reports/export/route.ts',
  'app/api/admin/reports/[type]/route.ts'
];

function updateFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Check if file already uses the new auth
    if (content.includes('getAuthenticatedUserSimpleFix')) {
      console.log(`File already updated: ${filePath}`);
      return true;
    }

    // Update import
    content = content.replace(
      /import { getAuthenticatedUserSimple } from '@\/lib\/auth-simple'/g,
      "import { getAuthenticatedUserSimpleFix } from '@/lib/simple-auth-fix'"
    );

    // Update function calls
    content = content.replace(
      /getAuthenticatedUserSimple\(/g,
      'getAuthenticatedUserSimpleFix('
    );

    // Write back to file
    fs.writeFileSync(filePath, content);
    console.log(`Updated: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error.message);
    return false;
  }
}

console.log('Updating admin API authentication...');

let updated = 0;
let failed = 0;

adminApiFiles.forEach(filePath => {
  if (updateFile(filePath)) {
    updated++;
  } else {
    failed++;
  }
});

console.log(`\nUpdate complete:`);
console.log(`- Updated: ${updated} files`);
console.log(`- Failed: ${failed} files`);
