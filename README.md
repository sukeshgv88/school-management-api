# 🏫 School Management API

## 📌 Overview
The **School Management API** is a **RESTful service** built with **Node.js, Express, MongoDB, and Redis**. It provides functionalities for **managing schools, classrooms, and students** while implementing **JWT-based authentication and role-based access control (RBAC)**.

## 🚀 Features
- **User Authentication** (Superadmin & School Admins)
- **JWT-based Security** 🔐
- **Role-Based Access Control (RBAC)**
- **CRUD operations for Schools, Classrooms, and Students**
- **Data Caching with Redis**
- **Rate Limiting for API Security**
- **Comprehensive Logging for Debugging**
- **MongoDB as the Primary Database**

---

## 🛠️ Installation & Setup

### **1️⃣ Clone the Repository**
```sh
git clone https://github.com/qantra-io/axion.git
cd school-mgmt-api
git checkout school-mgmt-api-task

2️⃣ Install Dependencies

npm install

3️⃣ Configure Environment Variables

Create a .env file in the root directory and add the following:

# Application Configuration
SERVICE_NAME=school-mgmt-api
ENV=development

# Server Ports
USER_PORT=5001
ADMIN_PORT=6000
ADMIN_URL=http://localhost:6000

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/school_mgmt

# Redis Configuration
REDIS_URI=redis://127.0.0.1:6379

# Authentication Secrets (Keep these hidden)
JWT_SECRET=your-secret-key

# Security & Rate Limiting
RATE_LIMIT_WINDOW=15  # In minutes
RATE_LIMIT_MAX=100    # Max requests per window

# Logging Configuration
LOG_LEVEL=info

4️⃣ Start the Server

npm start

The server will run on http://localhost:5001.

🏗️ API Documentation

Authentication API

🔹 Register a New User

(Superadmin can create school admins)

POST /api/auth/register

📌 Request Body:

{
    "name": "John Doe",
    "email": "admin@example.com",
    "password": "securepassword",
    "role": "schooladmin",
    "schoolId": "67a7486f1091cc5da56fed9e"
}

📌 Response:

{
    "message": "User registered successfully",
    "userId": "67a7c1851db754554c7758f1",
    "role": "schooladmin"
}

🔹 User Login

POST /api/auth/login

📌 Request Body:

{
    "email": "admin@example.com",
    "password": "securepassword"
}

📌 Response:

{
    "message": "Login successful",
    "token": "jwt_token_here",
    "role": "schooladmin"
}

🔹 Get User Profile

GET /api/auth/profile

📌 Headers:

Authorization: Bearer <jwt_token>

📌 Response:

{
    "name": "John Doe",
    "email": "admin@example.com",
    "role": "schooladmin"
}

🏫 Schools API

🔹 Create a School

POST /api/schools

📌 Headers:

Authorization: Bearer <superadmin_token>

📌 Request Body:

{
    "name": "My School",
    "location": "Bangalore",
    "principal": "Dr. Principal",
    "admin": "Admin Name",
    "address": "123 Main Street, Bangalore"
}

📌 Response:

{
    "message": "School created successfully",
    "schoolId": "67a7486f1091cc5da56fed9e"
}

🔹 Get All Schools

GET /api/schools

📌 Headers:

Authorization: Bearer <superadmin_token>

📌 Response:

[
    {
        "_id": "67a7486f1091cc5da56fed9e",
        "name": "My School",
        "location": "Bangalore",
        "principal": "Dr. Principal",
        "admin": "Admin Name",
        "address": "123 Main Street, Bangalore"
    }
]

📚 Classrooms API

🔹 Create a Classroom

POST /api/classrooms

📌 Headers:

Authorization: Bearer <schooladmin_token>

📌 Request Body:

{
    "name": "Classroom A",
    "school": "67a7486f1091cc5da56fed9e",
    "capacity": 30
}

📌 Response:

{
    "message": "Classroom created successfully",
    "classroomId": "67a74af73991895146598ddb"
}

👩‍🎓 Students API

🔹 Enroll a Student

POST /api/students

📌 Headers:

Authorization: Bearer <schooladmin_token>

📌 Request Body:

{
    "name": "Test Student A",
    "age": 12,
    "grade": "6",
    "schoolId": "67a7486f1091cc5da56fed9e",
    "classroom": "67a74af73991895146598ddb"
}

📌 Response:

{
    "message": "Student enrolled successfully",
    "studentId": "67a74af73991895146598eec"
}

🔐 Role-Based Access Control (RBAC)

Role	Permissions
Superadmin	Can create, update, and delete schools, assign school admins
Schooladmin	Can only manage their assigned school (restricted by schoolId)

📌 Middleware:
	•	authenticateJWT → Ensures a valid JWT token is provided.
	•	authorizeRoles('superadmin') → Restricts routes to superadmins.
	•	authorizeRoles('schooladmin') → Restricts routes to school admins and Ensures school admins can only access their own school.

🛠️ Development & Debugging

Check Server Logs

npm start

Check API Logs in Postman
	•	Open Postman
	•	Add Authorization: Bearer <jwt_token> in Headers
	•	Make a POST /api/auth/login request to get a valid token.

🌍 Deployment Instructions
	1.	Create a .env.production file with production secrets
	2.	Use Docker to containerize the application
	3.	Deploy on AWS/GCP/DigitalOcean/Vercel
	4.	Use MongoDB Atlas for production database
	5.	Enable HTTPS with SSL/TLS


🏆 Credits

School management api's added by: Sukesha

