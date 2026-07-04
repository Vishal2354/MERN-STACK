const Department = require("../models/Department");
const Ticket = require("../models/Ticket");

// @route  GET /api/departments
// @desc   Public - customers need this list to pick where to join the queue
const getDepartments = async (req, res, next) => {
  try {
    const onlyActive = req.query.all !== "true";
    const filter = onlyActive ? { isActive: true } : {};

    const departments = await Department.find(filter).sort("name");
    res.json(departments);
  } catch (err) {
    next(err);
  }
};

const getDepartment = async (req, res, next) => {
  try {
    const department = await Department.findById(req.params.id);
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.json(department);
  } catch (err) {
    next(err);
  }
};

// @route  POST /api/departments  (admin only)
const createDepartment = async (req, res, next) => {
  try {
    const { name, description, avgServiceTime } = req.body;
    if (!name) return res.status(400).json({ message: "Department name is required" });

    const department = await Department.create({ name, description, avgServiceTime });
    res.status(201).json(department);
  } catch (err) {
    next(err);
  }
};

// @route  PATCH /api/departments/:id  (admin only)
const updateDepartment = async (req, res, next) => {
  try {
    const department = await Department.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.json(department);
  } catch (err) {
    next(err);
  }
};

// @route  DELETE /api/departments/:id  (admin only)
// We don't hard-delete if tickets reference it - that would orphan history.
// Instead we just deactivate it so it disappears from the customer-facing list.
const deleteDepartment = async (req, res, next) => {
  try {
    const hasTickets = await Ticket.exists({ department: req.params.id });

    if (hasTickets) {
      const department = await Department.findByIdAndUpdate(
        req.params.id,
        { isActive: false },
        { new: true }
      );
      return res.json({ message: "Department has ticket history, so it was deactivated instead of deleted", department });
    }

    const department = await Department.findByIdAndDelete(req.params.id);
    if (!department) return res.status(404).json({ message: "Department not found" });
    res.json({ message: "Department deleted" });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDepartments, getDepartment, createDepartment, updateDepartment, deleteDepartment };
