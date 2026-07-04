const Ticket = require("../models/Ticket");
const Department = require("../models/Department");

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

// @route  GET /api/stats/overview   (admin only)
// Gives a quick daily snapshot per department - enough for an MVP admin
// dashboard without building out a full analytics/reporting module.
const getOverview = async (req, res, next) => {
  try {
    const departments = await Department.find();
    const todayFilter = { createdAt: { $gte: startOfToday() } };

    const overview = await Promise.all(
      departments.map(async (dept) => {
        const total = await Ticket.countDocuments({ department: dept._id, ...todayFilter });
        const completed = await Ticket.countDocuments({
          department: dept._id,
          status: "completed",
          ...todayFilter,
        });
        const waiting = await Ticket.countDocuments({
          department: dept._id,
          status: "waiting",
          ...todayFilter,
        });
        const cancelled = await Ticket.countDocuments({
          department: dept._id,
          status: { $in: ["cancelled", "no-show"] },
          ...todayFilter,
        });

        return {
          department: { _id: dept._id, name: dept.name },
          total,
          completed,
          waiting,
          cancelled,
        };
      })
    );

    res.json(overview);
  } catch (err) {
    next(err);
  }
};

module.exports = { getOverview };
