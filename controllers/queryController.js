const queryService = require("../services/queryService");



function query(req, res) {
  try {
    const result = queryService.query(req.userId, req.body);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: error.message,
    });
  }
}

module.exports = {
  query,
};
