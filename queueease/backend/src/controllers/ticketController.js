const Ticket = require("../models/Ticket");
const Department = require("../models/Department");
const { emitQueueUpdate } = require("../sockets/index");

// How many people are ahead of this ticket in its department's waiting line.
// We rank by tokenNumber rather than createdAt so the ordering stays stable
// even if two tickets are created in the same millisecond.
const getPosition = async (ticket) => {
  const aheadCount = await Ticket.countDocuments({
    department: ticket.department,
    status: "waiting",
    tokenNumber: { $lt: ticket.tokenNumber },
    createdAt: { $gte: startOfToday() },
  });
  return aheadCount + 1;
};

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const withEstimate = async (ticket, department) => {
  const position = ticket.status === "waiting" ? await getPosition(ticket) : null;
  const estimatedWaitMinutes = position ? (position - 1) * department.avgServiceTime : 0;
  return {
    ...ticket.toObject(),
    position,
    estimatedWaitMinutes,
  };
};

// @route  POST /api/tickets/join   (public - no login needed)
const validatePhoneNumber = (value) => {
  const digits = String(value).replace(/\D/g, "");
  return digits.length >= 7 && digits.length <= 15;
};

const joinQueue = async (req, res, next) => {
  try {
    const { departmentId, customerName, customerPhone } = req.body;

    if (!departmentId || !customerName || !customerPhone) {
      return res.status(400).json({ message: "Department, name and phone number are required" });
    }

    const trimmedName = String(customerName).trim();
    const trimmedPhone = String(customerPhone).trim();

    if (!trimmedName || trimmedName.length < 2) {
      return res.status(400).json({ message: "Please provide a valid name." });
    }

    if (!validatePhoneNumber(trimmedPhone)) {
      return res.status(400).json({ message: "Please provide a valid phone number with at least 7 digits." });
    }

    const department = await Department.findById(departmentId);
    if (!department || !department.isActive) {
      return res.status(404).json({ message: "This department is not accepting tickets right now" });
    }

    const tokenNumber = await Ticket.getNextTokenNumber(departmentId);

    const ticket = await Ticket.create({
      department: departmentId,
      tokenNumber,
      customerName: trimmedName,
      customerPhone: trimmedPhone,
    });

    emitQueueUpdate(departmentId);

    const enriched = await withEstimate(ticket, department);
    res.status(201).json(enriched);
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/tickets/:id   (public - customer polls/opens this to check status)
const getTicketStatus = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id).populate("department", "name avgServiceTime");
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    const enriched = await withEstimate(ticket, ticket.department);
    res.json(enriched);
  } catch (err) {
    next(err);
  }
};

// @route  GET /api/tickets/department/:departmentId   (staff/admin)
// Returns today's queue for a department, split by status, for the staff dashboard.
const getDepartmentQueue = async (req, res, next) => {
  try {
    const { departmentId } = req.params;

    const tickets = await Ticket.find({
      department: departmentId,
      createdAt: { $gte: startOfToday() },
      status: { $in: ["waiting", "called", "serving"] },
    }).sort("tokenNumber");

    const waiting = tickets.filter((t) => t.status === "waiting");
    const active = tickets.filter((t) => t.status === "called" || t.status === "serving");

    res.json({ waiting, active, totalWaiting: waiting.length });
  } catch (err) {
    next(err);
  }
};

// @route  PATCH /api/tickets/:id/call   (staff/admin)
// Pulls the next waiting ticket (or a specific one, if id is given) and marks it "called"
const callNext = async (req, res, next) => {
  try {
    let ticket;

    if (req.params.id) {
      ticket = await Ticket.findById(req.params.id);
    }

    if (!ticket) {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (ticket.status !== "waiting") {
      return res.status(400).json({ message: `Ticket is already ${ticket.status}` });
    }

    ticket.status = "called";
    ticket.calledAt = new Date();
    ticket.servedBy = req.user._id;
    await ticket.save();

    emitQueueUpdate(ticket.department);
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

// @route  PATCH /api/tickets/:id/serving   (staff/admin) - customer has arrived at the counter
const markServing = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.status = "serving";
    await ticket.save();

    emitQueueUpdate(ticket.department);
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

// @route  PATCH /api/tickets/:id/complete   (staff/admin)
const completeTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.status = "completed";
    ticket.completedAt = new Date();
    await ticket.save();

    emitQueueUpdate(ticket.department);
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

// @route  PATCH /api/tickets/:id/cancel   (public - customer changed their mind, or staff marking a no-show)
const cancelTicket = async (req, res, next) => {
  try {
    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: "Ticket not found" });

    ticket.status = req.body.noShow ? "no-show" : "cancelled";
    await ticket.save();

    emitQueueUpdate(ticket.department);
    res.json(ticket);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  joinQueue,
  getTicketStatus,
  getDepartmentQueue,
  callNext,
  markServing,
  completeTicket,
  cancelTicket,
};
