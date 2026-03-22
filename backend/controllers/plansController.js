const Plan = require("../models/Plan");
const User = require("../models/User");

// GET /api/plans — get all plans for current user
const getPlans = async (req, res) => {
  try {
    const plans = await Plan.find({ userId: req.user.id }).sort({ createdAt: -1 });
    const result = plans.map((p) => ({
      id: p.clientId,
      createdAt: p.createdAt.toISOString(),
      color: p.color,
      title: p.title,
      description: p.description,
      schedule: p.schedule,
      orientation: p.orientation,
      userName: p.userName,
    }));
    res.json(result);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// POST /api/plans — create a new plan
const createPlan = async (req, res) => {
  try {
    const { id, createdAt, color, title, description, schedule, orientation } = req.body;
    const user = await User.findById(req.user.id).select("name");
    const plan = await Plan.create({
      userId: req.user.id,
      clientId: id,
      userName: user?.name || "",
      color,
      title,
      description,
      schedule,
      orientation,
      createdAt: createdAt ? new Date(createdAt) : undefined,
    });
    res.status(201).json({
      id: plan.clientId,
      createdAt: plan.createdAt.toISOString(),
      color: plan.color,
      title: plan.title,
      description: plan.description,
      schedule: plan.schedule,
      orientation: plan.orientation,
      userName: plan.userName,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// PUT /api/plans/:id — update a plan by clientId
const updatePlan = async (req, res) => {
  try {
    const { color, title, description, schedule, orientation } = req.body;
    const plan = await Plan.findOneAndUpdate(
      { clientId: req.params.id, userId: req.user.id },
      { color, title, description, schedule, orientation },
      { new: true }
    );
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json({
      id: plan.clientId,
      createdAt: plan.createdAt.toISOString(),
      color: plan.color,
      title: plan.title,
      description: plan.description,
      schedule: plan.schedule,
      orientation: plan.orientation,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

// DELETE /api/plans/:id — delete a plan by clientId
const deletePlan = async (req, res) => {
  try {
    const plan = await Plan.findOneAndDelete({ clientId: req.params.id, userId: req.user.id });
    if (!plan) return res.status(404).json({ message: "Plan not found" });
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { getPlans, createPlan, updatePlan, deletePlan };
