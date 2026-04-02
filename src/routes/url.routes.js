const express = require("express");
const {
  createShortUrl,
  getUrlAnalytics,
} = require("../controllers/url.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware, createShortUrl);
router.get("/:id/analytics", authMiddleware, getUrlAnalytics);

module.exports = router;