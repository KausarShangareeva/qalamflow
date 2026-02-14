const mongoose = require("mongoose");

const paceOverrideSchema = new mongoose.Schema(
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
    pagesPerDay: {
      type: Number,
      required: [true, "Pages per day is required"],
      min: 0.1,
    },
  },
  { timestamps: true }
);

paceOverrideSchema.index({ userId: 1, bookId: 1 }, { unique: true });

module.exports = mongoose.model("PaceOverride", paceOverrideSchema);
