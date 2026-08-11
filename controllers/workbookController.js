const workbookModel = require("../models/workbookModel");

function getWorkbook(req, res) {
  try {
    const workbook = workbookModel.getWorkbook(req.userId);

    res.json(workbook);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to load workbook",
    });
  }
}

function saveWorkbook(req, res) {
  try {
    const workbook = req.body;

    if (!workbook || typeof workbook !== "object") {
      return res.status(400).json({
        error: "Invalid workbook",
      });
    }

    workbookModel.updateWorkbook(req.userId, workbook);

    res.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Unable to save workbook",
    });
  }
}

module.exports = {
  getWorkbook,
  saveWorkbook,
};
