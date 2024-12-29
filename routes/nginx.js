var express = require("express");
var router = express.Router();
const path = require("path");
const fs = require("fs").promises;
const { createNginxConfdFilesList } = require("../modules/nginxConfd");
const {
  createNginxSitesAvailableFilesList,
} = require("../modules/nginxSitesAvailable");
const {
  authenticateToken,
  checkPermission,
} = require("../modules/userAuthentication");
const { checkBodyReturnMissing } = require("../modules/common");

router.get("/combined", authenticateToken, async (req, res) => {
  console.log("- in GET /nginx/combined");
  const confd = await createNginxConfdFilesList(process.env.NGINX_CONF_D_PATH);
  const sitesAvailable = await createNginxSitesAvailableFilesList(
    process.env.NGINX_SITES_AVAILABLE_PATH
  );

  return res.json({ confd, sitesAvailable });
});

// Route to read and return the syslog file
router.get("/confd", authenticateToken, async (req, res) => {
  console.log("- in GET /nginx");
  const files = await createNginxConfdFilesList(process.env.NGINX_CONF_D_PATH);

  console.log(files);
  return res.json({ result: true, files });
});

// Route to delete a file
router.delete(
  "/confd",
  authenticateToken,
  checkPermission,
  async (req, res) => {
    console.log("- in DELETE /nginx/confd");
    const checkBodyObj = checkBodyReturnMissing(req.body, ["fileName"]);
    if (!checkBodyObj.isValid) {
      return res.status(401).json({
        result: false,
        error: `Missing or empty fields: ${checkBodyObj.missingKeys}`,
      });
    }
    const { fileName } = req.body; // Extract the file name from the request body

    if (!fileName) {
      return res
        .status(400)
        .json({ result: false, message: "File name is required" });
    }

    try {
      // Construct the full path to the file
      const filePath = path.join(process.env.NGINX_CONF_D_PATH, fileName);
      console.log(`Attempting to delete file: ${filePath}`);

      // Check if the file exists
      await fs.access(filePath);

      // Delete the file
      await fs.unlink(filePath);
      console.log(`File deleted: ${filePath}`);

      return res.json({ result: true, message: "File deleted successfully" });
    } catch (err) {
      if (err.code === "ENOENT") {
        // File does not exist
        return res
          .status(404)
          .json({ result: false, message: "File not found" });
      }
      console.error(err);
      return res
        .status(500)
        .json({ result: false, message: "Error deleting file" });
    }
  }
);

router.get("/sites-available", authenticateToken, async (req, res) => {
  console.log("- in GET /sites-available");
  const files = await createNginxSitesAvailableFilesList(
    process.env.NGINX_SITES_AVAILABLE_PATH
  );
  console.log(files);
  return res.json({ result: true, files });
});

// Route to delete a file and its symlink
router.delete(
  "/sites-available",
  authenticateToken,
  checkPermission,
  async (req, res) => {
    console.log("- in DELETE /nginx/sites-available");

    // Check if the request body contains the required "fileName"
    const checkBodyObj = checkBodyReturnMissing(req.body, ["fileName"]);
    if (!checkBodyObj.isValid) {
      return res.status(401).json({
        result: false,
        error: `Missing or empty fields: ${checkBodyObj.missingKeys}`,
      });
    }

    const { fileName } = req.body;

    if (!fileName) {
      return res
        .status(400)
        .json({ result: false, message: "File name is required" });
    }

    try {
      // Paths for the file and its symlink
      const sitesAvailablePath = path.join(
        process.env.NGINX_SITES_AVAILABLE_PATH,
        fileName
      );
      const sitesEnabledPath = path.join(
        process.env.NGINX_SITES_ENABLED_PATH,
        fileName
      );

      console.log(`Attempting to delete symlink: ${sitesEnabledPath}`);
      try {
        // Check if the symlink exists and delete it
        await fs.access(sitesEnabledPath);
        await fs.unlink(sitesEnabledPath);
        console.log(`Symlink deleted: ${sitesEnabledPath}`);
      } catch (err) {
        if (err.code === "ENOENT") {
          console.log(`Symlink not found: ${sitesEnabledPath}`);
        } else {
          throw err; // Rethrow other errors
        }
      }

      console.log(`Attempting to delete file: ${sitesAvailablePath}`);
      // Check if the file exists and delete it
      await fs.access(sitesAvailablePath);
      await fs.unlink(sitesAvailablePath);
      console.log(`File deleted: ${sitesAvailablePath}`);

      return res.json({
        result: true,
        message: "File and symlink deleted successfully",
      });
    } catch (err) {
      if (err.code === "ENOENT") {
        // File or symlink does not exist
        return res
          .status(404)
          .json({ result: false, message: "File or symlink not found" });
      }
      console.error(err);
      return res
        .status(500)
        .json({ result: false, message: "Error deleting file or symlink" });
    }
  }
);

module.exports = router;
