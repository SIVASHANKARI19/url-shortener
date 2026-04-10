const request = require("supertest");
const app = require("../app");
const prisma = require("../config/db");

// Helper — login and get token
const loginUser = async () => {
  await request(app)
    .post("/api/auth/register")
    .send({ name: "Test", email: "test@gmail.com", password: "password123" });

  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "test@gmail.com", password: "password123" });

  return res.body.token;
};

describe("URL Routes", () => {

  beforeEach(async () => {
    await prisma.click.deleteMany();
    await prisma.url.deleteMany();
    await prisma.user.deleteMany();
  });

  // ─── CREATE SHORT URL ────────────────────────────────

  describe("POST /api/urls", () => {

    it("should create a short URL successfully", async () => {
      const token = await loginUser();

      const res = await request(app)
        .post("/api/urls")
        .set("Authorization", `Bearer ${token}`)
        .send({ originalUrl: "https://google.com" });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("Short URL created successfully");
      expect(res.body.url.shortCode).toBeDefined();
      expect(res.body.shortUrl).toContain(res.body.url.shortCode);
    });

    it("should fail without auth token", async () => {
      const res = await request(app)
        .post("/api/urls")
        .send({ originalUrl: "https://google.com" });

      expect(res.statusCode).toBe(401);
    });

    it("should fail with invalid URL", async () => {
      const token = await loginUser();

      const res = await request(app)
        .post("/api/urls")
        .set("Authorization", `Bearer ${token}`)
        .send({ originalUrl: "not-a-url" });

      expect(res.statusCode).toBe(400);
    });

    it("should return existing URL if duplicate", async () => {
      const token = await loginUser();

      // Create first time
      await request(app)
        .post("/api/urls")
        .set("Authorization", `Bearer ${token}`)
        .send({ originalUrl: "https://google.com" });

      // Create again same URL
      const res = await request(app)
        .post("/api/urls")
        .set("Authorization", `Bearer ${token}`)
        .send({ originalUrl: "https://google.com" });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Short URL already exists for this user");
    });

  });

  // ─── GET MY URLS ─────────────────────────────────────

  describe("GET /api/urls", () => {

    it("should return all URLs for logged in user", async () => {
      const token = await loginUser();

      // Create 2 URLs
      await request(app)
        .post("/api/urls")
        .set("Authorization", `Bearer ${token}`)
        .send({ originalUrl: "https://google.com" });

      await request(app)
        .post("/api/urls")
        .set("Authorization", `Bearer ${token}`)
        .send({ originalUrl: "https://youtube.com" });

      const res = await request(app)
        .get("/api/urls")
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBe(2);
      expect(res.body.urls.length).toBe(2);
    });

  });

  // ─── DELETE URL ──────────────────────────────────────

  describe("DELETE /api/urls/:id", () => {

    it("should delete a URL successfully", async () => {
      const token = await loginUser();

      // Create URL
      const createRes = await request(app)
        .post("/api/urls")
        .set("Authorization", `Bearer ${token}`)
        .send({ originalUrl: "https://google.com" });

      const urlId = createRes.body.url.id;

      // Delete it
      const res = await request(app)
        .delete(`/api/urls/${urlId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("URL deleted successfully");
    });

    it("should not delete another user's URL", async () => {
      const token1 = await loginUser();

      // Create URL with user 1
      const createRes = await request(app)
        .post("/api/urls")
        .set("Authorization", `Bearer ${token1}`)
        .send({ originalUrl: "https://google.com" });

      const urlId = createRes.body.url.id;

      // Register and login user 2
      await request(app)
        .post("/api/auth/register")
        .send({ name: "User2", email: "user2@gmail.com", password: "password123" });

      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({ email: "user2@gmail.com", password: "password123" });

      const token2 = loginRes.body.token;

      // Try to delete user 1's URL with user 2's token
      const res = await request(app)
        .delete(`/api/urls/${urlId}`)
        .set("Authorization", `Bearer ${token2}`);

      expect(res.statusCode).toBe(403);
    });

  });

});