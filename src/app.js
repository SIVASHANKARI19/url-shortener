const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const prisma = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const urlRoutes = require("./routes/url.routes");
const authMiddleware = require("./middlewares/auth.middleware");
const { redirectToOriginalUrl } = require("./controllers/url.controller");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "OK", message: "Server is running" });
});

app.get("/users", async (req, res) => {
  try {
    const users = await prisma.user.findMany();
    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/urls", urlRoutes);

app.get("/api/profile", authMiddleware, (req, res) => {
  res.json({
    message: "Protected route accessed successfully",
    user: req.user,
  });
});

// redirect route
app.get("/:shortCode", redirectToOriginalUrl);

app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

module.exports = app;