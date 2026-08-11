const columnService = require("../services/columnService");

/*
    GET COLUMNS
*/
function getColumns(req, res) {
  try {
    const { tableName } = req.params;

    const columns = columnService.getColumnsInfo(req.userId, tableName);

    res.json({
      success: true,

      table: tableName,

      columns,
    });
  } catch (error) {
    console.error(error);

    res.status(404).json({
      error: error.message,
    });
  }
}

/*
    ADD COLUMN
*/
function addColumn(req, res) {
  try {
    const { tableName } = req.params;

    const { name, defaultValue = "" } = req.body;

    const result = columnService.addColumn(
      req.userId,

      tableName,

      name,

      defaultValue,
    );

    res.status(201).json(result);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: error.message,
    });
  }
}

/*
    DROP COLUMN
*/
function dropColumn(req, res) {
  try {
    const { tableName, columnName } = req.params;

    const result = columnService.dropColumn(
      req.userId,

      tableName,

      columnName,
    );

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: error.message,
    });
  }
}

/*
    RENAME COLUMN
*/
function renameColumn(req, res) {
  try {
    const { tableName, columnName } = req.params;

    const { name } = req.body;

    const result = columnService.renameColumn(
      req.userId,

      tableName,

      columnName,

      name,
    );

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: error.message,
    });
  }
}

module.exports = {
  getColumns,

  addColumn,

  dropColumn,

  renameColumn,
};
