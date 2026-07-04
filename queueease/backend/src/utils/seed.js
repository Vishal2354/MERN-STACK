// Run with: npm run seed
// Creates sample departments and staff accounts so the app isn't a blank slate.
require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const User = require("../models/User");
const Department = require("../models/Department");

const departmentsData = [
  { name: "General Checkup", description: "Walk-in general consultations", avgServiceTime: 12 },
  { name: "Billing Counter", description: "Payments and billing queries", avgServiceTime: 5 },
  { name: "Pharmacy", description: "Medicine pickup", avgServiceTime: 4 },
];

const staffAccounts = [
  { name: "Reception Staff", email: "staff@queueease.com", password: "staff123", department: "General Checkup" },
  { name: "Alok", email: "alok.raja@gmail.com", password: "staff123", department: "Billing Counter" },
  { name: "Billing Staff", email: "billing@queueease.com", password: "staff123", department: "Billing Counter" },
  { name: "Pharmacy Staff", email: "pharmacy@queueease.com", password: "staff123", department: "Pharmacy" },
  { name: "General Staff A", email: "general1@queueease.com", password: "staff123", department: "General Checkup" },
  { name: "General Staff B", email: "general2@queueease.com", password: "staff123", department: "General Checkup" },
  { name: "Billing Staff A", email: "billing1@queueease.com", password: "staff123", department: "Billing Counter" },
  { name: "Billing Staff B", email: "billing2@queueease.com", password: "staff123", department: "Billing Counter" },
  { name: "Pharmacy Staff A", email: "pharmacy1@queueease.com", password: "staff123", department: "Pharmacy" },
  { name: "Pharmacy Staff B", email: "pharmacy2@queueease.com", password: "staff123", department: "Pharmacy" },
];

const run = async () => {
  await connectDB();

  const departments = {};
  for (const dept of departmentsData) {
    const existing = await Department.findOne({ name: dept.name });
    if (existing) {
      departments[dept.name] = existing;
      continue;
    }
    const created = await Department.create(dept);
    departments[dept.name] = created;
  }

  console.log(`Seeded departments: ${Object.keys(departments).join(", ")}`);

  const adminEmail = "admin@queueease.com";
  const existingAdmin = await User.findOne({ email: adminEmail });
  if (!existingAdmin) {
    await User.create({
      name: "Admin",
      email: adminEmail,
      password: "admin123",
      role: "admin",
    });
    console.log("Created admin account -> admin@queueease.com / admin123");
  } else {
    console.log("Admin account already exists -> admin@queueease.com");
  }

  for (const staff of staffAccounts) {
    const existing = await User.findOne({ email: staff.email }).select('+password');
    const department = departments[staff.department];
    if (!department) {
      console.warn(`Skipping ${staff.email}: missing department ${staff.department}`);
      continue;
    }

    if (existing) {
      existing.name = staff.name;
      existing.role = "staff";
      existing.department = department._id;
      existing.password = staff.password;
      await existing.save();
      console.log(`Updated staff account -> ${staff.email} / ${staff.password} (${staff.department})`);
      continue;
    }

    await User.create({
      name: staff.name,
      email: staff.email,
      password: staff.password,
      role: "staff",
      department: department._id,
    });
    console.log(`Created staff account -> ${staff.email} / ${staff.password} (${staff.department})`);
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
