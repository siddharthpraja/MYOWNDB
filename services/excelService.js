const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const DATABASE_DIR = path.join(
  __dirname,
  "..",
  "data",
  "databases"
);

function getDatabasePath(userId) {
  return path.join(
    DATABASE_DIR,
    `user_${userId}.xlsx`
  );
}

// =====================================================
// CREATE DATABASE
// =====================================================

function createDatabase(userId) {
  const file = getDatabasePath(userId);

  // Create directory if it doesn't exist
  if (!fs.existsSync(DATABASE_DIR)) {
    fs.mkdirSync(DATABASE_DIR, {
      recursive: true
    });
  }

  if (fs.existsSync(file)) {
    return;
  }

  const workbook = XLSX.utils.book_new();

  const sheet = XLSX.utils.aoa_to_sheet([
    ["Product", "Quantity", "Price", "Total"],
    ["Apple", 10, 50, "=B2*C2"],
    ["Mango", 5, 80, "=B3*C3"],
    ["Banana", 20, 30, "=B4*C4"],
    ["", "", "Grand Total", "=SUM(D2:D4)"]
  ]);

  convertFormulaStringsToFormulas(sheet);

  XLSX.utils.book_append_sheet(
    workbook,
    sheet,
    "Sheet1"
  );

  workbook.Workbook = {
    CalcPr: {
      fullCalcOnLoad: true,
      forceFullCalc: true
    }
  };

  XLSX.writeFile(workbook, file);
}

// =====================================================
// FORMULAS
// =====================================================

function convertFormulaStringsToFormulas(sheet) {
  if (!sheet["!ref"]) {
    return;
  }

  const range = XLSX.utils.decode_range(
    sheet["!ref"]
  );

  for (
    let row = range.s.r;
    row <= range.e.r;
    row++
  ) {
    for (
      let col = range.s.c;
      col <= range.e.c;
      col++
    ) {
      const address = XLSX.utils.encode_cell({
        r: row,
        c: col
      });

      const cell = sheet[address];

      if (
        cell &&
        typeof cell.v === "string" &&
        cell.v.startsWith("=")
      ) {
        cell.f = cell.v.substring(1);

        delete cell.v;

        cell.t = "n";
      }
    }
  }
}

// =====================================================
// SHEET → GRID
// =====================================================

function sheetToGrid(sheet) {
  if (!sheet["!ref"]) {
    return [];
  }

  const range = XLSX.utils.decode_range(
    sheet["!ref"]
  );

  const result = [];

  for (
    let row = range.s.r;
    row <= range.e.r;
    row++
  ) {
    const values = [];

    for (
      let col = range.s.c;
      col <= range.e.c;
      col++
    ) {
      const address = XLSX.utils.encode_cell({
        r: row,
        c: col
      });

      const cell = sheet[address];

      if (!cell) {
        values.push("");
      } else if (cell.f !== undefined) {
        values.push("=" + cell.f);
      } else {
        values.push(cell.v ?? "");
      }
    }

    result.push(values);
  }

  return result;
}

// =====================================================
// READ WORKBOOK
// =====================================================

function readWorkbook(userId) {
  const file = getDatabasePath(userId);

  if (!fs.existsSync(file)) {
    createDatabase(userId);
  }

  const workbook = XLSX.readFile(file, {
    cellFormula: true,
    cellStyles: true
  });

  // NEW FORMAT
  const worksheets = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet =
      workbook.Sheets[sheetName];

    worksheets.push({
      worksheetName: sheetName,
      minDimensions: [12, 30],
      data: sheetToGrid(sheet),
      columns: []
    });
  }

  return {
    worksheets
  };
}

// =====================================================
// GRID → SHEET
// =====================================================

function gridToSheet(grid) {
  // Safety check
  if (!Array.isArray(grid)) {
    console.warn(
      "Invalid grid passed to gridToSheet:",
      grid
    );

    return XLSX.utils.aoa_to_sheet([]);
  }

  // Make sure every row is an array
  const validGrid = grid.map((row) => {
    if (Array.isArray(row)) {
      return row;
    }

    return [];
  });

  const sheet =
    XLSX.utils.aoa_to_sheet(validGrid);

  convertFormulaStringsToFormulas(sheet);

  return sheet;
}

// =====================================================
// SAVE WORKBOOK
// =====================================================

function saveWorkbook(userId, data) {
  const file = getDatabasePath(userId);

  // Make directory if necessary
  if (!fs.existsSync(DATABASE_DIR)) {
    fs.mkdirSync(DATABASE_DIR, {
      recursive: true
    });
  }

  const workbook = XLSX.utils.book_new();

  // =================================================
  // NEW FORMAT
  //
  // {
  //   worksheets: [
  //     {
  //       worksheetName: "Customers",
  //       data: [...]
  //     },
  //     {
  //       worksheetName: "Orders",
  //       data: [...]
  //     }
  //   ]
  // }
  // =================================================

  if (
    data &&
    Array.isArray(data.worksheets)
  ) {
    for (
      const worksheet of data.worksheets
    ) {
      if (
        !worksheet ||
        typeof worksheet !== "object"
      ) {
        continue;
      }

      const sheetName =
        String(
          worksheet.worksheetName ||
          "Sheet1"
        ).substring(0, 31);

      const grid = Array.isArray(
        worksheet.data
      )
        ? worksheet.data
        : [];


      const sheet = gridToSheet(grid);

      XLSX.utils.book_append_sheet(
        workbook,
        sheet,
        sheetName
      );
    }
  }

  // =================================================
  // OLD FORMAT SUPPORT
  //
  // {
  //   Customers: [...],
  //   Orders: [...]
  // }
  // =================================================

  else if (
    data &&
    typeof data === "object"
  ) {
    for (
      const sheetName of Object.keys(data)
    ) {
      const grid = Array.isArray(
        data[sheetName]
      )
        ? data[sheetName]
        : [];

      const sheet = gridToSheet(grid);

      XLSX.utils.book_append_sheet(
        workbook,
        sheet,
        String(sheetName).substring(0, 31)
      );
    }
  }

  // =================================================
  // NO WORKSHEETS
  // =================================================

  if (
    workbook.SheetNames.length === 0
  ) {
    const emptySheet =
      XLSX.utils.aoa_to_sheet([]);

    XLSX.utils.book_append_sheet(
      workbook,
      emptySheet,
      "Sheet1"
    );
  }

  // =================================================
  // FORMULA CALCULATION
  // =================================================

  workbook.Workbook = {
    CalcPr: {
      fullCalcOnLoad: true,
      forceFullCalc: true
    }
  };

  // =================================================
  // SAVE FILE
  // =================================================

  XLSX.writeFile(
    workbook,
    file
  );


}

// =====================================================
// EXPORT
// =====================================================

module.exports = {
  getDatabasePath,
  createDatabase,
  readWorkbook,
  saveWorkbook
};