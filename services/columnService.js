const XLSX = require("xlsx");
const fs = require("fs");

const { getDatabasePath } = require("./excelService");

function getWorkbook(userId) {
  const file = getDatabasePath(userId);

  if (!fs.existsSync(file)) {
    throw new Error("Database not found");
  }

  return XLSX.readFile(file, {
    cellFormula: true,
    cellStyles: true,
  });
}

function saveWorkbook(userId, workbook) {
  const file = getDatabasePath(userId);

  XLSX.writeFile(workbook, file);
}

function validateTableName(tableName) {
  if (!tableName || typeof tableName !== "string") {
    throw new Error("Table name is required");
  }

  return tableName.trim();
}

function validateColumnName(columnName) {
  if (!columnName || typeof columnName !== "string") {
    throw new Error("Column name is required");
  }

  columnName = columnName.trim();

  if (!columnName) {
    throw new Error("Column name cannot be empty");
  }

  return columnName;
}

function getSheet(workbook, tableName) {
  const sheet = workbook.Sheets[tableName];

  if (!sheet) {
    throw new Error(`Table '${tableName}' not found`);
  }

  return sheet;
}

function getColumns(sheet) {
  if (!sheet["!ref"]) {
    return [];
  }

  const range = XLSX.utils.decode_range(sheet["!ref"]);

  const columns = [];

  for (let col = range.s.c; col <= range.e.c; col++) {
    const address = XLSX.utils.encode_cell({
      r: range.s.r,
      c: col,
    });

    const cell = sheet[address];

    columns.push(cell?.v ?? "");
  }

  return columns;
}

function findColumnIndex(sheet, columnName) {
  const columns = getColumns(sheet);

  return columns.findIndex(
    (column) => String(column).toLowerCase() === columnName.toLowerCase(),
  );
}

/*
    ALTER TABLE
    ADD COLUMN
*/
function addColumn(userId, tableName, columnName, defaultValue = "") {
  tableName = validateTableName(tableName);

  columnName = validateColumnName(columnName);

  const workbook = getWorkbook(userId);

  const sheet = getSheet(workbook, tableName);

  const existingIndex = findColumnIndex(sheet, columnName);

  if (existingIndex !== -1) {
    throw new Error(`Column '${columnName}' already exists`);
  }

  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");

  const newColumn = range.e.c + 1;

  /*
        Header
    */

  const headerAddress = XLSX.utils.encode_cell({
    r: range.s.r,
    c: newColumn,
  });

  sheet[headerAddress] = {
    t: "s",
    v: columnName,
  };

  /*
        Default value
        for existing rows
    */

  for (let row = range.s.r + 1; row <= range.e.r; row++) {
    const address = XLSX.utils.encode_cell({
      r: row,
      c: newColumn,
    });

    sheet[address] = {
      t: typeof defaultValue === "number" ? "n" : "s",
      v: defaultValue,
    };
  }

  range.e.c = newColumn;

  sheet["!ref"] = XLSX.utils.encode_range(range);

  saveWorkbook(userId, workbook);

  return {
    success: true,

    table: tableName,

    column: columnName,

    defaultValue,
  };
}

/*
    ALTER TABLE
    DROP COLUMN
*/
function dropColumn(userId, tableName, columnName) {
  tableName = validateTableName(tableName);

  columnName = validateColumnName(columnName);

  const workbook = getWorkbook(userId);

  const sheet = getSheet(workbook, tableName);

  const columnIndex = findColumnIndex(sheet, columnName);

  if (columnIndex === -1) {
    throw new Error(`Column '${columnName}' not found`);
  }

  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");

  /*
        Shift columns left
    */

  for (let col = columnIndex; col < range.e.c; col++) {
    for (let row = range.s.r; row <= range.e.r; row++) {
      const currentAddress = XLSX.utils.encode_cell({
        r: row,
        c: col,
      });

      const nextAddress = XLSX.utils.encode_cell({
        r: row,
        c: col + 1,
      });

      if (sheet[nextAddress]) {
        sheet[currentAddress] = sheet[nextAddress];
      } else {
        delete sheet[currentAddress];
      }
    }
  }

  /*
        Remove final column
    */

  for (let row = range.s.r; row <= range.e.r; row++) {
    const address = XLSX.utils.encode_cell({
      r: row,
      c: range.e.c,
    });

    delete sheet[address];
  }

  range.e.c--;

  /*
        Keep at least A1
    */

  if (range.e.c < range.s.c) {
    range.e.c = range.s.c;
  }

  sheet["!ref"] = XLSX.utils.encode_range(range);

  saveWorkbook(userId, workbook);

  return {
    success: true,

    table: tableName,

    deletedColumn: columnName,
  };
}

/*
    ALTER TABLE
    RENAME COLUMN
*/
function renameColumn(userId, tableName, oldName, newName) {
  tableName = validateTableName(tableName);

  oldName = validateColumnName(oldName);

  newName = validateColumnName(newName);

  const workbook = getWorkbook(userId);

  const sheet = getSheet(workbook, tableName);

  const oldIndex = findColumnIndex(sheet, oldName);

  if (oldIndex === -1) {
    throw new Error(`Column '${oldName}' not found`);
  }

  const newIndex = findColumnIndex(sheet, newName);

  if (newIndex !== -1) {
    throw new Error(`Column '${newName}' already exists`);
  }

  const headerAddress = XLSX.utils.encode_cell({
    r: 0,
    c: oldIndex,
  });

  sheet[headerAddress] = {
    t: "s",

    v: newName,
  };

  saveWorkbook(userId, workbook);

  return {
    success: true,

    table: tableName,

    oldColumn: oldName,

    newColumn: newName,
  };
}

/*
    GET COLUMN INFORMATION
*/
function getColumnsInfo(userId, tableName) {
  tableName = validateTableName(tableName);

  const workbook = getWorkbook(userId);

  const sheet = getSheet(workbook, tableName);

  const columns = getColumns(sheet);

  return columns.map((name, index) => {
    return {
      index,

      name,

      letter: XLSX.utils.encode_col(index),
    };
  });
}

module.exports = {
  addColumn,

  dropColumn,

  renameColumn,

  getColumnsInfo,
};
