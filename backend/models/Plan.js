const mongoose = require("mongoose");

const scheduleEntrySchema = new mongoose.Schema(
  {
    day: { type: String, required: true },
    startTime: { type: String, required: true },
    course: { type: String, required: true },
    duration: { type: Number, required: true },
  },
  { _id: false }
);

const planSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    clientId: {
      type: String,
      required: true,
    },
    color: { type: String, default: "" },
    title: { type: String, default: "" },
    description: { type: String, default: "" },
    schedule: [scheduleEntrySchema],
    orientation: {
      type: String,
      enum: ["vertical", "horizontal"],
      default: "vertical",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Plan", planSchema);
