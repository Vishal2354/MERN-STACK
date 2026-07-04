const mongoose = require("mongoose");

const ticketSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
    tokenNumber: {
      type: Number,
      required: true,
    },
    customerName: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    customerPhone: {
      type: String,
      required: [true, "Phone number is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["waiting", "called", "serving", "completed", "cancelled", "no-show"],
      default: "waiting",
    },
    servedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    calledAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Tickets are scoped per department, per calendar day - so token #1 at the
// billing counter and token #1 at OPD can coexist without clashing, and
// numbering resets naturally every morning instead of growing forever.
ticketSchema.statics.getNextTokenNumber = async function (departmentId) {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const countToday = await this.countDocuments({
    department: departmentId,
    createdAt: { $gte: startOfDay },
  });

  return countToday + 1;
};

module.exports = mongoose.model("Ticket", ticketSchema);
