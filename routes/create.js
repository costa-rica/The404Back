var express = require("express");
var router = express.Router();
const { checkBody, checkBodyReturnMissing } = require("../modules/common");
const { createServerFile } = require("../modules/createNginx");
const {
  authenticateToken,
  checkPermission,
} = require("../modules/userAuthentication");

router.post("/server-file", authenticateToken, checkPermission, (req, res) => {
  console.log("in POST /create-server-file");
  const checkBodyObj = checkBodyReturnMissing(req.body, [
    "framework",
    "nginxDir",
    "serverNames",
    "port",
  ]);
  if (!checkBodyObj.isValid) {
    return res.status(401).json({
      result: false,
      error: `Missing or empty fields: ${checkBodyObj.missingKeys}`,
    });
  }
  const createFileObj = createServerFile(req.body);

  if (!createFileObj.result) {
    console.error("---> problem in the /modules/createNginx.js file");
    return res.status(401).json(createFileObj);
  }
  return res.json(createFileObj);
});

module.exports = router;
