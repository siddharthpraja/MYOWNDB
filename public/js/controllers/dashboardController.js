import DashboardView
    from "../views/dashboardView.js";


export default class DashboardController {

    constructor(
        authController
    ) {

        this.auth =
            authController;

        this.view =
            new DashboardView();
    }


    async start() {

        const user =
            await this.auth.requireLogin();


        if (!user) {
            return;
        }


        this.view.showUser(
            user
        );


        const logoutButton =
            document.getElementById(
                "logoutButton"
            );


        logoutButton.addEventListener(
            "click",
            () => {

                this.auth.logout();
            }
        );


        const spreadsheetButton =
            document.getElementById(
                "openSpreadsheet"
            );


        spreadsheetButton.addEventListener(
            "click",
            () => {

                window.location.href =
                    "/spreadsheet.html";
            }
        );
    }
}
