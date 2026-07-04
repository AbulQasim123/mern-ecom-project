import jwt from "jsonwebtoken";
import User from "../models/User.js";

// Protect routes - verifies JWT and attaches the user to req
export const protect = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ message: "Not authorized, no token provided" });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({ message: "Not authorized, no token provided" });
        }

        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            // Edge case: token expired vs. token malformed/invalid
            if (err.name === "TokenExpiredError") {
                return res.status(401).json({ message: "Session expired, please log in again" });
            }
            return res.status(401).json({ message: "Not authorized, invalid token" });
        }

        const user = await User.findById(decoded.id).select("-password");

        // Edge case: token is valid but the user no longer exists (already deleted)
        if (!user) {
            return res.status(401).json({ message: "User no longer exists" });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
