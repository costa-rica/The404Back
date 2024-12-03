var express = require("express");
var router = express.Router();
const { appendNginxConfdCollection } = require("../modules/nginxConfd");
const {
  appendNginxSitesAvailableCollection,
} = require("../modules/nginxSitesAvailable");
const { appendPm2Collection } = require("../modules/pm2");

//Models
const Pm2ManagedApp = require("../models/pm2ManagedApp");
const NginxConfdFile = require("../models/nginxConfdFile");

router.get("/confd", async (req, res) => {
  const fileList = await appendNginxConfdCollection();
  return res.json({ fileList });
});

router.get("/sites-available", async (req, res) => {
  const fileList = await appendNginxSitesAvailableCollection();

  res.json({ result: true, fileList });
});

router.get("/pm2", async (req, res) => {
  console.log("- in GET /pm2");
  const appList = await appendPm2Collection();

  return res.json({ result: true, appList });
});

router.get("/list-pm2-apps", async (req, res) => {
  console.log("in GET /list-pm2-apps");

  appList = await Pm2ManagedApp.find();

  let newAppList = [];
  //   await appList.map(async (elem, index) => {
  for (const elem of appList) {
    let appObj = { ...elem._doc };

    console.log("---- appObj ---");
    console.log(appObj);
    const nginxFileList = await NginxConfdFile.find({
      port: elem.port,
      localIpOfMachine: elem.localIpOfMachine,
    });

    let counter = 0;
    for (const elemNginx of nginxFileList) {
      console.log("---- > found a match");
      console.log("--- elemNginx ---");
      console.log(elemNginx);

      const key = `${counter}`;
      appObj = { ...appObj, [key]: elemNginx };
      counter++;
    }

    // await nginxFileList.map((elemNginx, indexNginx) => {
    //   console.log("---- > found a match");
    //   const key = `${indexNginx}`;
    //   console.log("--- elemNginx ---");
    //   console.log(elemNginx);
    //   appObj = { ...appObj, key: elemNginx };
    // });
    newAppList.push(appObj);
  }
  console.log("*** returning ***");
  return res.json({ newAppList });
});

module.exports = router;
