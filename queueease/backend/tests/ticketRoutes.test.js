const test = require("node:test");
const assert = require("node:assert/strict");
const express = require("express");
const { once } = require("node:events");

const ticketRoutes = require("../src/routes/ticketRoutes");

test("staff queue requests hit the protected department route instead of the public ticket lookup", async () => {
  const app = express();
  app.use("/api/tickets", ticketRoutes);

  const server = app.listen(0);
  await once(server, "listening");

  try {
    const { port } = server.address();
    const response = await fetch(`http://127.0.0.1:${port}/api/tickets/department/test-department`);
    const body = await response.json();

    assert.equal(response.status, 401);
    assert.equal(body.message, "Not authorized, no token provided");
  } finally {
    server.close();
  }
});
