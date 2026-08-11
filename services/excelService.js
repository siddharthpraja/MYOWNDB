const XLSX = require("xlsx");
const fs = require("fs");
const path = require("path");

const DATABASE_DIR = path.join(__dirname, "..", "data", "databases");

function getDatabasePath(userId) {
  return path.join(DATABASE_DIR, `user_${userId}.xlsx`);
}

function createDatabase(userId) {
  const file = getDatabasePath(userId);

  if (fs.existsSync(file)) {
    return;
  }

  const workbook = XLSX.utils.book_new();

  const sheet = XLSX.utils.aoa_to_sheet([
    ["Product", "Quantity", "Price", "Total"],

    ["Apple", 10, 50, "=B2*C2"],

    ["Mango", 5, 80, "=B3*C3"],

    ["Banana", 20, 30, "=B4*C4"],

    ["", "", "Grand Total", "=SUM(D2:D4)"],
  ]);

  convertFormulaStringsToFormulas(sheet);

  XLSX.utils.book_append_sheet(workbook, sheet, "Sheet1");

  workbook.Workbook = {
    CalcPr: {
      fullCalcOnLoad: true,
      forceFullCalc: true,
    },
  };

  XLSX.writeFile(workbook, file);
}

function convertFormulaStringsToFormulas(sheet) {
  if (!sheet["!ref"]) {
    return;
  }

  const range = XLSX.utils.decode_range(sheet["!ref"]);

  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const address = XLSX.utils.encode_cell({
        r: row,
        c: col,
      });

      const cell = sheet[address];

      if (cell && typeof cell.v === "string" && cell.v.startsWith("=")) {
        cell.f = cell.v.substring(1);

        delete cell.v;

        cell.t = "n";
      }
    }
  }
}

function sheetToGrid(sheet) {
  if (!sheet["!ref"]) {
    return [];
  }

  const range = XLSX.utils.decode_range(sheet["!ref"]);

  const result = [];

  for (let row = range.s.r; row <= range.e.r; row++) {
    const values = [];

    for (let col = range.s.c; col <= range.e.c; col++) {
      const address = XLSX.utils.encode_cell({
        r: row,
        c: col,
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

function readWorkbook(userId) {
  const file = getDatabasePath(userId);

  if (!fs.existsSync(file)) {
    createDatabase(userId);
  }

  const workbook = XLSX.readFile(file, {
    cellFormula: true,
    cellStyles: true,
  });

  const result = {};

  for (const sheetName of workbook.SheetNames) {
    result[sheetName] = sheetToGrid(workbook.Sheets[sheetName]);
  }

  return result;
}

function gridToSheet(grid) {
  const sheet = XLSX.utils.aoa_to_sheet(grid);

  convertFormulaStringsToFormulas(sheet);

  return sheet;
}

function saveWorkbook(userId, data) {
  const file = getDatabasePath(userId);

  const workbook = XLSX.utils.book_new();

  for (const sheetName of Object.keys(data)) {
    const grid = Array.isArray(data[sheetName]) ? data[sheetName] : [];

    const sheet = gridToSheet(grid);

    XLSX.utils.book_append_sheet(workbook, sheet, sheetName.substring(0, 31));
  }

  workbook.Workbook = {
    CalcPr: {
      fullCalcOnLoad: true,
      forceFullCalc: true,
    },
  };

  XLSX.writeFile(workbook, file);
}

module.exports = {
  getDatabasePath,
  createDatabase,
  readWorkbook,
  saveWorkbook,
};
