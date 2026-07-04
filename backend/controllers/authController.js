import User from "../models/User.js";
import Cart from "../models/Cart.js";
import Address from "../models/Address.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

//Signup User
export const signupUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Edge case: missing fields
        if (!name?.trim() || !email?.trim() || !password) {
            return res.status(400).json({ message: "Name, email and password are all required" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Edge case: basic email format check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(normalizedEmail)) {
            return res.status(400).json({ message: "Please enter a valid email address" });
        }

        // Edge case: weak/short password
        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        // Check if user already exists (case-insensitive)
        const userExists = await User.findOne({ email: normalizedEmail });
        if (userExists) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }

        //Hash password
        const hashPassword = await bcrypt.hash(password, 10);

        //Create User
        await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashPassword
        });

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        // Edge case: race condition duplicate email hitting the unique index
        if (error.code === 11000) {
            return res.status(409).json({ message: "An account with this email already exists" });
        }
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

//Login User
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Edge case: missing fields
        if (!email?.trim() || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const normalizedEmail = email.trim().toLowerCase();

        // Check if user exists
        const user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            // Same generic message as wrong password, avoid leaking which emails are registered
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Compare password
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        // Edge case: JWT secret missing from environment
        if (!process.env.JWT_SECRET) {
            return res.status(500).json({ message: "Server misconfiguration, please contact support" });
        }

        //Genrate JWT Token
        const token = jwt.sign(
            { id: user._id },
            process.env.JWT_SECRET,
            { expiresIn: "7d" }
        );
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get logged-in user's own profile
export const getMe = async (req, res) => {
    try {
        // req.user is set by the protect middleware, password already excluded
        res.json({ user: req.user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Delete logged-in user's account (irreversible)
export const deleteAccount = async (req, res) => {
    try {
        const { password, confirmation } = req.body;

        // Edge case: require the user to explicitly type a confirmation phrase
        if (confirmation !== "DELETE") {
            return res.status(400).json({ message: "Please type DELETE to confirm account deletion" });
        }

        // Edge case: require password re-entry so a hijacked/left-open session
        // can't be used to silently wipe an account
        if (!password) {
            return res.status(400).json({ message: "Please enter your password to confirm" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // Cascade cleanup so we don't leave orphaned records behind.
        // Orders are intentionally left untouched for accounting/audit history.
        await Promise.all([
            Cart.findOneAndDelete({ userId: user._id }),
            Address.deleteMany({ userId: user._id }),
        ]);

        await User.findByIdAndDelete(user._id);

        res.json({ message: "Your account has been permanently deleted" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};
