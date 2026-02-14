const mongoose = require("mongoose");

const scheduleSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    dayOfWeek: {
      type: String,
      enum: [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ],
      required: [true, "Day of week is required"],
    },
    time: {
      type: String,
      required: [true, "Time is required"],
    },
    activity: {
      type: String,
      required: [true, "Activity is required"],
      trim: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Schedule", scheduleSchema);
