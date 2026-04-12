#!/usr/bin/env node

/**
 * Verification script to check if the extension is properly configured
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 CSV & Excel Viewer Extension Verification\n');
console.log('=' .repeat(50));

let allChecksPassed = true;

// Check 1: Verify package.json
console.log('\n✓ Check 1: package.json Configuration');
console.log('-'.repeat(50));
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));

  // Check activation events
  const hasOpenFileCommand = packageJson.activationEvents.some(
    event => event.includes('onCommand:csvExcelViewer.openFile')
  );
  if (hasOpenFileCommand) {
    console.log('✓ openFile command registered in activationEvents');
  } else {
    console.log('✗ openFile command NOT found in activationEvents');
    allChecksPassed = false;
  }

  // Check commands
  const commands = packageJson.contributes?.commands || [];
  const hasOpenFile = commands.some(cmd => cmd.command === 'csvExcelViewer.openFile');
  if (hasOpenFile) {
    console.log('✓ openFile command registered in contributes.commands');
  } else {
    console.log('✗ openFile command NOT found in contributes.commands');
    allChecksPassed = false;
  }

  // Check languages
  const languages = packageJson.contributes?.languages || [];
  const hasCsvLang = languages.some(lang => lang.id === 'csv');
  if (hasCsvLang) {
    console.log('✓ CSV language registered');
  } else {
    console.log('✗ CSV language NOT registered');
    allChecksPassed = false;
  }

  // Check views
  const views = packageJson.contributes?.views;
  if (views && Object.keys(views).length > 0) {
    console.log('✓ Views container registered');
  } else {
    console.log('✗ Views container NOT registered');
    allChecksPassed = false;
  }

  // Check menus
  const menus = packageJson.contributes?.menus;
  if (menus && menus['explorer/context'] && menus['explorer/context'].length > 0) {
    console.log('✓ File context menu registered');
  } else {
    console.log('✗ File context menu NOT registered');
    allChecksPassed = false;
  }

} catch (error) {
  console.log('✗ Error reading package.json:', error.message);
  allChecksPassed = false;
}

// Check 2: Verify compiled extension
console.log('\n✓ Check 2: Compiled Extension');
console.log('-'.repeat(50));
try {
  const extensionPath = path.join(__dirname, 'out', 'extension.js');
  if (fs.existsSync(extensionPath)) {
    const extensionCode = fs.readFileSync(extensionPath, 'utf-8');

    // Check for key functions
    const hasParseCsv = extensionCode.includes('parseCSV');
    const hasParseExcel = extensionCode.includes('parseExcelFile');
    const hasOpenCsvViewer = extensionCode.includes('openCsvViewer');
    const hasOpenExcelViewer = extensionCode.includes('openExcelViewer');
    const hasOpenFileCommand = extensionCode.includes("registerCommand('csvExcelViewer.openFile'");

    if (hasParseCsv) console.log('✓ parseCSV function found');
    else {
      console.log('✗ parseCSV function NOT found');
      allChecksPassed = false;
    }

    if (hasParseExcel) console.log('✓ parseExcelFile function found');
    else {
      console.log('✗ parseExcelFile function NOT found');
      allChecksPassed = false;
    }

    if (hasOpenCsvViewer) console.log('✓ openCsvViewer function found');
    else {
      console.log('✗ openCsvViewer function NOT found');
      allChecksPassed = false;
    }

    if (hasOpenExcelViewer) console.log('✓ openExcelViewer function found');
    else {
      console.log('✗ openExcelViewer function NOT found');
      allChecksPassed = false;
    }

    if (hasOpenFileCommand) console.log('✓ openFile command registered');
    else {
      console.log('✗ openFile command NOT registered');
      allChecksPassed = false;
    }

  } else {
    console.log('✗ Extension file NOT found');
    allChecksPassed = false;
  }
} catch (error) {
  console.log('✗ Error reading compiled extension:', error.message);
  allChecksPassed = false;
}

// Check 3: Verify resources
console.log('\n✓ Check 3: Extension Resources');
console.log('-'.repeat(50));
const resourcesDir = path.join(__dirname, 'resources');

if (fs.existsSync(resourcesDir)) {
  const files = fs.readdirSync(resourcesDir);
  console.log(`✓ Resources directory exists with ${files.length} file(s)`);

  // Check file icons
  const iconDir = path.join(resourcesDir, 'file-icons');
  if (fs.existsSync(iconDir)) {
    const iconFiles = fs.readdirSync(iconDir);
    const hasCsvIcons = iconFiles.some(f => f.includes('csv'));
    const hasExcelIcons = iconFiles.some(f => f.includes('excel'));

    if (hasCsvIcons) console.log('✓ CSV icons found');
    else {
      console.log('✗ CSV icons NOT found');
      allChecksPassed = false;
    }

    if (hasExcelIcons) console.log('✓ Excel icons found');
    else {
      console.log('✗ Excel icons NOT found');
      allChecksPassed = false;
    }
  } else {
    console.log('✗ File icons directory NOT found');
    allChecksPassed = false;
  }

  // Check main icon
  const hasMainIcon = files.includes('icon.svg');
  if (hasMainIcon) console.log('✓ Main icon found');
  else {
    console.log('✗ Main icon NOT found');
    allChecksPassed = false;
  }
} else {
  console.log('✗ Resources directory NOT found');
  allChecksPassed = false;
}

// Check 4: Sample files
console.log('\n✓ Check 4: Sample Files');
console.log('-'.repeat(50));
const sampleCsv = path.join(__dirname, 'sample.csv');
const sampleXlsx = path.join(__dirname, 'sample.xlsx');

if (fs.existsSync(sampleCsv)) {
  const stats = fs.statSync(sampleCsv);
  console.log(`✓ sample.csv exists (${(stats.size / 1024).toFixed(2)} KB)`);
} else {
  console.log('✗ sample.csv NOT found');
  allChecksPassed = false;
}

if (fs.existsSync(sampleXlsx)) {
  const stats = fs.statSync(sampleXlsx);
  console.log(`✓ sample.xlsx exists (${(stats.size / 1024).toFixed(2)} KB)`);
} else {
  console.log('✗ sample.xlsx NOT found');
  allChecksPassed = false;
}

// Final result
console.log('\n' + '='.repeat(50));
if (allChecksPassed) {
  console.log('✅ ALL CHECKS PASSED!');
  console.log('\nNext steps:');
  console.log('1. Reload VS Code (Ctrl+Shift+P → "Developer: Reload Window")');
  console.log('2. Open a CSV/Excel file');
  console.log('3. Right-click the file and select "Open in CSV/Excel Viewer"');
  console.log('4. The file should display in a table format!');
} else {
  console.log('❌ SOME CHECKS FAILED');
  console.log('\nPlease fix the issues above before testing.');
}
console.log('='.repeat(50));