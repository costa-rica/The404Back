const os = require("os");
const Machine = require("../models/machine");

function checkBody(body, keys) {
  let isValid = true;

  for (const field of keys) {
    if (!body[field] || body[field] === "") {
      isValid = false;
    }
  }

  return isValid;
}

function checkBodyReturnMissing(body, keys) {
  let isValid = true;
  let missingKeys = [];

  for (const field of keys) {
    if (!body[field] || body[field] === "") {
      isValid = false;
      missingKeys.push(field);
    }
  }

  return { isValid, missingKeys };
}

// Function to get the local IP address
function getLocalIpAddress() {
  const interfaces = os.networkInterfaces();
  for (const iface in interfaces) {
    for (const alias of interfaces[iface]) {
      if (alias.family === "IPv4" && !alias.internal) {
        return alias.address; // Return the first non-internal IPv4 address
      }
    }
  }
  return "127.0.0.1"; // Default to localhost if no address is found
}

function sortByMachineName(list, desiredMachineName) {
  return list.sort((a, b) => {
    // If `a` has the desired machineName, it goes before `b`
    if (
      a.machineName === desiredMachineName &&
      b.machineName !== desiredMachineName
    ) {
      return -1;
    }
    // If `b` has the desired machineName, it goes before `a`
    if (
      b.machineName === desiredMachineName &&
      a.machineName !== desiredMachineName
    ) {
      return 1;
    }
    // If neither or both have the desired machineName, maintain original order
    return 0;
  });
}

async function updateMachine() {
  console.log("in update Machine");
  const machineName = os.hostname();
  console.log(`my machine naem is: ${machineName}`);
  const localIpAddress = getLocalIpAddress();
  const existingMachien = await Machine.find({ machineName });
  Machine.find({ machineName }).then((data) => {
    console.log("found sometihng in Machine");
    console.log(data);
    console.log(data.machineName);
  });
  console.log("what machien is htis: ");
  console.log(existingMachien[0].machineName);
  const machineObj = {
    machineName,
    urlFor404Api: localIpAddress,
    userHomeDir: process.env.STORE_CREATED_NGINX_FILE_HOME,
    nginxDir: process.env.STORE_CREATED_NGINX_FILE_NGINX_DIR,
    dateLastModified: new Date(),
  };
  await Machine.updateOne(
    { machineName, localIpAddress },
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
  checkBody,
  checkBodyReturnMissing,
  getLocalIpAddress,
  sortByMachineName,
  updateMachine,
};
