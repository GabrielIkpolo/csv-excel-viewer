# CSV & Excel Viewer - Installation Guide

## Installation Methods

### Method 1: Install from VSIX File (Recommended for Development)

1. **Build the extension:**
   ```bash
   npm install
   npm run compile
   ```

2. **Package the extension:**
   ```bash
   npm run package
   ```

3. **Install the .vsix file in VS Code:**
   - Open VS Code
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Extensions: Install from VSIX..."
   - Select the `csv-excel-viewer-1.0.0.vsix` file
   - Reload VS Code if prompted

### Method 2: Install from Marketplace (Coming Soon)

Once the extension is published to the VS Code Marketplace, you can install it directly:
1. Open VS Code
2. Press `Ctrl+Shift+X` (or `Cmd+Shift+X` on Mac)
3. Search for "CSV & Excel Viewer"
4. Click Install

## Verification

After installation, verify the extension is working:

1. **Check the Activity Bar:**
   - Look for the CSV/Excel Viewer icon (📊) on the left side
   - Click it to open the viewer panel

2. **Test with Sample Files:**
   - Open `sample.csv` in VS Code
   - The file should be displayed in the CSV Viewer panel
   - Test with `sample.xlsx` as well

3. **Test Commands:**
   - Press `Ctrl+Shift+P` and type "CSV & Excel Viewer"
   - You should see two commands:
     - "Open CSV Viewer"
     - "Open Excel Viewer"

## Features

### CSV Viewer
- ✅ View CSV files with proper parsing
- ✅ Handle quoted fields with commas
- ✅ Search and filter functionality
- ✅ Responsive table design
- ✅ Sticky headers for easy navigation

### Excel Viewer
- ✅ View .xlsx files
- ✅ Parse ZIP archive structure
- ✅ Extract and display XML data
- ✅ Handle shared strings
- ✅ Search and filter functionality

## Troubleshooting

### Extension not appearing in Activity Bar
- Ensure you've reloaded VS Code after installation
- Check that you're using VS Code version 1.60.0 or higher

### Files not loading
- Ensure the file format is supported (.csv or .xlsx)
- Check that the file is not corrupted
- Verify you have read permissions for the file

### Large files performance
- The extension may struggle with very large files (>10,000 rows)
- For best performance, use files under 1MB

## Development

### Running in Development Mode

1. Open the project in VS Code
2. Press `F5` to launch the Extension Development Host
3. A new VS Code window will open with the extension loaded
4. Test the extension in this window
5. Make changes to the source code and it will automatically recompile

### Building for Production

```bash
npm run compile    # Compile TypeScript
npm run package    # Create .vsix file
```

### Testing

Run the test suite:
```bash
node test-extension.js
```

## Uninstallation

To uninstall the extension:

1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "Extensions: Install Extensions"
3. Search for "CSV & Excel Viewer"
4. Click the trash icon to uninstall

## Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the README.md for usage instructions
3. Run the test suite to verify core functionality
4. Open an issue on the project repository

## License

MIT License - See LICENSE file for details