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
    console.log("========== SAVE WORKBOOK ==========");

    console.log(
      "Content-Type:",
      req.headers["content-type"]
    );

    console.log(
      "Request body:",
      req.body
    );

    console.log(
      "Request body JSON:",
      JSON.stringify(req.body, null, 2)
    );

    const workbook = req.body;

    // -----------------------------
    // Validate body
    // -----------------------------

    if (!workbook) {
      return res.status(400).json({
        success: false,
        error: "Request body is empty"
      });
    }

    if (
      typeof workbook !== "object" ||
      Array.isArray(workbook)
    ) {
      return res.status(400).json({
        success: false,
        error: "Invalid workbook object"
      });
    }

    if (!Array.isArray(workbook.worksheets)) {
      return res.status(400).json({
        success: false,
        error: "Invalid workbook: worksheets must be an array"
      });
    }

    // -----------------------------
    // Save
    // -----------------------------

    workbookModel.updateWorkbook(
      req.userId,
      workbook
    );

    console.log(
      `Workbook saved for user: ${req.userId}`
    );

    return res.json({
      success: true
    });

  } catch (error) {
    console.error(
      "Save workbook error:",
      error
    );

    return res.status(500).json({
      success: false,
      error: "Unable to save workbook"
    });
  }
}

module.exports = {
  getWorkbook,
  saveWorkbook,
};
