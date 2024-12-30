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
    return res.status(401).json(createFileObj);
  }
  return res.json(createFileObj);
});

// router.get("/", authenticateToken, (req, res) => {
//   try {
//     // Retrieve environmental variables
//     const envVars = {
//       NGINX_CONF_D_PATH: process.env.NGINX_CONF_D_PATH,
//       NGINX_SITES_AVAILABLE_PATH: process.env.NGINX_SITES_AVAILABLE_PATH,
//       STORE_CREATED_NGINX_FILE_HOME: process.env.STORE_CREATED_NGINX_FILE_HOME,
//     };

//     // Filter out invalid or missing paths
//     // const validPaths = Object.values(envVars).filter(isValidPath);

//     const validPaths = Object.values(envVars).filter((elem) => {
//       return typeof elem === "string" && elem.trim().length > 0;
//     });

//     // Send the array of valid paths as the response
//     res.status(200).json({ result: true, paths: validPaths });
//   } catch (error) {
//     console.error("Error fetching env paths:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

module.exports = router;
