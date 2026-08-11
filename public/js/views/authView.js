export default class AuthView {

    constructor() {

        this.form =
            document.getElementById(
                "authForm"
            );

        this.error =
            document.getElementById(
                "authError"
            );

        this.button =
            document.getElementById(
                "submitButton"
            );
    }


    getFormData() {

        const formData =
            new FormData(
                this.form
            );


        return Object.fromEntries(
            formData.entries()
        );
    }


    showError(message) {

        this.error.textContent =
            message;

        this.error.classList.remove(
            "hidden"
        );
    }


    clearError() {

        this.error.textContent =
            "";

        this.error.classList.add(
            "hidden"
        );
    }


    loading() {

        this.button.disabled =
            true;

        this.button.textContent =
            "Please wait...";
    }


    ready(text) {

        this.button.disabled =
            false;

        this.button.textContent =
            text;
    }
}
