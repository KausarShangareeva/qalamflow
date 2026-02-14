const mongoose = require("mongoose");

const progressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      default: Date.now,
    },
    pagesRead: {
      type: Number,
      required: [true, "Pages read is required"],
      min: 0,
    },
    timeSpent: {
      type: Number,
      required: [true, "Time spent is required"],
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Progress", progressSchema);
