const pm2 = require("pm2");
const os = require("os");
const Pm2ManagedApp = require("../models/pm2ManagedApp");
const { getLocalIpAddress } = require("./common");

async function createPm2AppList() {
  console.log("- in createPm2AppList");
  const localIpAddress = getLocalIpAddress();
  const machineName = os.hostname();
  // Wrap pm2.connect in a Promise
  await new Promise((resolve, reject) => {
    pm2.connect((err) => {
      if (err) {
        console.error("-----> Error caught during pm2.connect");
        return reject(new Error("Failed to connect to PM2"));
      }
      console.log("---> pm2.connect() no error 👍");
      resolve();
    });
  });

  // Wrap pm2.list in a Promise
  const appList = await new Promise((resolve, reject) => {
    pm2.list((err, list) => {
      pm2.disconnect(); // Disconnect PM2
      if (err) {
        console.error("-----> Error caught during pm2.list");
        return reject(new Error("Failed to retrieve app list"));
      }
      console.log("---> pm2.list() no error 👍");

      // Transform the app list into the desired format
      const appList = list.map((app) => ({
        pm2Id: app.pm_id,
        nameOfApp: app.name,
        projectWorkingDirectory: app.pm2_env.pm_cwd ?? "no cwd",
        port: app.pm2_env?.PORT,
        localIpOfMachine: localIpAddress,
        machineName: machineName,
        status: app.pm2_env.status,
        nodeEnv: app.pm2_env?.NODE_ENV,
        lastUpdatedRecord: new Date(),
      }));

      resolve(appList);
    });
  });

  return appList;
}

async function appendPm2Collection() {
  console.log(" in append pm2 stuff");

  const appList = await createPm2AppList();

  // filter all Pm2ManagedApp with the local IP address
  console.log(appList);
  const localIpAddress = getLocalIpAddress();

  // Step 2: filter candidates for deletion
  const filteredLocalPm2ManagedApp = await Pm2ManagedApp.find({
    localIpOfMachine: localIpAddress,
  });

  // Step 3: Collect all app names from appList for quick lookup
  const appNamesSet = new Set(appList.map((app) => app.nameOfApp));

  // Step 4: Delete Pm2ManagedApp documents that are not in appList
  const deletionPromises = filteredLocalPm2ManagedApp
    .filter((doc) => !appNamesSet.has(doc.nameOfApp)) // Filter out apps not in appList
    .map((doc) => {
      console.log(`Deleting: ${doc.nameOfApp}`);
      return Pm2ManagedApp.deleteOne({ _id: doc._id }); // Delete by _id for safety
    });

  await Promise.all(deletionPromises);

  appList.map(async (elem) => {
    const { port, localIpOfMachine, projectWorkingDirectory, ...rest } = elem;
    await Pm2ManagedApp.updateOne(
      { port, localIpOfMachine, projectWorkingDirectory },
      { $set: elem }, // Update fields
      { upsert: true } // Create a new document if no match is found
    );
  });
  return appList;
}

async function togglePm2App(appName) {
  let status = "error";

  try {
    // Connect to PM2
    await new Promise((resolve, reject) => {
      pm2.connect((err) => {
        if (err) {
          return reject(new Error("Failed to connect to PM2"));
        }
        console.log("---> pm2.connect() no error 👍");
        resolve();
      });
    });

    // Describe and toggle app
    status = await new Promise((resolve, reject) => {
      pm2.describe(appName, (err, processDescription) => {
        if (err || !processDescription || processDescription.length === 0) {
          return reject(new Error(`App "${appName}" not found in PM2`));
        }

        const appStatus = processDescription[0].pm2_env.status;
        console.log(`App "${appName}" current status: ${appStatus}`);

        // If it is part of the The404 suite, just restart, no deactivate.
        if (appName.includes("The404")) {
          pm2.restart(appName, (err) => {
            if (err) {
              return reject(new Error(`Failed to restart app "${appName}"`));
            }
            console.log(`App "${appName}" restarted successfully.`);
            pm2.disconnect(); // Cleanup
            resolve("restarted");
          });
        } else if (appStatus === "online") {
          pm2.stop(appName, (err) => {
            if (err) {
              return reject(new Error(`Failed to stop app "${appName}"`));
            }
            console.log(`App "${appName}" stopped successfully.`);
            pm2.disconnect(); // Cleanup
            resolve("inactive");
          });
        } else {
          pm2.start(appName, (err) => {
            if (err) {
              return reject(new Error(`Failed to start app "${appName}"`));
            }
            console.log(`App "${appName}" started successfully.`);
            pm2.disconnect(); // Cleanup
            resolve("active");
          });
        }
      });
    });

    console.log(`togglePm2App finished successfully with status: ${status}`);
    return status;
  } catch (error) {
    console.error("Error in /modules/pm2.js > togglePm2App():", error);
    pm2.disconnect(); // Cleanup in case of error
    throw error; // Propagate error to the route
  }
}

module.exports = { appendPm2Collection, togglePm2App };
