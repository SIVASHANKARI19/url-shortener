const express = require("express");
const {
  createShortUrl,
  getMyUrls,
  updateUrl,
  getUrlAnalytics,
  deleteUrl,
} = require("../controllers/url.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware, createShortUrl);
router.get("/", authMiddleware, getMyUrls);
router.put("/:id", authMiddleware, updateUrl);
router.get("/:id/analytics", authMiddleware, getUrlAnalytics);
router.delete("/:id", authMiddleware, deleteUrl);

module.exports = router;