var express = require("express");
var router = express.Router();
const os = require("os");
const { getLocalIpAddress } = require("../modules/common");
const Machine = require("../models/machine");

/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/machineName", async (req, res) => {
  const machineName = os.hostname();
  console.log(`machineNaem: ${machineName}`);
  const thisMachine = await Machine.findOne({ machineName: machineName });
  if (!thisMachine) {
    return res
      .status(404)
      .json({ result: false, message: "Machine not found" });
  }
  const response = {
    machineName: thisMachine.machineName,
    urlFor404Api: thisMachine.urlFor404Api,
  };
  console.log("response: ", response);
  console.log(response.machineName);
  console.log(response.urlFor404Api);
  return res.json(response);
});

module.exports = router;
