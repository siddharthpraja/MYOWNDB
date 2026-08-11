const tableService = require("../services/tableService");

function listTables(req, res) {
  try {
    const tables = tableService.listTables(req.userId);

    res.json({
      success: true,
      tables,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load tables",
    });
  }
}

function createTable(req, res) {
  try {
    const { name, columns = [] } = req.body;

    const table = tableService.createTable(req.userId, name, columns);

    res.status(201).json({
      success: true,
      table,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: error.message,
    });
  }
}

function dropTable(req, res) {
  try {
    const { tableName } = req.params;

    const result = tableService.dropTable(req.userId, tableName);

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: error.message,
    });
  }
}

function renameTable(req, res) {
  try {
    const { tableName } = req.params;

    const { name } = req.body;

    const result = tableService.renameTable(req.userId, tableName, name);

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: error.message,
    });
  }
}

function getTable(req, res) {
  try {
    const { tableName } = req.params;

    const table = tableService.getTable(req.userId, tableName);

    res.json({
      success: true,
      table,
    });
  } catch (error) {
    console.error(error);

    res.status(404).json({
      error: error.message,
    });
  }
}

module.exports = {
  listTables,
  createTable,
  dropTable,
  renameTable,
  getTable,
};
