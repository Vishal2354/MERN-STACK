const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { once } = require("node:events");

const authRoutes = require("../src/routes/authRoutes");

test("login works with built-in demo credentials when MongoDB is unavailable", async () => {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);

  const server = app.listen(0);
  await once(server, "listening");

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "admin@queueease.com", password: "admin123" }),
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.equal(body.role, "admin");
    assert.ok(body.token);
  } finally {
    server.close();
  }
});

test("admin can fetch all staff accounts with their department details", async () => {
  process.env.JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes);

  const server = app.listen(0);
  await once(server, "listening");

  try {
    const { port } = server.address();
    const loginResponse = await fetch(`http://127.0.0.1:${port}/api/auth/login`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: "admin@queueease.com", password: "admin123" }),
    });

    assert.equal(loginResponse.status, 200);
    const loginBody = await loginResponse.json();

    const response = await fetch(`http://127.0.0.1:${port}/api/auth/staff`, {
      headers: { authorization: `Bearer ${loginBody.token}` },
    });

    assert.equal(response.status, 200);
    const body = await response.json();
    assert.ok(Array.isArray(body));
    assert.ok(body.some((staff) => staff.email === "staff@queueease.com"));
    assert.ok(body.some((staff) => staff.department && staff.department.name));
  } finally {
    server.close();
  }
});
