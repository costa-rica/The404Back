var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/common");
const { createServerFile } = require("../modules/createNginx");
const { authenticateToken } = require("../modules/userAuthentication");

router.post("/server-file", authenticateToken, (req, res) => {
  console.log("in POST /create-server-file");
  if (!checkBody(req.body, ["framework", "serverNames", "port"])) {
    return res
      .status(401)
      .json({ result: false, error: "Missing or empty fields" });
  }
  const createFileObj = createServerFile(req.body);

  if (!createFileObj.result) {
    return res.status(500).json(createFileObj);
  }
  return res.json(createFileObj);
});

module.exports = router;
