const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Department = require("../src/models/Department");

let mongod;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri();
  await connectDB();

  const department = await Department.create({
    name: "General Checkup",
    description: "Walk-in general consultations",
    avgServiceTime: 12,
  });

  await User.create({
    name: "Admin",
    email: "admin@queueease.com",
    password: "admin123",
    role: "admin",
  });

  await User.create({
    name: "Reception Staff",
    email: "staff@queueease.com",
    password: "staff123",
    role: "staff",
    department: department._id,
  });
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});
