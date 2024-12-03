var express = require("express");
var router = express.Router();
const os = require("os");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/machineName", (req, res) => {
  console.log("in GET /machine");
  const machineName = os.hostname();
  res.json({ machineName });
});

module.exports = router;
