# How to Reload the CSV & Excel Viewer Extension

## Important: You Must Reload VS Code After Updates

Since we've updated the extension with new features (file context menu, icons, language support), you need to reload VS Code to activate these changes.

## Step-by-Step Instructions

### Step 1: Reload VS Code

**Method A: Quick Reload (Recommended)**
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type `Developer: Reload Window`
3. Press Enter

**Method B: Full Restart**
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type `Developer: Restart Extension Host`
3. Press Enter

### Step 2: Verify Extension is Active

1. Open the **Extensions** panel (Ctrl+Shift+X or Cmd+Shift+X)
2. Search for "CSV & Excel Viewer"
3. You should see it listed
4. Click on it to see the details

### Step 3: Test the Extension

#### Test Option A: Using the Activity Bar
1. Look for the **CSV/Excel Viewer** icon (📊) in the Activity Bar on the left
2. Click on it
3. You should see an empty "File Viewer" panel

#### Test Option B: Using the Context Menu (New!)
1. Open a CSV file in VS Code
2. Right-click on the file in the **Explorer** panel
3. You should now see **"Open in CSV/Excel Viewer"** in the context menu
4. Click on it to open the file in the viewer

#### Test Option C: Using Commands
1. Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
2. Type "CSV & Excel Viewer"
3. You should see:
   - **"Open CSV Viewer"** - Opens a new CSV viewer panel
   - **"Open Excel Viewer"** - Opens a new Excel viewer panel
   - **"Open in CSV/Excel Viewer"** - Opens the current file in the viewer

### Step 4: Test with Sample Files

1. Open `sample.csv` from your project folder
2. Right-click on it in the Explorer
3. Select **"Open in CSV/Excel Viewer"**
4. The file should now display in a table format with rows and columns

## Troubleshooting

### Extension Not Showing in Context Menu

**Problem:** Right-click menu doesn't show "Open in CSV/Excel Viewer"

**Solution:**
1. Reload VS Code completely (Ctrl+Shift+P → "Developer: Reload Window")
2. Make sure the file is a `.csv` file
3. Check that the extension is properly installed

### File Opens as Text Instead of Table

**Problem:** File opens in the default text editor instead of the CSV viewer

**Solution:**
1. Reload VS Code
2. Try using the Activity Bar icon instead
3. Try using the command palette (Ctrl+Shift+P)
4. Make sure you're using the updated .vsix file

### Activity Bar Icon Not Visible

**Problem:** No CSV/Excel Viewer icon in the Activity Bar

**Solution:**
1. Check if the extension is enabled in the Extensions panel
2. Click the "..." menu in the Activity Bar and ensure "CSV/Excel Viewer" is checked
3. Reload VS Code if needed

### Errors When Opening Files

**Problem:** Error message when trying to open a file

**Solution:**
1. Check the **Output** panel (View → Output → Select "CSV & Excel Viewer")
2. Look for error messages in the console
3. Make sure the file is not corrupted
4. Try with a smaller sample file first

## What's New in This Version

### Enhanced Features
- ✅ **File Context Menu**: Right-click any CSV/Excel file to open it in the viewer
- ✅ **CSV Language Support**: VS Code now recognizes .csv files as CSV language
- ✅ **File Icons**: Custom icons for CSV and Excel files
- ✅ **Better Activation**: Extension activates when you open CSV/Excel files
- ✅ **Command Palette Integration**: Easy access to all viewer commands

### File Icons
- **CSV files**: Green icon
- **Excel files**: Blue icon
- Icons work in both light and dark themes

## How to Uninstall and Reinstall (If Needed)

If the extension isn't working properly:

1. **Uninstall:**
   - Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
   - Type "Extensions: Install Extensions"
   - Search for "CSV & Excel Viewer"
   - Click the trash icon to uninstall

2. **Reinstall:**
   - Go to the project folder
   - Run: `npm run package`
   - In VS Code, press `Ctrl+Shift+P`
   - Type "Extensions: Install from VSIX..."
   - Select `csv-excel-viewer-1.0.0.vsix`
   - Reload VS Code

## Debug Mode

To see what's happening in the extension:

1. Open the **Output** panel (View → Output)
2. Select **CSV & Excel Viewer** from the dropdown
3. Try opening a file
4. You should see debug messages in the output

## Need Help?

If you're still having issues:

1. Check the **Output** panel for error messages
2. Verify the extension is enabled in the Extensions panel
3. Ensure VS Code version is 1.60.0 or higher
4. Try with the sample files provided in the project

---

**Remember:** Always reload VS Code after installing or updating extensions!