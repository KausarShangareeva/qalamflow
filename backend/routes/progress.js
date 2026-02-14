const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getProgress,
  getProgressByBook,
  createProgress,
  updateProgress,
  deleteProgress,
} = require("../controllers/progressController");

router.use(auth);

router.get("/", getProgress);
router.get("/:bookId", getProgressByBook);
router.post("/", createProgress);
router.put("/:id", updateProgress);
router.delete("/:id", deleteProgress);

module.exports = router;
