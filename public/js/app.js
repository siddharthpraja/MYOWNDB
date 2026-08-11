import AuthController
    from "./controllers/authController.js";

import DashboardController
    from "./controllers/dashboardController.js";

import SpreadsheetController
    from "./controllers/spreadsheetController.js";


class App {

    constructor() {

        this.auth =
            new AuthController();

        this.dashboard =
            new DashboardController(
                this.auth
            );

        this.spreadsheet =
            new SpreadsheetController(
                this.auth
            );


        this.start();
    }


    async start() {

        const page =
            document.body.dataset.page;


        switch (page) {

            case "login":

                await this.auth.loginPage();

                break;


            case "register":

                await this.auth.registerPage();

                break;


            case "dashboard":

                await this.dashboard.start();

                break;


            case "spreadsheet":

                await this.spreadsheet.start();

                break;


            default:

                console.warn(
                    "Unknown page:",
                    page
                );
        }
    }
}


window.app =
    new App();
