const { getDatabasePath } = require("./excelService");

const XLSX = require("xlsx");
const fs = require("fs");

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

function validateTableName(name) {
  if (!name || typeof name !== "string") {
    throw new Error("Table name is required");
  }

  name = name.trim();

  if (!name) {
    throw new Error("Table name cannot be empty");
  }

  if (name.length > 31) {
    throw new Error("Table name cannot exceed 31 characters");
  }

  return name;
}

function listTables(userId) {
  const workbook = getWorkbook(userId);

  return workbook.SheetNames;
}

function createTable(userId, tableName, columns = []) {
  tableName = validateTableName(tableName);

  const workbook = getWorkbook(userId);

  if (workbook.SheetNames.includes(tableName)) {
    throw new Error("Table already exists");
  }

  const headers = columns.map((column) => {
    if (typeof column === "string") {
      return column;
    }

    return column.name;
  });

  const data = headers.length > 0 ? [headers] : [[]];

  const sheet = XLSX.utils.aoa_to_sheet(data);

  XLSX.utils.book_append_sheet(workbook, sheet, tableName);

  saveWorkbook(userId, workbook);

  return {
    name: tableName,
    columns: headers,
  };
}

function dropTable(userId, tableName) {
  tableName = validateTableName(tableName);

  const workbook = getWorkbook(userId);

  const index = workbook.SheetNames.indexOf(tableName);

  if (index === -1) {
    throw new Error("Table not found");
  }

  delete workbook.Sheets[tableName];

  workbook.SheetNames.splice(index, 1);

  saveWorkbook(userId, workbook);

  return {
    success: true,
  };
}

function renameTable(userId, oldName, newName) {
  oldName = validateTableName(oldName);

  newName = validateTableName(newName);

  const workbook = getWorkbook(userId);

  if (!workbook.Sheets[oldName]) {
    throw new Error("Table not found");
  }

  if (workbook.Sheets[newName]) {
    throw new Error("New table name already exists");
  }

  const sheet = workbook.Sheets[oldName];

  delete workbook.Sheets[oldName];

  workbook.Sheets[newName] = sheet;

  const index = workbook.SheetNames.indexOf(oldName);

  workbook.SheetNames[index] = newName;

  saveWorkbook(userId, workbook);

  return {
    success: true,
    oldName,
    newName,
  };
}

function getTable(userId, tableName) {
  tableName = validateTableName(tableName);

  const workbook = getWorkbook(userId);

  const sheet = workbook.Sheets[tableName];

  if (!sheet) {
    throw new Error("Table not found");
  }

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
  });

  const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");

  const headers = [];

  for (let col = range.s.c; col <= range.e.c; col++) {
    const cell =
      sheet[
        XLSX.utils.encode_cell({
          r: range.s.r,
          c: col,
        })
      ];

    headers.push(cell?.v ?? "");
  }

  return {
    name: tableName,
    columns: headers,
    rows,
  };
}

module.exports = {
  listTables,
  createTable,
  dropTable,
  renameTable,
  getTable,
};
