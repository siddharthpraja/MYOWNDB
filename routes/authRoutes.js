const express = require("express");

const controller = require("../controllers/authController");

const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
==================================================
REGISTER
==================================================
*/

router.post("/register", controller.register);

/*
==================================================
LOGIN
==================================================
*/

router.post("/login", controller.login);

/*
==================================================
CURRENT USER
==================================================
*/

router.get("/me", authMiddleware, controller.me);

/*
==================================================
LOGOUT
==================================================
*/

router.post("/logout", authMiddleware, controller.logout);

module.exports = router;
