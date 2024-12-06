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

module.exports = { appendPm2Collection };
