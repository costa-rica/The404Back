var express = require("express");
var router = express.Router();
const { appendNginxConfdCollection } = require("../modules/nginxConfd");
const {
  appendNginxSitesAvailableCollection,
} = require("../modules/nginxSitesAvailable");
const { appendPm2Collection } = require("../modules/pm2");
const { authenticateToken } = require("../modules/userAuthentication");

//Models
const Pm2ManagedApp = require("../models/pm2ManagedApp");
const NginxConfdFile = require("../models/nginxConfdFile");
const mongoose = require("mongoose");

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
