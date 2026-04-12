# CSV & Excel Viewer

A lightweight VS Code extension for viewing CSV and Excel files without external dependencies.

## Features

- 📊 View CSV files with proper parsing (handles quoted fields)
- 📈 View Excel (.xlsx) files by parsing the XML structure
- 🔍 Basic search/filter functionality
- 📱 Responsive table design with sticky headers
- 🚀 No external dependencies required
- 🎨 Dark theme optimized for VS Code

## Installation

1. Clone or download this repository
2. Open the project in VS Code
3. Press F5 to launch the extension development host
4. Open a CSV or Excel file to test the viewer

## Usage

### Opening Files

1. Click on the CSV/Excel Viewer icon in the Activity Bar
2. Click "Open File" to select a CSV or Excel file
3. The file will be displayed in a webview panel

### Keyboard Shortcuts

- Use the search box in the viewer to filter data
- Scroll within the table to view more data

## File Formats Supported

- **CSV**: Comma-separated values with optional quote handling
- **Excel (.xlsx)**: XML-based spreadsheet format

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- VS Code with the TypeScript extension

### Building

```bash
npm install
npm run compile
```

### Running Tests

```bash
npm test
```

### Packaging

```bash
npm run package
```

This will create a `.vsix` file that can be installed in VS Code.

## Technical Details

### CSV Parsing

The extension implements a custom CSV parser that:
- Handles quoted fields with commas inside quotes
- Preserves whitespace and formatting
- Supports both Windows and Unix line endings

### Excel (.xlsx) Parsing

The extension parses .xlsx files by:
- Extracting the ZIP archive structure
- Decompressing XML files using zlib
- Parsing the XML content with a custom XML parser
- Building a 2D array representation of the spreadsheet

## Limitations

- Large files may be slow to load
- Complex Excel formulas are not evaluated
- Only .xlsx format is supported (not .xls)
- Conditional formatting is not displayed

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.