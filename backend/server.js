require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const bookRoutes = require("./routes/books");
const scheduleRoutes = require("./routes/schedules");
const progressRoutes = require("./routes/progress");
const forecastRoutes = require("./routes/forecast");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ message: "QalamFlow API running" });
});
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/forecast", forecastRoutes);

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
