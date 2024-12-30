const Machine = require("../models/machine");
const os = require("os");
const { getLocalIpAddress } = require("./common");
const { getNginxStoragePaths } = require("./createNginx");

async function updateMachine() {
  console.log("in update Machine");
  const machineName = os.hostname();
  const localIpAddress = getLocalIpAddress();
  const machineObj = {
    machineName,
    localIpAddress: localIpAddress,
    userHomeDir: process.env.USER_HOME_DIR,
    nginxStoragePathOptions: getNginxStoragePaths(),
    // nginxDir: process.env.STORE_CREATED_NGINX_FILE_NGINX_DIR,
    dateLastModified: new Date(),
  };
  await Machine.updateOne(
    { machineName, localIpAddress },
    { $set: machineObj },
    { upsert: true } // Create a new document if no match is found
  );
}

module.exports = {
  updateMachine,
};
