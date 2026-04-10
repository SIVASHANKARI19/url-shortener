require("dotenv").config();
const request = require("supertest");
const app = require("../app");
const prisma = require("../config/db");

describe("Auth Routes", () => {

  // Clean before each test in this file
  beforeEach(async () => {
    await prisma.click.deleteMany();
    await prisma.url.deleteMany();
    await prisma.user.deleteMany();
  });

  // ─── REGISTER ───────────────────────────────────────

  describe("POST /api/auth/register", () => {

    it("should register a new user successfully", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Test User",
          email: "test@gmail.com",
          password: "password123"
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("User registered successfully");
      expect(res.body.user.email).toBe("test@gmail.com");
      expect(res.body.user.password).toBeUndefined(); // password never returned
    });

    it("should fail if email already exists", async () => {
      // First register
      await request(app)
        .post("/api/auth/register")
        .send({ name: "Test", email: "test@gmail.com", password: "password123" });

      // Try to register again with same email
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Test", email: "test@gmail.com", password: "password123" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("User already exists with this email");
    });

    it("should fail if required fields are missing", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ email: "test@gmail.com" }); // missing name and password

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("name, email and password are required");
    });

    it("should fail if password is too short", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({ name: "Test", email: "test@gmail.com", password: "123" });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe("Password must be at least 6 characters");
    });

  });

  // ─── LOGIN ───────────────────────────────────────────

  describe("POST /api/auth/login", () => {

    beforeEach(async () => {
      // Create a user to login with
      await request(app)
        .post("/api/auth/register")
        .send({ name: "Test", email: "test@gmail.com", password: "password123" });
    });

    it("should login successfully and return token", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@gmail.com", password: "password123" });

      expect(res.statusCode).toBe(200);
      expect(res.body.token).toBeDefined(); // token exists
      expect(typeof res.body.token).toBe("string"); // token is a string
      expect(res.body.user.email).toBe("test@gmail.com");
    });

    it("should fail with wrong password", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "test@gmail.com", password: "wrongpassword" });

      expect(res.statusCode).toBe(401);
      expect(res.body.message).toBe("Invalid credentials");
    });

    it("should fail if user does not exist", async () => {
      const res = await request(app)
        .post("/api/auth/login")
        .send({ email: "nobody@gmail.com", password: "password123" });

      expect(res.statusCode).toBe(404);
      expect(res.body.message).toBe("User not found");
    });

  });

});