const express = require("express");
const { register, login, getMe, getStaffAccounts } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);
router.get("/staff", protect, getStaffAccounts);

module.exports = router;
