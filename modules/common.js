const os = require("os");

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

module.exports = {
  checkBody,
  checkBodyReturnMissing,
  getLocalIpAddress,
  sortByMachineName,
};
