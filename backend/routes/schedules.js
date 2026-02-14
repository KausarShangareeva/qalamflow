const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getSchedules,
  getSchedule,
  createSchedule,
  updateSchedule,
  deleteSchedule,
} = require("../controllers/scheduleController");

router.use(auth);

router.get("/", getSchedules);
router.get("/:id", getSchedule);
router.post("/", createSchedule);
router.put("/:id", updateSchedule);
router.delete("/:id", deleteSchedule);

module.exports = router;
