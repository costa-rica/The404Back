var express = require("express");
var router = express.Router();
const { appendNginxConfdCollection } = require("../modules/nginxConfd");
const {
  appendNginxSitesAvailableCollection,
} = require("../modules/nginxSitesAvailable");
const { appendPm2Collection, togglePm2App } = require("../modules/pm2");
const { authenticateToken } = require("../modules/userAuthentication");

//Models
const Pm2ManagedApp = require("../models/pm2ManagedApp");
const NginxConfdFile = require("../models/nginxConfdFile");
const pm2 = require("pm2");

router.get("/confd", authenticateToken, async (req, res) => {
  const fileList = await appendNginxConfdCollection();
  return res.json({ fileList });
});

router.get("/sites-available", authenticateToken, async (req, res) => {
  const fileList = await appendNginxSitesAvailableCollection();

  res.json({ result: true, fileList });
});

router.get("/pm2", authenticateToken, async (req, res) => {
  console.log("- in GET /pm2");
  const appList = await appendPm2Collection();

  return res.json({ result: true, appList });
});

router.get("/list/:outer", authenticateToken, async (req, res) => {
  console.log("in GET /list/:outer");

  let outerList = [];
  let innerCollection = Pm2ManagedApp;

  if (req.params.outer === "pm2") {
    outerList = await Pm2ManagedApp.find();
    innerCollection = NginxConfdFile;
  } else {
    outerList = await NginxConfdFile.find();
  }

  let appList = [];
  for (const elem of outerList) {
    const innerList = await innerCollection.find({
      port: elem.port,
      localIpOfMachine: elem.localIpOfMachine,
    });

    let counter = 0;
    let innerListObjects = [];
    for (const elemNginx of innerList) {
      // appObj = { ...appObj, [`${counter}`]: elemNginx };
      innerListObjects.push(elemNginx);
      counter++;
    }
    const appObj = { ...elem._doc, innerListObjects };
    appList.push(appObj);
  }
  return res.json({ appList });
});

router.post("/toggle-app", authenticateToken, async (req, res) => {
  console.log(`- in POST /toggle-app`);
  const { appName } = req.body;
  console.log(`appName: ${appName}`);

  try {
    const status = await togglePm2App(appName);
    res
      .status(200)
      .json({ status, message: `App "${appName}" is now ${status}` });
  } catch (error) {
    console.error("Route error:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

// OBE - Delete
router.get("/list-pm2-apps", authenticateToken, async (req, res) => {
  console.log("in GET /list-pm2-apps");

  appList = await Pm2ManagedApp.find();

  let newAppList = [];
  //   await appList.map(async (elem, index) => {
  for (const elem of appList) {
    let appObj = { ...elem._doc };

    const nginxFileList = await NginxConfdFile.find({
      port: elem.port,
      localIpOfMachine: elem.localIpOfMachine,
    });

    let counter = 0;
    for (const elemNginx of nginxFileList) {
      appObj = { ...appObj, [`${counter}`]: elemNginx };
      counter++;
    }

    newAppList.push(appObj);
  }
  return res.json({ newAppList });
});

module.exports = router;
