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

  console.log(
    `STORE_CREATED_NGINX_FILE_HOME: ${process.env.STORE_CREATED_NGINX_FILE_HOME}`
  );
  console.log(
    `STORE_CREATED_NGINX_FILE_NGINX_DIR: ${process.env.STORE_CREATED_NGINX_FILE_NGINX_DIR}`
  );

  // Find the element where filename contains ".the404."
  const targetElement = confdFileList.find((item) =>
    item.filename.includes(".the404api.")
  );
  // Get the value of the 'urls' property
  let urlFor404Api = targetElement ? targetElement.urls[0] : null;
  console.log(`process.env.NODE_ENV: ${process.env.NODE_ENV}`);
  // check NODE_ENV
  urlFor404Api =
    process.env.NODE_ENV == "production"
      ? "https://" + urlFor404Api
      : "http://" + urlFor404Api;

  const response = {
    machineName: machineName,
    urlFor404Api: urlFor404Api,
    userHomeDir:
      process.env.STORE_CREATED_NGINX_FILE_HOME ||
      "STORE_CREATED_NGINX_FILE_HOME Env var not found",
    nginxDir:
      process.env.STORE_CREATED_NGINX_FILE_NGINX_DIR ||
      "STORE_CREATED_NGINX_FILE_NGINX_DIR Env var not found",
  };
  console.log("response: ", response);
  console.log(response.machineName);
  console.log(response.urlFor404Api);
  return res.json(response);
});

module.exports = router;
