const request = require('supertest');
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../app');
const User = require('../models/User'); // Ensure correct path
const Classroom = require('../models/Classroom'); // Ensure correct path

jest.setTimeout(30000); // Increase Jest timeout

describe('Students API Tests', () => {
    let mongoServer;
    let authToken;
    let testClassroomId;

    beforeAll(async () => {
        console.log("🚀 Starting test setup...");

        // 🔹 Start in-memory MongoDB
        mongoServer = await MongoMemoryServer.create();
        await mongoose.connect(mongoServer.getUri(), {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        console.log("✅ MongoDB Memory Server Connected.");

        // 🔹 Create a test admin user
        const hashedPassword = "$2b$10$KBmDdySNGmwGyGoVb/u3terSJkyM24e0zuR/WiSVP/REykhUotI72"; // Pre-hashed "password@123"
        await User.create({
            name: "Test Admin",
            email: "testadminuser@gmail.com",
            password: hashedPassword,
            role: "superadmin"
        });

        console.log("✅ Test admin user created.");

        // 🔹 Login to get authToken
        const loginRes = await request(app).post("/api/auth/login").send({
            email: "testadminuser@gmail.com",
            password: "password@123",
        });

        if (loginRes.status !== 200 || !loginRes.body.token) {
            throw new Error("Login failed. Check credentials or API response.");
        }

        authToken = loginRes.body.token;
        console.log("✅ Authenticated successfully!");

        // 🔹 Create a test classroom
        const classroomRes = await request(app)
            .post('/api/classrooms')
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                name: "Math 101",
                capacity: 30,
                school: "67a7486f1091cc5da56fed9e"
            });

        expect(classroomRes.statusCode).toBe(201);
        testClassroomId = classroomRes.body._id;
        console.log("✅ Test classroom created:", testClassroomId);
    });

    afterAll(async () => {
        console.log("\n🛑 Cleaning up test environment...");
    
        // ✅ Close MongoDB connection
        await mongoose.connection.close();
        console.log("⚠️ MongoDB Disconnected");
    
        // ✅ Close Redis connection if applicable
        if (global.redisClient && global.redisClient.quit) {
            await global.redisClient.quit();
            console.log("⚠️ Redis Disconnected");
        }
    
        // ✅ Close Express server properly
        if (global.server && global.server.close) {
            await new Promise((resolve) => global.server.close(resolve));
            console.log("🛑 Closing test server...");
        }
    
        console.log("✅ Cleanup complete!\n");
    });

    it('✅ Should enroll a student', async () => {
        const res = await request(app)
            .post('/api/students')
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                name: "John Doe",
                age: 20,
                grade: "10th",
                classroom: testClassroomId // ✅ Use correct field
            });

        console.log("🔹 Student Enrollment Response:", res.body);
        expect(res.statusCode).toBe(201);
    });

    it('✅ Should fetch all students', async () => {
        const res = await request(app)
            .get('/api/students')
            .set("Authorization", `Bearer ${authToken}`);

        console.log("🔹 Fetched Students:", res.body);
        expect(res.statusCode).toBe(200);
    });

    it('❌ Should return 404 for non-existing student', async () => {
        const res = await request(app)
            .get('/api/students/6123456789abcdef12345678')
            .set("Authorization", `Bearer ${authToken}`);

        console.log("🔹 Non-Existing Student Response:", res.body);
        expect(res.statusCode).toBe(404);
    });

    it('✅ Should delete a student', async () => {
        // ✅ First create a student
        const student = await request(app)
            .post('/api/students')
            .set("Authorization", `Bearer ${authToken}`)
            .send({
                name: "Jane Doe",
                age: 22,
                grade: "12th",
                classroom: testClassroomId
            });

        console.log("🔹 Created Student for Deletion:", student.body);
        expect(student.statusCode).toBe(201);
        const studentId = student.body._id;

        // ✅ Then delete the student
        const res = await request(app)
            .delete(`/api/students/${studentId}`)
            .set("Authorization", `Bearer ${authToken}`);

        console.log("🔹 Delete Response:", res.body);
        expect(res.statusCode).toBe(200);
    });
});