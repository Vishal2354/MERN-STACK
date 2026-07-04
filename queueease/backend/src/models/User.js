const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

/*
 * Only staff and admins get accounts. Customers never log in - they
 * interact with the system using just their ticket, which keeps the
 * flow quick for someone standing in a clinic waiting to be seen.
 */
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false,
    },
    role: {
      type: String,
      enum: ["admin", "staff"],
      default: "staff",
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null, // admins aren't tied to a single department
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.password);
};

module.exports = mongoose.model("User", userSchema);
