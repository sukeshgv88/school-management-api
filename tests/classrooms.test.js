const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const User = require('../models/User');
const School = require('../models/School');
const bcrypt = require('bcrypt');

jest.setTimeout(30000);

let mongoServer;
let authToken;
let server;
let app;
let PORT;
let testSchoolId; // ✅ Store test school ID

beforeAll(async () => {
    try {
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri(), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        if (server) {
            console.log("🛑 Closing previous test server...");
            await server.close();
        }

        app = require('../server');
        server = app.listen(0, () => {
            PORT = server.address().port;
            console.log(`Test server running on port ${PORT}`);
        });

        await new Promise((resolve) => setTimeout(resolve, 500));

        // ✅ Create test user
        const hashedPassword = await bcrypt.hash("password@123", 10);
        await User.create({
            name: "Test Admin",
            email: "testadminuser@gmail.com",
            password: hashedPassword,
            role: "superadmin"
        });

        // ✅ Create a test school
        const testSchool = await School.create({
            name: "Test School",
            location: "Test City",
            principal: "Dr. Principal",
            admin: "Admin Name",
            address: "123 Main Street"
        });

        testSchoolId = testSchool._id.toString(); // ✅ Convert ObjectId to string

        await new Promise((resolve) => setTimeout(resolve, 500));

        const loginRes = await request(`http://127.0.0.1:${PORT}`)
            .post('/api/auth/login')
            .send({ email: "testadminuser@gmail.com", password: "password@123" });

        console.log("🔹 Login Response:", loginRes.body);

        if (loginRes.status !== 200 || !loginRes.body.token) {
            throw new Error("Login failed. Check credentials or API response.");
        }

        authToken = loginRes.body.token;
    } catch (error) {
        console.error("Test setup failed:", error);
        throw new Error("Test setup failed. Check MongoDB and Auth API.");
    }
});

afterAll(async () => {
    console.log("🛑 Cleaning up after tests...");
    await mongoose.disconnect();
    await mongoServer.stop();

    if (server) {
        console.log("🛑 Closing test server...");
        await server.close();
    }

    console.log("✅ Cleanup complete!");
});

describe('Classrooms API Tests', () => {
    it('✅ Should create a classroom', async () => {
        const res = await request(`http://127.0.0.1:${PORT}`)
            .post('/api/classrooms')
            .set("Authorization", `Bearer ${authToken}`)
            .send({ 
                name: "Math 101", 
                teacher: "Dr. Smith",
                capacity: 30, 
                school: testSchoolId // ✅ Pass valid school ID
            });

        console.log("🔹 Classroom Creation Response:", res.body);

        expect(res.statusCode).toBe(201);
    });

    it('✅ Should fetch all classrooms', async () => {
        const res = await request(`http://127.0.0.1:${PORT}`)
            .get('/api/classrooms')
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
    });

    it('❌ Should return 404 for non-existing classroom', async () => {
        const res = await request(`http://127.0.0.1:${PORT}`)
            .get('/api/classrooms/6123456789abcdef12345678')
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.statusCode).toBe(404);
    });

    it('✅ Should delete a classroom', async () => {
        const classroom = await request(`http://127.0.0.1:${PORT}`)
            .post('/api/classrooms')
            .set("Authorization", `Bearer ${authToken}`)
            .send({ 
                name: "Science 102", 
                teacher: "Dr. Adams",
                capacity: 25, 
                school: testSchoolId // ✅ Pass valid school ID
            });

        console.log("🔹 Created Classroom:", classroom.body);

        expect(classroom.statusCode).toBe(201);

        const res = await request(`http://127.0.0.1:${PORT}`)
            .delete(`/api/classrooms/${classroom.body._id}`)
            .set("Authorization", `Bearer ${authToken}`);

        expect(res.statusCode).toBe(200);
    });
});