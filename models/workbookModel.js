const {
    createDatabase,
    readWorkbook,
    saveWorkbook
} = require("../services/excelService");


function initialize(userId) {

    createDatabase(userId);
}


function getWorkbook(userId) {

    return readWorkbook(userId);
}


function updateWorkbook(
    userId,
    workbook
) {

    saveWorkbook(
        userId,
        workbook
    );

    return {
        success: true
    };
}


module.exports = {
    initialize,
    getWorkbook,
    updateWorkbook
};
