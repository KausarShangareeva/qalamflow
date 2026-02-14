const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  getOverallForecast,
  getBookForecast,
  getWhatIf,
  setPaceOverride,
  deletePaceOverride,
} = require("../controllers/forecastController");

router.use(auth);

router.get("/", getOverallForecast);
router.get("/:bookId", getBookForecast);
router.post("/:bookId/whatif", getWhatIf);
router.put("/:bookId/pace-override", setPaceOverride);
router.delete("/:bookId/pace-override", deletePaceOverride);

module.exports = router;
