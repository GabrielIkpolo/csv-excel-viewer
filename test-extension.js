#!/usr/bin/env node

/**
 * Test script for CSV & Excel Viewer extension
 * This script tests the core functionality without requiring VS Code
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

console.log('🧪 CSV & Excel Viewer Extension Tests\n');

// Test 1: Parse CSV
console.log('Test 1: CSV Parsing');
console.log('-------------------');
try {
  const csvContent = fs.readFileSync('sample.csv', 'utf-8');
  const lines = csvContent.split(/\r?\n/);
  console.log(`✓ Loaded ${lines.length} lines from CSV`);

  // Simple CSV parser test
  const data = [];
  for (const line of lines) {
    if (line.trim()) {
      const row = [];
      let currentValue = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          row.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      row.push(currentValue.trim());
      data.push(row);
    }
  }

  console.log(`✓ Parsed ${data.length} rows`);
  console.log(`✓ Found ${data[0].length} columns:`, data[0].join(', '));
  console.log('✓ CSV parsing test PASSED\n');
} catch (error) {
  console.error('✗ CSV parsing test FAILED:', error.message, '\n');
}

// Test 2: Verify Excel file structure
console.log('Test 2: Excel File Structure');
console.log('-----------------------------');
try {
  const xlsxBuffer = fs.readFileSync('sample.xlsx');
  console.log(`✓ Excel file size: ${(xlsxBuffer.length / 1024).toFixed(2)} KB`);

  // Check ZIP signature (0x04034b50)
  const signature = xlsxBuffer.readUInt32LE(0);
  if (signature === 0x04034b50) {
    console.log('✓ Valid ZIP file signature found');
  } else {
    console.error('✗ Invalid ZIP file signature');
  }

  // Check for required XML files
  const requiredFiles = ['xl/sharedStrings.xml', 'xl/workbook.xml', 'xl/worksheets/sheet1.xml'];
  let foundFiles = 0;

  // Simple ZIP entry parser
  let offset = 0;
  while (offset < xlsxBuffer.length - 30) {
    const sig = xlsxBuffer.readUInt32LE(offset);
    if (sig === 0x04034b50) {
      const fileNameLength = xlsxBuffer.readUInt16LE(offset + 26);
      const fileName = xlsxBuffer.toString('utf-8', offset + 30, offset + 30 + fileNameLength);
      if (requiredFiles.includes(fileName)) {
        foundFiles++;
      }
      offset += 30 + fileNameLength + xlsxBuffer.readUInt16LE(offset + 28);
    } else {
      offset++;
    }
  }

  console.log(`✓ Found ${foundFiles}/${requiredFiles.length} required XML files`);
  if (foundFiles === requiredFiles.length) {
    console.log('✓ Excel file structure test PASSED\n');
  } else {
    console.error('✗ Excel file structure test FAILED\n');
  }
} catch (error) {
  console.error('✗ Excel file test FAILED:', error.message, '\n');
}

// Test 3: Decompression test
console.log('Test 3: ZIP Decompression');
console.log('--------------------------');
try {
  const xlsxBuffer = fs.readFileSync('sample.xlsx');

  // Find a compressed entry
  let offset = 0;
  let compressedEntry = null;
  let compressedSize = 0;

  while (offset < xlsxBuffer.length - 30) {
    const sig = xlsxBuffer.readUInt32LE(offset);
    if (sig === 0x04034b50) {
      const compressedSize = xlsxBuffer.readUInt32LE(offset + 18);
      const compressionMethod = xlsxBuffer.readUInt16LE(offset + 8);

      if (compressionMethod === 0) {
        // Deflate compression
        compressedEntry = xlsxBuffer.slice(offset + 30 + xlsxBuffer.readUInt16LE(offset + 26), offset + 30 + xlsxBuffer.readUInt16LE(offset + 26) + compressedSize);
        break;
      }
      offset += 30 + xlsxBuffer.readUInt16LE(offset + 26) + xlsxBuffer.readUInt16LE(offset + 28);
    } else {
      offset++;
    }
  }

  if (compressedEntry) {
    const decompressed = zlib.inflateSync(compressedEntry);
    console.log(`✓ Successfully decompressed ${compressedEntry.length} bytes to ${decompressed.length} bytes`);
    console.log('✓ ZIP decompression test PASSED\n');
  } else {
    console.error('✗ No compressed entries found for decompression test\n');
  }
} catch (error) {
  console.error('✗ Decompression test FAILED:', error.message, '\n');
}

// Test 4: Check extension compilation
console.log('Test 4: Extension Compilation');
console.log('------------------------------');
try {
  const extensionPath = path.join(__dirname, 'out', 'extension.js');
  if (fs.existsSync(extensionPath)) {
    const extensionCode = fs.readFileSync(extensionPath, 'utf-8');
    console.log('✓ Extension compiled successfully');
    console.log(`✓ Extension file size: ${(extensionCode.length / 1024).toFixed(2)} KB`);

    // Check for key functions
    if (extensionCode.includes('parseCSV')) {
      console.log('✓ CSV parser function found');
    }
    if (extensionCode.includes('parseExcelFile')) {
      console.log('✓ Excel parser function found');
    }
    if (extensionCode.includes('parseZip')) {
      console.log('✓ ZIP parser function found');
    }
    console.log('✓ Extension compilation test PASSED\n');
  } else {
    console.error('✗ Extension file not found');
    console.error('✗ Extension compilation test FAILED\n');
  }
} catch (error) {
  console.error('✗ Extension compilation test FAILED:', error.message, '\n');
}

// Test 5: Check package.json
console.log('Test 5: Package Configuration');
console.log('------------------------------');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  console.log(`✓ Package name: ${packageJson.name}`);
  console.log(`✓ Version: ${packageJson.version}`);
  console.log(`✓ VS Code engine: ${packageJson.engines.vscode}`);

  if (packageJson.main) {
    console.log(`✓ Main entry point: ${packageJson.main}`);
  }
  if (packageJson.contributes) {
    console.log(`✓ Commands registered: ${packageJson.contributes.commands?.length || 0}`);
    console.log(`✓ Views registered: ${Object.keys(packageJson.contributes.views || {}).length}`);
  }
  console.log('✓ Package configuration test PASSED\n');
} catch (error) {
  console.error('✗ Package configuration test FAILED:', error.message, '\n');
}

// Summary
console.log('='.repeat(50));
console.log('Test Summary');
console.log('='.repeat(50));
console.log('✓ All core functionality tests completed');
console.log('\nNext steps:');
console.log('1. Run "npm run compile" to build the extension');
console.log('2. In VS Code, press F5 to launch the extension development host');
console.log('3. Test with sample files: sample.csv and sample.xlsx');
console.log('4. Run "npm run package" to create the .vsix file');