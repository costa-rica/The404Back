const Machine = require("../models/machine");
const os = require("os");
const { getLocalIpAddress } = require("./common");

async function updateMachine() {
  console.log("in update Machine");
  const machineName = os.hostname();
  console.log(`my machine naem is: ${machineName}`);
  const localIpAddress = getLocalIpAddress();
  const existingMachien = await Machine.find({ machineName });
  Machine.find({ machineName }).then((data) => {
    console.log("found sometihng in Machine");
    console.log(data);
  });
  console.log("what machien is htis: ");
  console.log(existingMachien[0].machineName);
  const machineObj = {
    machineName,
    localIpAddress: localIpAddress,
    userHomeDir: process.env.STORE_CREATED_NGINX_FILE_HOME,
    nginxDir: process.env.STORE_CREATED_NGINX_FILE_NGINX_DIR,
    dateLastModified: new Date(),
  };
  await Machine.updateOne(
    { machineName },
    { $set: machineObj },
    { upsert: true } // Create a new document if no match is found
  );

  // await Pm2ManagedApp.updateOne(
  //   { port, localIpOfMachine, projectWorkingDirectory },
  //   { $set: elem }, // Update fields
  //   { upsert: true } // Create a new document if no match is found
  // );
}

module.exports = {
  updateMachine,
};
