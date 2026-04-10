const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const {
  ValidationError,
  NotFoundError,
  UnauthorizedError,
} = require("../utils/AppError");
const logger = require("../config/logger");

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Validate input
    if (!name || !email || !password) {
      throw new ValidationError("name, email and password are required");
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (password.length < 6) {
      throw new ValidationError("Password must be at least 6 characters");
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ValidationError("User already exists with this email");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: trimmedName,
        email: normalizedEmail,
        password: hashedPassword,
      },
    });

    logger.info(`New user registered: ${normalizedEmail}`);

    return res.status(201).json({
      message: "User registered successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      throw new ValidationError("email and password are required");
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Check JWT secret
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    // Generate token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    logger.info(`User logged in: ${normalizedEmail}`);

    return res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login };