const AdmZip = require('adm-zip');
const fs = require('fs');
const path = require('path');

// Create a simple sample Excel file
function generateSampleExcel() {
  // Create a new ZIP file
  const zip = new AdmZip();

  // Create the required XML files for an .xlsx file

  // 1. _rels/.rels
  const relsContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/package/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>`;
  zip.addFile('_rels/.rels', Buffer.from(relsContent));

  // 2. docProps/core.xml
  const corePropsContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Sample Excel File</dc:title>
  <dc:subject>Sample data</dc:subject>
  <dc:creator>CSV Excel Viewer</dc:creator>
  <dc:description>A sample Excel file for testing</dc:description>
  <dc:lastModifiedBy>CSV Excel Viewer</dc:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2024-01-01T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2024-01-01T00:00:00Z</dcterms:modified>
</cp:coreProperties>`;
  zip.addFile('docProps/core.xml', Buffer.from(corePropsContent));

  // 3. docProps/app.xml
  const appPropsContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>CSV Excel Viewer</Application>
  <DocSecurity>0</DocSecurity>
  <ScaleCrop>false</ScaleCrop>
  <HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>1</vt:i4></vt:variant></vt:vector></HeadingPairs>
  <TitlesOfParts><vt:vector size="1" baseType="lpstr"><vt:lpstr>Sheet1</vt:lpstr></vt:vector></TitlesOfParts>
  <Pages>1</Pages>
  <Words>0</Words>
  <Characters>0</Characters>
  <Lines>0</Lines>
  <Paragraphs>0</Paragraphs>
  <Slides>0</Slides>
  <Notes>0</Notes>
  <TotalTime>0</TotalTime>
  <HiddenSlides>0</HiddenSlides>
  <MMClips>0</MMClips>
  <Scale>0</Scale>
  <HeadingPairs><vt:vector size="2" baseType="variant"><vt:variant><vt:lpstr>Worksheets</vt:lpstr></vt:variant><vt:variant><vt:i4>1</vt:i4></vt:variant></vt:vector></HeadingPairs>
  <TitlesOfParts><vt:vector size="1" baseType="lpstr"><vt:lpstr>Sheet1</vt:lpstr></vt:vector></TitlesOfParts>
</Properties>`;
  zip.addFile('docProps/app.xml', Buffer.from(appPropsContent));

  // 4. xl/_rels/workbook.xml.rels
  const workbookRelsContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/sharedStrings" Target="sharedStrings.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>`;
  zip.addFile('xl/_rels/workbook.xml.rels', Buffer.from(workbookRelsContent));

  // 5. xl/workbook.xml
  const workbookContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <fileVersion appName="xl" lastEdited="5" lowestEdited="5" rupBuild="9307"/>
  <workbookPr bookView="0" defaultThemeVersion="124226"/>
  <bookViews>
    <workbookView xWindow="0" yWindow="0" windowWidth="25575" windowHeight="16200" tabRatio="500"/>
  </bookViews>
  <sheets>
    <sheet name="Sheet1" r:id="rId1" sheetId="1" state="visible"/>
  </sheets>
  <calcPr calcId="135116"/>
</workbook>`;
  zip.addFile('xl/workbook.xml', Buffer.from(workbookContent));

  // 6. xl/sharedStrings.xml
  const sharedStringsContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<sst xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" count="5" uniqueCount="5">
  <si>
    <t>Name</t>
  </si>
  <si>
    <t>Age</t>
  </si>
  <si>
    <t>City</t>
  </si>
  <si>
    <t>Country</t>
  </si>
  <si>
    <t>John Doe</t>
  </si>
  <si>
    <t>28</t>
  </si>
  <si>
    <t>New York, USA</t>
  </si>
  <si>
    <t>USA</t>
  </si>
  <si>
    <t>Jane Smith</t>
  </si>
  <si>
    <t>34</t>
  </si>
  <si>
    <t>London, UK</t>
  </si>
  <si>
    <t>UK</t>
  </si>
  <si>
    <t>Bob Johnson</t>
  </si>
  <si>
    <t>45</t>
  </si>
  <si>
    <t>Toronto, Canada</t>
  </si>
  <si>
    <t>Canada</t>
  </si>
  <si>
    <t>Alice Brown</t>
  </si>
  <si>
    <t>31</t>
  </si>
  <si>
    <t>Sydney, Australia</t>
  </si>
  <si>
    <t>Australia</t>
  </si>
  <si>
    <t>Charlie Davis</t>
  </si>
  <si>
    <t>52</t>
  </si>
  <si>
    <t>Berlin, Germany</t>
  </si>
  <si>
    <t>Germany</t>
  </si>
</sst>`;
  zip.addFile('xl/sharedStrings.xml', Buffer.from(sharedStringsContent));

  // 7. xl/styles.xml
  const stylesContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:mc="http://schemas.openxmlformats.org/markup-compatibility/2006" mc:Ignorable="x14ac x16r2xr2" xmlns:x14ac="http://schemas.microsoft.com/office/spreadsheetml/2009/9/ac" xmlns:x16r2xr2="http://schemas.microsoft.com/office/spreadsheetml/2012/r2">
  <fonts count="1" x14ac:knownFonts="1">
    <font>
      <sz val="11"/>
      <name val="Calibri"/>
    </font>
  </fonts>
  <fills count="2">
    <fill>
      <patternFill patternType="none"/>
    </fill>
    <fill>
      <patternFill patternType="gray125"/>
    </fill>
  </fills>
  <borders count="1">
    <border>
      <left/>
      <right/>
      <top/>
      <bottom/>
      <diagonal/>
    </border>
  </borders>
  <cellStyleXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0"/>
  </cellStyleXfs>
  <cellXfs count="1">
    <xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>
  </cellXfs>
  <cellStyles count="1">
    <cellStyle name="Normal" xfId="0" builtinId="0"/>
  </cellStyles>
  <dxfs count="0"/>
  <tableStyles count="0" defaultTableStyle="TableStyleMedium9" defaultPivotStyle="PivotStyleLight16"/>
</styleSheet>`;
  zip.addFile('xl/styles.xml', Buffer.from(stylesContent));

  // 8. xl/worksheets/sheet1.xml
  const sheetContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheetData>
    <row r="1">
      <c r="A1" s="1">
        <v>0</v>
      </c>
      <c r="B1" s="1">
        <v>1</v>
      </c>
      <c r="C1" s="1">
        <v>2</v>
      </c>
      <c r="D1" s="1">
        <v>3</v>
      </c>
    </row>
    <row r="2">
      <c r="A2" s="1">
        <v>4</v>
      </c>
      <c r="B2" s="1">
        <v>5</v>
      </c>
      <c r="C2" s="1">
        <v>6</v>
      </c>
      <c r="D2" s="1">
        <v>7</v>
      </c>
    </row>
    <row r="3">
      <c r="A3" s="1">
        <v>8</v>
      </c>
      <c r="B3" s="1">
        <v>9</v>
      </c>
      <c r="C3" s="1">
        <v>10</v>
      </c>
      <c r="D3" s="1">
        <v>11</v>
      </c>
    </row>
    <row r="4">
      <c r="A4" s="1">
        <v>12</v>
      </c>
      <c r="B4" s="1">
        <v>13</v>
      </c>
      <c r="C4" s="1">
        <v>14</v>
      </c>
      <c r="D4" s="1">
        <v>15</v>
      </c>
    </row>
    <row r="5">
      <c r="A5" s="1">
        <v>16</v>
      </c>
      <c r="B5" s="1">
        <v>17</v>
      </c>
      <c r="C5" s="1">
        <v>18</v>
      </c>
      <c r="D5" s="1">
        <v>19</v>
      </c>
    </row>
  </sheetData>
  <sheetPr filterTab="1"/>
  <pageMargins left="0.7" right="0.7" top="0.75" bottom="0.75" header="0.3" footer="0.3"/>
</worksheet>`;
  zip.addFile('xl/worksheets/sheet1.xml', Buffer.from(sheetContent));

  // 9. [Content_Types].xml
  const contentTypesContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/sharedStrings.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sharedStrings+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>`;
  zip.addFile('[Content_Types].xml', Buffer.from(contentTypesContent));

  // Save the zip file
  const outputPath = path.join(__dirname, 'sample.xlsx');
  zip.writeZip(outputPath);
  console.log(`Sample Excel file created: ${outputPath}`);
}

// Generate the sample Excel file
generateSampleExcel();