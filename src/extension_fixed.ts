import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as zlib from 'zlib';
import * as xml2js from 'xml2js';

let csvViewerPanel: vscode.WebviewPanel | null = null;
let excelViewerPanel: vscode.WebviewPanel | null = null;
let currentCsvData: string[][] | null = null;
let currentExcelData: string[][] | null = null;

export function activate(context: vscode.ExtensionContext) {
  console.log('CSV & Excel Viewer extension is now active!');

  // Register the CSV viewer command
  const openCsvCommand = vscode.commands.registerCommand('csvExcelViewer.openCsv', () => {
    openCsvViewer();
  });

  // Register the Excel viewer command
  const openExcelCommand = vscode.commands.registerCommand('csvExcelViewer.openExcel', () => {
    openExcelViewer();
  });

  // Register the open file command
  const openFileCommand = vscode.commands.registerCommand('csvExcelViewer.openFile', async (uri?: vscode.Uri) => {
    if (uri) {
      const ext = path.extname(uri.fsPath).toLowerCase();
      if (ext === '.csv') {
        openCsvFile(uri.fsPath);
      } else if (ext === '.xlsx' || ext === '.xls') {
        openExcelFile(uri.fsPath);
      } else {
        vscode.window.showErrorMessage('Unsupported file format. Please select a CSV or Excel file.');
      }
    } else {
      const fileUri = await vscode.window.showOpenDialog({
        canSelectMany: false,
        filters: { 'CSV and Excel Files': ['csv', 'xlsx', 'xls'] }
      });
      if (fileUri && fileUri[0]) {
        const filePath = fileUri[0].fsPath;
        const ext = path.extname(filePath).toLowerCase();
        if (ext === '.csv') {
          openCsvFile(filePath);
        } else if (ext === '.xlsx' || ext === '.xls') {
          openExcelFile(filePath);
        }
      }
    }
  });

  context.subscriptions.push(openCsvCommand, openExcelCommand, openFileCommand);
}

export function deactivate() {
  if (csvViewerPanel) {
    csvViewerPanel.dispose();
  }
  if (excelViewerPanel) {
    excelViewerPanel.dispose();
  }
}

function openCsvViewer() {
  if (csvViewerPanel) {
    csvViewerPanel.reveal();
    return;
  }

  csvViewerPanel = vscode.window.createWebviewPanel(
    'csvViewer',
    'CSV Viewer',
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(path.join(__dirname, 'resources'))]
    }
  );

  csvViewerPanel.webview.html = getHtmlForCsvViewer();
  csvViewerPanel.webview.onDidReceiveMessage(message => {
    if (message.command === 'openFile') {
      vscode.commands.executeCommand('csvExcelViewer.openFile');
    }
  });
  csvViewerPanel.onDidDispose(() => {
    csvViewerPanel = null;
  });
}

function openExcelViewer() {
  if (excelViewerPanel) {
    excelViewerPanel.reveal();
    return;
  }

  excelViewerPanel = vscode.window.createWebviewPanel(
    'excelViewer',
    'Excel Viewer',
    vscode.ViewColumn.Two,
    {
      enableScripts: true,
      retainContextWhenHidden: true,
      localResourceRoots: [vscode.Uri.file(path.join(__dirname, 'resources'))]
    }
  );

  excelViewerPanel.webview.html = getHtmlForExcelViewer();
  excelViewerPanel.webview.onDidReceiveMessage(message => {
    if (message.command === 'openFile') {
      vscode.commands.executeCommand('csvExcelViewer.openFile');
    }
  });
  excelViewerPanel.onDidDispose(() => {
    excelViewerPanel = null;
  });
}

function openCsvFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = parseCSV(content);

    if (csvViewerPanel) {
      csvViewerPanel.webview.postMessage({
        type: 'csvData',
        data: data
      });
    } else {
      openCsvViewer();
      setTimeout(() => {
        if (csvViewerPanel) {
          csvViewerPanel.webview.postMessage({
            type: 'csvData',
            data: data
          });
        }
      }, 100);
    }

    vscode.window.showInformationMessage(`Loaded CSV file: ${path.basename(filePath)}`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error loading CSV file: ${error}`);
  }
}

async function openExcelFile(filePath: string) {
  try {
    const content = fs.readFileSync(filePath);
    const data = await parseExcelFile(content);

    if (excelViewerPanel) {
      excelViewerPanel.webview.postMessage({
        type: 'excelData',
        data: data
      });
    } else {
      openExcelViewer();
      setTimeout(() => {
        if (excelViewerPanel) {
          excelViewerPanel.webview.postMessage({
            type: 'excelData',
            data: data
          });
        }
      }, 100);
    }

    vscode.window.showInformationMessage(`Loaded Excel file: ${path.basename(filePath)}`);
  } catch (error) {
    vscode.window.showErrorMessage(`Error loading Excel file: ${error}`);
  }
}

function parseCSV(content: string): string[][] {
  const lines = content.split(/\r?\n/);
  const data: string[][] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine === '') {
      continue;
    }

    const row: string[] = [];
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

  return data;
}

async function parseExcelFile(content: Buffer): Promise<string[][]> {
  const zipEntries = parseZip(content);

  const sharedStringsEntry = zipEntries.find((entry: any) => entry.path === 'xl/sharedStrings.xml');
  const workbookEntry = zipEntries.find((entry: any) => entry.path === 'xl/workbook.xml');

  if (!sharedStringsEntry || !workbookEntry) {
    throw new Error('Invalid Excel file: missing required XML files');
  }

  const sharedStringsXml = unzip(sharedStringsEntry.data);
  const workbookXml = unzip(workbookEntry.data);

  const sharedStrings = await parseSharedStrings(sharedStringsXml);
  const workbook = await parseWorkbook(workbookXml);

  const sheetName = workbook.sheets[0].name;
  const sheetEntry = zipEntries.find((entry: any) => entry.path === `xl/worksheets/${sheetName}.xml`);

  if (!sheetEntry) {
    throw new Error('Invalid Excel file: missing worksheet');
  }

  const sheetXml = unzip(sheetEntry.data);
  const sheetData = await parseWorksheet(sheetXml, sharedStrings);

  return sheetData;
}

function parseZip(buffer: Buffer): any[] {
  const entries: any[] = [];
  let offset = 0;

  while (offset < buffer.length - 30) {
    const signature = buffer.readUInt32LE(offset);

    if (signature === 0x04034b50) {
      const versionNeeded = buffer.readUInt16LE(offset + 4);
      const generalPurposeFlag = buffer.readUInt16LE(offset + 6);
      const compressionMethod = buffer.readUInt16LE(offset + 8);
      const lastModTime = buffer.readUInt16LE(offset + 10);
      const lastModDate = buffer.readUInt16LE(offset + 12);
      const crc32 = buffer.readUInt32LE(offset + 14);
      const compressedSize = buffer.readUInt16LE(offset + 18);
      const uncompressedSize = buffer.readUInt16LE(offset + 22);
      const fileNameLength = buffer.readUInt16LE(offset + 26);
      const extraFieldLength = buffer.readUInt16LE(offset + 28);

      const fileName = buffer.toString('utf-8', offset + 30, offset + 30 + fileNameLength);
      offset += 30 + fileNameLength + extraFieldLength;

      const entryData = buffer.slice(offset, offset + compressedSize);
      offset += compressedSize;

      entries.push({
        path: fileName,
        data: entryData,
        compressedSize,
        uncompressedSize,
        compressionMethod
      });
    } else {
      offset++;
    }
  }

  return entries;
}

function unzip(buffer: Buffer): string {
  return zlib.inflateSync(buffer).toString('utf-8');
}

function parseSharedStrings(xml: string): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser();
    parser.parseString(xml, (err: any, result: any) => {
      if (err) {
        reject(err);
        return;
      }

      const siElements = result['sst']['si'];
      const strings: string[] = [];

      if (siElements) {
        for (const si of siElements) {
          const tElement = si.t;
          if (tElement) {
            strings.push(Array.isArray(tElement) ? tElement[0] : tElement);
          } else if (si.r) {
            let text = '';
            for (const r of si.r) {
              if (r.t) {
                text += Array.isArray(r.t) ? r.t[0] : r.t;
              }
            }
            strings.push(text);
          } else {
            strings.push('');
          }
        }
      }

      resolve(strings);
    });
  });
}

function parseWorkbook(xml: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser({ attrkey: '$' });
    parser.parseString(xml, (err: any, result: any) => {
      if (err) {
        reject(err);
        return;
      }

      const sheets = result['workbook']['sheets']['sheet'];
      const parsedSheets = sheets.map((sheet: any) => ({
        name: sheet.$.name,
        id: sheet.$.sheetId
      }));

      resolve({ sheets: parsedSheets });
    });
  });
}

function parseWorksheet(xml: string, sharedStrings: string[]): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const parser = new xml2js.Parser({ attrkey: '$', charkey: '_' });
    parser.parseString(xml, (err: any, result: any) => {
      if (err) {
        reject(err);
        return;
      }

      const sheetData = result['worksheet']['sheetData'];
      if (!sheetData) {
        resolve([]);
        return;
      }

      const rows = sheetData.row;
      const data: string[][] = [];

      for (const row of rows) {
        const rowData: string[] = [];
        const cells = row.c;

        if (cells) {
          for (const cell of cells) {
            const cellIndex = parseInt(cell.$.r) - 1;
            let value = '';

            if (cell.v) {
              value = cell.v;
            } else if (cell._) {
              value = cell._;
            } else if (cell.is) {
              value = cell.is.t || cell.is.r || '';
            }

            if (cell.$.t === 's') {
              value = sharedStrings[parseInt(value)];
            }

            rowData[cellIndex] = value;
          }
        }

        data.push(rowData);
      }

      resolve(data);
    });
  });
}

function getHtmlForCsvViewer(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CSV Viewer</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #1e1e1e;
      color: #d4d4d4;
      height: 100vh;
      overflow: hidden;
    }
    .header {
      background-color: #252526;
      padding: 10px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #3e3e42;
    }
    .header h1 {
      font-size: 16px;
      font-weight: 500;
    }
    .toolbar {
      display: flex;
      gap: 10px;
    }
    .toolbar button {
      background-color: #0e639c;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }
    .toolbar button:hover {
      background-color: #1177bb;
    }
    .toolbar button.secondary {
      background-color: #3c3c3c;
    }
    .toolbar button.secondary:hover {
      background-color: #4c4c4c;
    }
    .container {
      height: calc(100vh - 50px);
      overflow: auto;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      padding: 8px 12px;
      border: 1px solid #3e3e42;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .row-number {
      background-color: #2d2d2d;
      text-align: center;
      color: #858585;
      width: 50px;
      user-select: none;
    }
    th {
      background-color: #2d2d2d;
      position: sticky;
      top: 0;
      z-index: 10;
      font-weight: 600;
    }
    /* Ensure the row number header stays on top and is distinct */
    th.row-num-header {
      z-index: 11;
    }
    tr:nth-child(even) {
      background-color: #2a2d2e;
    }
    tr:hover {
      background-color: #37373d;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #858585;
    }
    .empty-state svg {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    .search-box {
      padding: 10px 15px;
      background-color: #252526;
      border-bottom: 1px solid #3e3e42;
    }
    .search-box input {
      width: 100%;
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid #3e3e42;
      background-color: #3c3c3c;
      color: #d4d4d4;
      font-size: 13px;
    }
    .search-box input:focus {
      outline: none;
      border-color: #007acc;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>CSV Viewer</h1>
    <div class="toolbar">
      <button class="secondary" onclick="openFile()">Open File</button>
      <button class="secondary" onclick="clearData()">Clear</button>
    </div >
  </div >
  <div class="search-box">
    <input type="text" id="searchInput" placeholder="Search..." oninput="filterTable()">
  </div >
  <div class="container">
    <table id="csvTable">
      <thead id="tableHead"></thead>
      <tbody id="tableBody"></tbody>
    </table >
    <div id="emptyState" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
      <p>No data loaded. Click "Open File" to select a CSV file.</p>
    </div >
  </div >
  <script>
    let csvData = [];
    const vscode = acquireVsCodeApi();

    window.addEventListener('message', event => {
      const message = event.data;
      if (message.type === 'csvData') {
        csvData = message.data;
        renderTable();
      }
    });

    function renderTable() {
      const tableHead = document.getElementById('tableHead');
      const tableBody = document.getElementById('tableBody');
      const emptyState = document.getElementById('emptyState');

      if (csvData.length === 0) {
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';
        emptyState.style.display = 'flex';
        return;
      }

      emptyState.style.display = 'none';

      // Get headers
      const headers = csvData[0];
      let headHtml = '<tr class="row-num-header"><th class="row-number">#</th>';
      headHtml += headers.map(h => '<th>' + h + '</th>').join('');
      headHtml += '</tr>';
      tableHead.innerHTML = headHtml;

      // Get rows
      const rows = csvData.slice(1);
      tableBody.innerHTML = rows.map((row, index) => {
        return '<tr><td class="row-number">' + (index + 1) + '</td>' + row.map(cell => '<td>' + cell + '</td>').join('') + '</tr>';
      }).join('');
    }

    function openFile() {
      vscode.postMessage({
        command: 'openFile'
      });
    }

    function clearData() {
      csvData = [];
      renderTable();
    }

    function filterTable() {
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      const rows = document.querySelectorAll('#tableBody tr');

      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
      });
    }
  </script>
</body>
</html>`;
}

function getHtmlForExcelViewer(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Excel Viewer</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      background-color: #1e1e1e;
      color: #d4d4d4;
      height: 100vh;
      overflow: hidden;
    }
    .header {
      background-color: #252526;
      padding: 10px 15px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #3e3e42;
    }
    .header h1 {
      font-size: 16px;
      font-weight: 500;
    }
    .toolbar {
      display: flex;
      gap: 10px;
    }
    .toolbar button {
      background-color: #0e639c;
      color: white;
      border: none;
      padding: 6px 12px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 13px;
    }
    .toolbar button:hover {
      background-color: #1177bb;
    }
    .toolbar button.secondary {
      background-color: #3c3c3c;
    }
    .toolbar button.secondary:hover {
      background-color: #4c4c4c;
    }
    .container {
      height: calc(100vh - 50px);
      overflow: auto;
    }
    table {
      border-collapse: collapse;
      width: 100%;
    }
    th, td {
      padding: 8px 12px;
      border: 1px solid #3e3e42;
      text-align: left;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .row-number {
      background-color: #2d2d2d;
      text-align: center;
      color: #858585;
      width: 50px;
      user-select: none;
    }
    th {
      background-color: #2d2d2d;
      position: sticky;
      top: 0;
      z-index: 10;
      font-weight: 600;
    }
    /* Ensure the row number header stays on top and is distinct */
    th.row-num-header {
      z-index: 11;
    }
    tr:nth-child(even) {
      background-color: #2a2d2e;
    }
    tr:hover {
      background-color: #37373d;
    }
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: #858585;
    }
    .empty-state svg {
      width: 64px;
      height: 64px;
      margin-bottom: 16px;
      opacity: 0.5;
    }
    .search-box {
      padding: 10px 15px;
      background-color: #252526;
      border-bottom: 1px solid #3e3e42;
    }
    .search-box input {
      width: 100%;
      padding: 8px 12px;
      border-radius: 4px;
      border: 1px solid #3e3e42;
      background-color: #3c3c3c;
      color: #d4d4d4;
      font-size: 13px;
    }
    .search-box input:focus {
      outline: none;
      border-color: #007acc;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Excel Viewer</h1>
    <div class="toolbar">
      <button class="secondary" onclick="openFile()">Open File</button>
      <button class="secondary" onclick="clearData()">Clear</button>
    </div >
  </div >
  <div class="search-box">
    <input type="text" id="searchInput" placeholder="Search..." oninput="filterTable()">
  </div >
  <div class="container">
    <table id="excelTable">
      <thead id="tableHead"></thead>
      <tbody id="tableBody"></tbody>
    </table >
    <div id="emptyState" class="empty-state">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </svg>
      <p>No data loaded. Click "Open File" to select an Excel file.</p>
    </div >
  </div >
  <script>
    let excelData = [];
    const vscode = acquireVsCodeApi();

    window.addEventListener('message', event => {
      const message = event.data;
      if (message.type === 'excelData') {
        excelData = message.data;
        renderTable();
      }
    });

    function renderTable() {
      const tableHead = document.getElementById('tableHead');
      const tableBody = document.getElementById('tableBody');
      const emptyState = document.getElementById('emptyState');

      if (excelData.length === 0) {
        tableHead.innerHTML = '';
        tableBody.innerHTML = '';
        emptyState.style.display = 'flex';
        return;
      }

      emptyState.style.display = 'none';

      // Get headers
      const headers = excelData[0];
      let headHtml = '<tr class="row-num-header"><th class="row-number">#</th>';
      headHtml += headers.map(h => '<th>' + h + '</th>').join('');
      headHtml += '</tr>';
      tableHead.innerHTML = headHtml;

      // Get rows
      const rows = excelData.slice(1);
      tableBody.innerHTML = rows.map((row, index) => {
        return '<tr><td class="row-number">' + (index + 1) + '</td>' + row.map(cell => '<td>' + cell + '</td>').join('') + '</tr>';
      }).join('');
    }

    function openFile() {
      vscode.postMessage({
        command: 'openFile'
      });
    }

    function clearData() {
      excelData = [];
      renderTable();
    }

    function filterTable() {
      const searchTerm = document.getElementById('searchInput').value.toLowerCase();
      const rows = document.querySelectorAll('#tableBody tr');

      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
      });
    }
  </script>
</body>
</html>`;
}
