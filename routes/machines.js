var express = require("express");
var router = express.Router();
const os = require("os");
const Machine = require("../models/machine");
const { checkBody } = require("../modules/common");
const { getNginxStoragePaths } = require("../modules/createNginx");

const {
  authenticateToken,
  checkPermission,
} = require("../modules/userAuthentication");

/* GET home page. */
router.get("/", authenticateToken, async (req, res) => {
  console.log("in GET /machines");

  const existingMachines = await Machine.find();
  console.log(existingMachines);

  // Update each machine's properties if necessary
  const updatedMachines = existingMachines.map((machine) => {
    return machine;
    // return {
    //   ...machine.toObject(), // Convert Mongoose document to plain object
    //   userHomeDir: machine.userHomeDir || "userHomeDir - Env var not found",
    //   nginxDir: machine.nginxDir || "nginxDir - Env var not found",
    // };
  });

  return res.json({ result: true, existingMachines: updatedMachines });
});

router.post("/", authenticateToken, checkPermission, async (req, res) => {
  console.log("in POST /machines");
  console.log("1 ---> checkign for correct body requiremnts");
  if (!checkBody(req.body, ["urlFor404Api"])) {
    return res
      .status(401)
      .json({ result: false, error: "Missing or empty fields" });
  }
  let newMachineUrl = req.body.urlFor404Api;
  const areWeOnMacMiniWorkstation = os.hostname();
  if (areWeOnMacMiniWorkstation === "Nicks-Mac-mini.local") {
    console.log(`---> triggered Nicks-Mac-mini.local`);
    newMachineUrl = "http://localhost8000";
    const newMachine = new Machine({
      machineName: areWeOnMacMiniWorkstation,
      urlFor404Api: newMachineUrl,
      userHomeDir: process.env.STORE_CREATED_NGINX_FILE_HOME,
      // nginxDir: process.env.STORE_CREATED_NGINX_FILE_NGINX_DIR,
      nginxStoragePathOptions: getNginxStoragePaths(),
      dateLastModified: new Date(),
    });
    await newMachine.save();

    return res.json({
      result: true,
      url: newMachineUrl,
      machineName: areWeOnMacMiniWorkstation,
    });
  }

  // Ensure the string starts with "https://"
  if (!newMachineUrl.startsWith("https://")) {
    newMachineUrl = "https://" + newMachineUrl;
  }

  // Ensure the string does not end with a "/"
  if (newMachineUrl.endsWith("/")) {
    newMachineUrl = newMachineUrl.slice(0, -1);
  }

  console.log("2 ---> pinging machine the404api url to verify");
  let machineName;
  let localIpAddress;

  try {
    const response = await fetch(`${newMachineUrl}/machineName`);
    console.log("3 ---> received response");
    console.log(response.status);
    if (response.status !== 200) {
      return res
        .status(401)
        .json({ result: false, error: "Machine doesn't exist" });
    }
    // Parse the response as JSON
    const responseData = await response.json();
    machineName = responseData.machineName;
    console.log("First Machine name: ");
    console.log(machineName);
  } catch (error) {
    // Handle fetch or other errors
    console.log("failed to get machien name response");
    return res
      .status(500)
      .json({ error: "Internal Server Error", details: error.message });
  }

  // Use the macineName and local IP address to search the

  const newOrUpdateMachine = await Machine.findOneAndUpdate(
    { machineName, localIpAddress },
    {
      urlFor404Api: responseData.urlFor404Api,
      nginxStoragePathOptions: responseData.nginxStoragePathOptions,
      userHomeDir: responseData.userHomeDir,
      dateLastModified: new Date(),
    },
    {
      new: true, // Return the updated document
      upsert: true, // Create the document if it doesn't exist
    }
  );
  console.log("4 ---> created new machine document / or updated an existing ");

  console.log(
    `---> we have a new machine: ${machineName} localIpAddress:${localIpAddress} `
  );
  for (prop in newOrUpdateMachine) {
    console.log(`${prop}: ${newOrUpdateMachine[prop]}`);
  }
  console.log(`--- end of new props----`);
  // // ---- OLD -----

  // const existingMachine = await Machine.find({ urlFor404Api: newMachineUrl });
  // console.log("----> did we get the machienName yet?? ");
  // console.log(machineName);
  // if (existingMachine.length === 0) {
  //   const newMachine = new Machine({
  //     machineName,
  //     urlFor404Api: newMachineUrl,
  //     userHomeDir: process.env.STORE_CREATED_NGINX_FILE_HOME,
  //     // nginxDir: process.env.STORE_CREATED_NGINX_FILE_NGINX_DIR,
  //     nginxStoragePathOptions: getNginxStoragePaths(),
  //     dateLastModified: new Date(),
  //   });
  //   await newMachine.save();
  //   console.log("created a new machine entry");
  // } else {
  //   console.log("Machien already existssssss ---");

  //   /// ------ MODIFY HERE ------
  //   const updateMachine = await Machine.findOneAndUpdate(
  //     { machineName }, // Query filter
  //     { urlFor404Api: newMachineUrl }, // Update
  //     { new: true } // Options: return the updated document
  //   );

  //   return res.json({
  //     result: false,
  //     message: "machine already exists",
  //     url: newMachineUrl,
  //     machineName,
  //   });
  // }

  // return res.json({ result: true, url: newMachineUrl, machineName });
  return res.json({ result: true, newOrUpdateMachine });
});

router.delete("/", authenticateToken, checkPermission, async (req, res) => {
  console.log("in DELETE /machines");
  const bodyFields = ["urlFor404Api", "machineName"];
  if (!checkBody(req.body, bodyFields)) {
    return res
      .status(401)
      .json({ result: false, error: "Missing or empty fields" });
  }
  const urlFor404Api = req.body.urlFor404Api;
  const machineName = req.body.machineName;
  console.log("req.body::: ", urlFor404Api, machineName);
  console.log("--- step 1 about to delete");
  await Machine.deleteMany({ machineName, urlFor404Api }).then(() =>
    console.log("*finished delteing")
  );
  const existingMachines = await Machine.find({ machineName, urlFor404Api });
  console.log("finished searching for deleted machine.");
  if (existingMachines.length === 0) {
    return res.json({ result: true, message: "deleted successfully" });
  } else {
    console.log(existingMachines);
    return res.json({ result: false, message: "deleted unsuccessfully" });
  }
});

module.exports = router;
