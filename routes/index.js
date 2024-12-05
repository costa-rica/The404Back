var express = require("express");
var router = express.Router();
const os = require("os");
const { getLocalIpAddress } = require("../modules/common");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/machineName", (req, res) => {
  console.log("in GET /machineName");
  const machineName = os.hostname();
  const localIpAddress = getLocalIpAddress();
  res.json({
    machineName,
    urlFor404Api: `http://${localIpAddress}:${process.env.PORT}`,
  });
});

module.exports = router;
