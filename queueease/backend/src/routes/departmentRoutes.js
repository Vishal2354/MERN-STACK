const express = require("express");
const {
  getDepartments,
  getDepartment,
  createDepartment,
  updateDepartment,
  deleteDepartment,
} = require("../controllers/departmentController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

router.get("/", getDepartments); // public - customers need to browse this
router.get("/:id", getDepartment);

router.post("/", protect, restrictTo("admin"), createDepartment);
router.patch("/:id", protect, restrictTo("admin"), updateDepartment);
router.delete("/:id", protect, restrictTo("admin"), deleteDepartment);

module.exports = router;
