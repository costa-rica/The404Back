var express = require("express");
var router = express.Router();
const os = require("os");
const { getLocalIpAddress } = require("../modules/common");
const Machine = require("../models/machine");
const { createNginxConfdFilesList } = require("../modules/nginxConfd");
/* GET home page. */
router.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

router.get("/machineName", async (req, res) => {
  const machineName = os.hostname();
  console.log(`machineNaem: ${machineName}`);
  confdFileList = await createNginxConfdFilesList(
    process.env.NGINX_CONF_D_PATH
  );

  // Find the element where filename contains ".the404."
  const targetElement = confdFileList.find((item) =>
    item.filename.includes(".the404.")
  );
  // Get the value of the 'urls' property
  const urlFor404Api = targetElement ? targetElement.urls[0] : null;
  // const thisMachine = await Machine.findOne({ machineName: machineName });
  // if (!thisMachine) {
  //   return res
  //     .status(404)
  //     .json({ result: false, message: "Machine not found" });
  // }
  const response = {
    machineName: machineName,
    urlFor404Api: urlFor404Api,
  };
  console.log("response: ", response);
  console.log(response.machineName);
  console.log(response.urlFor404Api);
  return res.json(response);
});

module.exports = router;
