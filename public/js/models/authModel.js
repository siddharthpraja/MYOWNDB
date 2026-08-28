export default class AuthModel {
  getToken() {
    return localStorage.getItem("authToken");
  }
  getTokenExp() {
    return localStorage.getItem("authTokenExp");
  }
  getTokenLog() {
    return localStorage.getItem("loginAtDate");
  }
  setToken(token, expiresAtDate,loginAtDate) {
    localStorage.setItem("authToken", token);
    localStorage.setItem("authTokenExp", expiresAtDate);
    localStorage.setItem("loginAtDate", loginAtDate);
  }
  removeToken() {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authTokenExp");
    localStorage.removeItem("loginAtDate");
  }
  

  async login(email, password) {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    /* Response must be successful */ if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }
    /* Save token after successful login */ if (data.token) {
      this.setToken(data.token, data.expiresAtDate, data.loginAtDate);
    }
    return data;
  }
  /* ================================================== REGISTER ================================================== */ async register(
    name,
    email,
    password,
  ) {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await response.json();
    /* Response must be successful */ if (!response.ok) {
      throw new Error(data.error || "Registration failed");
    }
    /* Save token after successful registration */ if (data.token) {
      this.setToken(data.token, data.expiresAtDate, data.loginAtDate);
    }
    return data;
  }
  /* ================================================== CURRENT USER ================================================== */ async me() {
    const token = this.getToken();
    if (!token) {
      return null;
    }
    const response = await fetch("/api/auth/me", {
      method: "GET",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      /* Token is invalid or expired. */ if (response.status === 401) {
        this.removeToken();
      }
      return null;
    }
    return response.json();
  }
  /* ================================================== LOGOUT ================================================== */ async logout() {
    const token = this.getToken();
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } finally {
      /* Always remove token from browser. */ this.removeToken();
    }
  }
  /* ================================================== AUTHENTICATED REQUEST ================================================== */ async request(
    url,
    options = {},
  ) {
    const token = this.getToken();
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
    const response = await fetch(url, { ...options, headers });
    /* Remove invalid token */ if (response.status === 401) {
      this.removeToken();
    }
    return response;
  }
  /* ================================================== IS LOGGED IN ================================================== */ 
    isLoggedIn() {
    return !!this.getToken();
  }
}
