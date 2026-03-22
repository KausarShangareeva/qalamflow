require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/mongodb");
const authRoutes = require("./routes/auth");
const suggestionRoutes = require("./routes/suggestions");
const feedbackRoutes = require("./routes/feedback");
const planRoutes = require("./routes/plans");

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: "5mb" }));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "QalamFlow API running" });
});
app.use("/api/auth", authRoutes);
app.use("/api/suggestions", suggestionRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/plans", planRoutes);

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
