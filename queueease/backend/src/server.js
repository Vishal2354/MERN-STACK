require("dotenv").config();
process.env.JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const connectDB = require("./config/db");
const { initSocket } = require("./sockets/index");
const { errorHandler, notFound } = require("./middleware/errorHandler");

const authRoutes = require("./routes/authRoutes");
const departmentRoutes = require("./routes/departmentRoutes");
const ticketRoutes = require("./routes/ticketRoutes");
const statsRoutes = require("./routes/statsRoutes");

connectDB();

const app = express();
const server = http.createServer(app);

const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173", "http://127.0.0.1:5173"].filter(Boolean);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
initSocket(io);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
  credentials: true,
}));
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok", time: new Date().toISOString() }));

app.use("/api/auth", authRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/tickets", ticketRoutes);
app.use("/api/stats", statsRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`QueueEase API running on port ${PORT}`));
