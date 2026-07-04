const express = require("express");
const {
  joinQueue,
  getTicketStatus,
  getDepartmentQueue,
  callNext,
  markServing,
  completeTicket,
  cancelTicket,
} = require("../controllers/ticketController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

// Public - anyone can join a queue and check their own ticket
router.post("/join", joinQueue);
router.get("/:id", getTicketStatus);
router.patch("/:id/cancel", cancelTicket);

// Staff/admin only
router.get("/department/:departmentId", protect, restrictTo("admin", "staff"), getDepartmentQueue);
router.patch("/:id/call", protect, restrictTo("admin", "staff"), callNext);
router.patch("/:id/serving", protect, restrictTo("admin", "staff"), markServing);
router.patch("/:id/complete", protect, restrictTo("admin", "staff"), completeTicket);

module.exports = router;
