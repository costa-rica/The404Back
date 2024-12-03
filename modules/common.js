const os = require("os");

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

module.exports = {
  getLocalIpAddress,
};
