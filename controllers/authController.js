const bcrypt = require("bcryptjs");

const userModel = require("../models/userModel");

const workbookModel = require("../models/workbookModel");

const { createToken } = require("../services/tokenService");

async function register(req, res) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = userModel.findByEmail(normalizedEmail);

    if (existing) {
      return res.status(409).json({
        error: "Email already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = {
      id: Date.now().toString(),

      name: name.trim(),

      email: normalizedEmail,

      passwordHash,

      createdAt: new Date().toISOString(),
    };

    userModel.createUser(user);

    workbookModel.initialize(user.id);

    const token = createToken(user);

    res.json({
      success: true,

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Registration failed",
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const user = userModel.findByEmail(email.trim().toLowerCase());

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);

    if (!valid) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }

    const token = createToken(user);

    res.json({
      success: true,

      token,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "Login failed",
    });
  }
}

function me(req, res) {
  const user = userModel.findById(req.userId);

  if (!user) {
    return res.status(401).json({
      error: "User not found",
    });
  }

  res.json({
    id: user.id,

    name: user.name,

    email: user.email,
  });
}

function logout(req, res) {
  // JWT is stateless.
  // Frontend removes the token.

  res.json({
    success: true,
  });
}

module.exports = {
  register,
  login,
  me,
  logout,
};
