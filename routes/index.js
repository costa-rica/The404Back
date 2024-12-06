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
  const thisMachine = await Machine.find({ machineName: machineName });
  console.log("did we get this machine: ");
  console.log(thisMachine);
  const response = {
    machineName: thisMachine.machineName,
    urlFor404Api: thisMachine.urlFor404Api,
  };
  console.log("response: ", response);
  console.log(response);
  return res.json(response);
});

module.exports = router;
