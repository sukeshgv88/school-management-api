const request = require("supertest");
const app = require("../app"); // Ensure correct path to your Express app
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const User = require("../models/User");

beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    // Clear test database
    await User.deleteMany();

    // Seed test user
    await User.create({
        name: "Test Admin",
        email: "testadminuser@gmail.com",
        password: await bcrypt.hash("password@123", 10),
        role: "superadmin"
    });
});

afterAll(async () => {
    await mongoose.connection.close(); // Close MongoDB connection
});

describe("Auth API Tests", () => {
    test("✅ Should register a new user", async () => {
        const res = await request(app).post("/api/auth/register").send({
            name: "Test User",
            email: "testuser1@gmail.com",
            "schoolId": "67a7486f1091cc5da56fed9e",
            password: "password123",
            role: "schooladmin"
        });

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("message", "User registered successfully");
    });

    test("✅ Should login a user", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "testadminuser@gmail.com",
            password: "password@123"
        });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
    });

    test("❌ Should not login with incorrect credentials", async () => {
        const res = await request(app).post("/api/auth/login").send({
            email: "testadmin@gmail.com",
            password: "wrongpassword"
        });

        expect(res.status).toBe(401);
        expect(res.body).toHaveProperty("error", "Invalid credentials");
    });
});