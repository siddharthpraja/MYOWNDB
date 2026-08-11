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

function getSheet(workbook, tableName) {
  const sheet = workbook.Sheets[tableName];

  if (!sheet) {
    throw new Error(`Table '${tableName}' not found`);
  }

  return sheet;
}

function getData(sheet) {
  if (!sheet["!ref"]) {
    return {
      columns: [],
      rows: [],
    };
  }

  const data = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: true,
  });

  if (data.length === 0) {
    return {
      columns: [],
      rows: [],
    };
  }

  const columns = data[0] || [];

  const rows = data.slice(1).map((row, index) => {
    const object = {
      _rowId: index + 1,
    };

    columns.forEach((column, columnIndex) => {
      object[column] = row[columnIndex] ?? "";
    });

    return object;
  });

  return {
    columns,
    rows,
  };
}

function saveData(workbook, tableName, columns, rows) {
  const output = [columns];

  rows.forEach((row) => {
    output.push(columns.map((column) => row[column] ?? ""));
  });

  const sheet = XLSX.utils.aoa_to_sheet(output);

  workbook.Sheets[tableName] = sheet;
}

/*
    INSERT
*/
function insertRow(userId, tableName, data) {
  const workbook = getWorkbook(userId);

  const sheet = getSheet(workbook, tableName);

  const { columns, rows } = getData(sheet);

  if (!columns.length) {
    throw new Error("Table has no columns");
  }

  const row = {};

  columns.forEach((column) => {
    row[column] = data[column] ?? "";
  });

  rows.push(row);

  saveData(workbook, tableName, columns, rows);

  saveWorkbook(userId, workbook);

  return {
    success: true,
    row,
  };
}

/*
    SELECT
*/
function getRows(userId, tableName) {
  const workbook = getWorkbook(userId);

  const sheet = getSheet(workbook, tableName);

  const { columns, rows } = getData(sheet);

  return {
    table: tableName,
    columns,
    rows,
  };
}

/*
    SELECT BY ID
*/
function getRow(userId, tableName, rowId) {
  const result = getRows(userId, tableName);

  const row = result.rows.find((row) => String(row._rowId) === String(rowId));

  if (!row) {
    throw new Error("Row not found");
  }

  return row;
}

/*
    UPDATE
*/
function updateRow(userId, tableName, rowId, data) {
  const workbook = getWorkbook(userId);

  const sheet = getSheet(workbook, tableName);

  const { columns, rows } = getData(sheet);

  const index = rows.findIndex((row) => String(row._rowId) === String(rowId));

  if (index === -1) {
    throw new Error("Row not found");
  }

  columns.forEach((column) => {
    if (Object.prototype.hasOwnProperty.call(data, column)) {
      rows[index][column] = data[column];
    }
  });

  saveData(workbook, tableName, columns, rows);

  saveWorkbook(userId, workbook);

  return {
    success: true,
    row: rows[index],
  };
}

/*
    DELETE
*/
function deleteRow(userId, tableName, rowId) {
  const workbook = getWorkbook(userId);

  const sheet = getSheet(workbook, tableName);

  const { columns, rows } = getData(sheet);

  const index = rows.findIndex((row) => String(row._rowId) === String(rowId));

  if (index === -1) {
    throw new Error("Row not found");
  }

  const deleted = rows[index];

  rows.splice(index, 1);

  saveData(workbook, tableName, columns, rows);

  saveWorkbook(userId, workbook);

  return {
    success: true,
    deleted,
  };
}

module.exports = {
  insertRow,
  getRows,
  getRow,
  updateRow,
  deleteRow,
};
