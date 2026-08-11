import AuthModel from "../models/authModel.js";

import AuthView from "../views/authView.js";

export default class AuthController {
  constructor() {
    this.model = new AuthModel();

    this.view = new AuthView();
  }

  async loginPage() {
    this.view.form.addEventListener("submit", async (event) => {
      event.preventDefault();

      await this.login();
    });
  }

  async registerPage() {
    this.view.form.addEventListener("submit", async (event) => {
      event.preventDefault();

      await this.register();
    });
  }

  async login() {
    this.view.clearError();

    const data = this.view.getFormData();

    this.view.loading();

    try {
      await this.model.login(data.email, data.password);

      window.location.href = "/dashboard.html";
    } catch (error) {
      this.view.showError(error.message);

      this.view.ready("Login");
    }
  }

  async register() {
    this.view.clearError();

    const data = this.view.getFormData();

    this.view.loading();

    try {
      await this.model.register(data.name, data.email, data.password);

      window.location.href = "/dashboard.html";
    } catch (error) {
      this.view.showError(error.message);

      this.view.ready("Create account");
    }
  }

  async requireLogin() {
    const user = await this.model.me();

    if (!user) {
      window.location.href = "/login.html";

      return null;
    }

    return user;
  }

  async logout() {
    await this.model.logout();

    window.location.href = "/login.html";
  }
}
