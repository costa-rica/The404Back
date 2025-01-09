var express = require("express");
var router = express.Router();
const fs = require("fs");

const { authenticateToken } = require("../modules/userAuthentication");

// Route to read and return the syslog file
// router.get("/combined", authenticateToken, async (req, res) => {
router.get("/combined", authenticateToken, async (req, res) => {
  // console.log("- in GET /logs/combined");
  const syslogPath = process.env.FILE_PATH_SYSLOG;
  const pm2CombinedOutput = process.env.FILE_PATH_PM2_OUTPUT;
  const pm2CombinedError = process.env.FILE_PATH_PM2_ERROR;

  const responseBody = {};
  try {
    const dataSyslog = await fs.promises.readFile(syslogPath, "utf8");
    responseBody["syslog"] = dataSyslog;
    // console.log("----> read syslog and added");
  } catch (error) {
    console.error("Error reading syslog:", error);
    responseBody["syslog"] = false;
  }
  try {
    const dataPm2CombinedOutput = await fs.promises.readFile(
      pm2CombinedOutput,
      "utf8"
    );
    responseBody["pm2CombinedOutput"] = dataPm2CombinedOutput;
    // console.log("----> read pm2CombinedOutput and added");
  } catch (error) {
    responseBody["pm2CombinedOutput"] = false;
    console.error("Error reading pm2CombinedOutput:", error);
  }
  try {
    const dataPm2CombinedError = await fs.promises.readFile(
      pm2CombinedError,
      "utf8"
    );
    responseBody["pm2CombinedError"] = dataPm2CombinedError;
    // console.log("----> read dataPm2CombinedError and added");
  } catch (error) {
    responseBody["dataPm2CombinedError"] = false;
    console.error("Error reading pm2CombinedError:", error);
  }
  return res.json({ responseBody });
});

module.exports = router;
