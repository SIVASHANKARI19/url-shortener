const prisma = require("../config/db");
const { nanoid } = require("nanoid");
const {
  ValidationError,
  NotFoundError,
  ForbiddenError
} = require("../utils/AppError");
const logger = require("../config/logger");

const isValidUrl = (url) => {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const createShortUrl = async (req, res, next) => {
  try {
    const { originalUrl } = req.body;

    if (!originalUrl) throw new ValidationError("originalUrl is required");
    if (!isValidUrl(originalUrl)) throw new ValidationError("Please provide a valid URL starting with http:// or https://");

    // Check duplicate
    const existingUrl = await prisma.url.findFirst({
      where: { originalUrl, userId: req.user.userId }
    });

    if (existingUrl) {
      return res.status(200).json({
        message: "Short URL already exists for this user",
        url: existingUrl,
        shortUrl: `${process.env.BASE_URL}/${existingUrl.shortCode}`
      });
    }

    // Generate unique short code
    let shortCode;
    let isUnique = false;
    while (!isUnique) {
      shortCode = nanoid(6);
      const exists = await prisma.url.findUnique({ where: { shortCode } });
      if (!exists) isUnique = true;
    }

    const newUrl = await prisma.url.create({
      data: { originalUrl, shortCode, userId: req.user.userId }
    });

    logger.info(`Short URL created: ${shortCode} → ${originalUrl}`);

    res.status(201).json({
      message: "Short URL created successfully",
      url: newUrl,
      shortUrl: `${process.env.BASE_URL}/${shortCode}`
    });

  } catch (error) {
    next(error);
  }
};

const getMyUrls = async (req, res, next) => {
  try {
    const urls = await prisma.url.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: "desc" }
    });

    res.status(200).json({ total: urls.length, urls });

  } catch (error) {
    next(error);
  }
};

const updateUrl = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { originalUrl } = req.body;

    if (!originalUrl) throw new ValidationError("originalUrl is required");
    if (!isValidUrl(originalUrl)) throw new ValidationError("Please provide a valid URL starting with http:// or https://");

    const url = await prisma.url.findUnique({ where: { id: Number(id) } });
    if (!url) throw new NotFoundError("URL not found");
    if (url.userId !== req.user.userId) throw new ForbiddenError("Access denied");

    const updatedUrl = await prisma.url.update({
      where: { id: Number(id) },
      data: { originalUrl }
    });

    logger.info(`URL updated: ${id}`);

    res.status(200).json({
      message: "URL updated successfully",
      url: updatedUrl,
      shortUrl: `${process.env.BASE_URL}/${updatedUrl.shortCode}`
    });

  } catch (error) {
    next(error);
  }
};

const redirectToOriginalUrl = async (req, res, next) => {
  try {
    const { shortCode } = req.params;

    const url = await prisma.url.findUnique({ where: { shortCode } });
    if (!url) throw new NotFoundError("Short URL not found");

    const userAgent = req.headers["user-agent"] || "Unknown";

    await prisma.click.create({
      data: {
        urlId: url.id,
        device: userAgent,
        country: "Unknown"
      }
    });

    logger.info(`Redirect: ${shortCode} → ${url.originalUrl}`);

    return res.redirect(url.originalUrl);

  } catch (error) {
    next(error);
  }
};

const getUrlAnalytics = async (req, res, next) => {
  try {
    const { id } = req.params;

    const url = await prisma.url.findUnique({
      where: { id: Number(id) },
      include: { clicks: true }
    });

    if (!url) throw new NotFoundError("URL not found");
    if (url.userId !== req.user.userId) throw new ForbiddenError("Access denied");

    res.json({
      id: url.id,
      shortCode: url.shortCode,
      originalUrl: url.originalUrl,
      totalClicks: url.clicks.length,
      clicks: url.clicks
    });

  } catch (error) {
    next(error);
  }
};

const deleteUrl = async (req, res, next) => {
  try {
    const { id } = req.params;

    const url = await prisma.url.findUnique({ where: { id: Number(id) } });
    if (!url) throw new NotFoundError("URL not found");
    if (url.userId !== req.user.userId) throw new ForbiddenError("Access denied");

    await prisma.click.deleteMany({ where: { urlId: Number(id) } });
    await prisma.url.delete({ where: { id: Number(id) } });

    logger.info(`URL deleted: ${id}`);

    res.status(200).json({ message: "URL deleted successfully" });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  createShortUrl,
  getMyUrls,
  updateUrl,
  redirectToOriginalUrl,
  getUrlAnalytics,
  deleteUrl
};
