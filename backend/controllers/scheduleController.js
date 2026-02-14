const Schedule = require("../models/Schedule");

// GET /api/schedules — all schedules for current user
exports.getSchedules = async (req, res) => {
  try {
    const schedules = await Schedule.find({ userId: req.user.id })
      .populate("bookId", "title author")
      .sort({ dayOfWeek: 1, time: 1 });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/schedules/:id
exports.getSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ _id: req.params.id, userId: req.user.id })
      .populate("bookId", "title author");
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/schedules
exports.createSchedule = async (req, res) => {
  try {
    const { dayOfWeek, time, activity, bookId } = req.body;
    const schedule = await Schedule.create({
      userId: req.user.id,
      dayOfWeek,
      time,
      activity,
      bookId: bookId || null,
    });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// PUT /api/schedules/:id
exports.updateSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });
    res.json(schedule);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// DELETE /api/schedules/:id
exports.deleteSchedule = async (req, res) => {
  try {
    const schedule = await Schedule.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!schedule) return res.status(404).json({ message: "Schedule not found" });
    res.json({ message: "Schedule deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
