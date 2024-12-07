var express = require("express");
var router = express.Router();
const { checkBody } = require("../modules/common");
const { createConfdFile } = require("../modules/createNginx");

router.post("/server-file", (req, res) => {
  console.log("in POST /create-server-file");

  const { nginxDir, framework, port, serverNames } = req.body;

  const createFileObj = createConfdFile(req.body);

  if (!createFileObj.result) {
    return res.status(500).json(createFileObj);
  }
  return res.json(createFileObj);
});

module.exports = router;
