const express = require("express");
const { getOverview } = require("../controllers/statsController");
const { protect, restrictTo } = require("../middleware/auth");

const router = express.Router();

router.get("/overview", protect, restrictTo("admin"), getOverview);

module.exports = router;
