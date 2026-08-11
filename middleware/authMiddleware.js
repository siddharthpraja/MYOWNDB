const { verifyToken } = require("../services/tokenService");

function authMiddleware(req, res, next) {
    try {
        const adminSecret = req.headers["x-admin-secret"];
        const authorization = req.headers.authorization;

        // Admin secret authentication
        if (adminSecret === "GautamAdminMySecret") {
            req.userId = "1786469048577";

            req.user = {
                id: "1786469048577",
                role: "admin"
            };

            return next();
        }

        // Normal JWT authentication
        if (!authorization) {
            return res.status(401).json({
                error: "Authentication token required"
            });
        }

        if (!authorization.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Invalid authorization format"
            });
        }

        const token = authorization.substring(7);

        const decoded = verifyToken(token);

        req.user = decoded;
        req.userId = decoded.id;

        next();

    } catch (error) {

        console.error(error);

        return res.status(401).json({
            error: "Invalid or expired token"
        });
    }
}

module.exports = authMiddleware;