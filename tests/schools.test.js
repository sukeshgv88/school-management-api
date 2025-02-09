const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const bcrypt = require('bcrypt');

jest.setTimeout(30000);

let mongoServer;
let authToken = '';
let server;
let app;
let PORT; // Dynamic port assignment

beforeAll(async () => {
    // ✅ Start in-memory MongoDB
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    // ✅ Ensure previous server instance is closed
    if (server) {
        console.log("🛑 Closing previous test server...");
        await server.close();
    }

    // ✅ Import Express app and start server on a random available port
    app = require('../server');
    server = app.listen(0, () => {
        PORT = server.address().port; // ✅ Get dynamically assigned port
        console.log(`Test server running on port ${PORT}`);
    });

    // ✅ Wait for server to start before proceeding
    await new Promise((resolve) => setTimeout(resolve, 500));

    // ✅ Create test user with hashed password
    const hashedPassword = await bcrypt.hash("password@123", 10);
    await User.create({
        name: "Test Admin",
        email: "testadminuser@gmail.com",
        password: hashedPassword,
        role: "superadmin"
    });

    // ✅ Ensure DB writes complete before login
    await new Promise((resolve) => setTimeout(resolve, 500));

    // ✅ Attempt to log in
    const loginRes = await request(`http://127.0.0.1:${PORT}`)
        .post('/api/auth/login')
        .send({ email: "testadminuser@gmail.com", password: "password@123" });

    console.log("🔹 Login Response:", loginRes.body);

    if (loginRes.status !== 200 || !loginRes.body.token) {
        throw new Error("Login failed. Check credentials or API response.");
    }

    authToken = loginRes.body.token;
});

afterAll(async () => {
    console.log("🛑 Cleaning up after tests...");

    // ✅ Ensure MongoDB is properly disconnected
    await mongoose.disconnect();
    await mongoServer.stop();

    // ✅ Close the Express server to free up the port
    if (server) {
        console.log("🛑 Closing test server...");
        await server.close();
    }

    // ✅ Ensure Redis is also closed if used in the app
    if (global.redisClient) {
        console.log("🛑 Closing Redis connection...");
        global.redisClient.quit();
    }

    console.log("✅ Cleanup complete!");
});

describe("Schools API Tests", () => {
    it("✅ Should create a school", async () => {
        const res = await request(`http://127.0.0.1:${PORT}`)
            .post('/api/schools')
            .set("Authorization", `Bearer ${authToken}`)
            .send({ 
                name: "School A",  
                location: "Bangalore",
                principal: "Dr. Principal",
                admin: "Admin Name",
                address: "123 Main Street, Bangalore"
            });

        console.log("🔹 School Creation Response:", res.body);

        expect(res.statusCode).toBe(201);
    });

    it("✅ Should fetch all schools", async () => {
        const res = await request(`http://127.0.0.1:${PORT}`)
            .get('/api/schools')
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
    });
});