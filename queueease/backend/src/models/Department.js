const mongoose = require("mongoose");

/*
 * A "Department" is deliberately generic - it maps to an OPD counter in a
 * clinic, a chair in a salon, or a teller window in a bank. Keeping it
 * generic means the same schema works for every use case the assignment
 * mentions, instead of building separate models per business type.
 */
const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    avgServiceTime: {
      type: Number, // in minutes, used to estimate wait time
      default: 10,
      min: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);
