const prisma = require("../config/db");
const { nanoid } = require("nanoid");

const createShortUrl = async (req, res) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) {
      return res.status(400).json({
        error: "originalUrl is required",
      });
    }

    const shortCode = nanoid(6);

    const newUrl = await prisma.url.create({
      data: {
        originalUrl,
        shortCode,
        userId: req.user.userId,
      },
    });

    res.status(201).json({
      message: "Short URL created successfully",
      url: newUrl,
      shortUrl: `http://localhost:3000/${shortCode}`,
    });
  } catch (error) {
    console.error("Create short URL error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};

const redirectToOriginalUrl = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const url = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url) {
      return res.status(404).json({
        error: "Short URL not found",
      });
    }

    const userAgent = req.headers["user-agent"] || "Unknown";

    await prisma.click.create({
      data: {
        urlId: url.id,
        device: userAgent,
        country: "Unknown"
      },
    });

    return res.redirect(url.originalUrl);
  } catch (error) {
    console.error("Redirect error:", error);
    return res.status(500).json({
      error: "Internal server error",
    });
  }
};

const getUrlAnalytics = async (req, res) => {
  try {
    const { id } = req.params;

    const url = await prisma.url.findUnique({
      where: { id: Number(id) },
      include: {
        clicks: true,
      },
    });

    if (!url) {
      return res.status(404).json({
        error: "URL not found",
      });
    }

    if (url.userId !== req.user.userId) {
      return res.status(403).json({
        error: "Access denied",
      });
    }

    res.json({
      id: url.id,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      totalClicks: url.clicks.length,
      clicks: url.clicks,
    });
  } catch (error) {
    console.error("Analytics error:", error);
    res.status(500).json({
      error: "Internal server error",
    });
  }
};
module.exports = {
  createShortUrl,
  redirectToOriginalUrl,
  getUrlAnalytics
};      