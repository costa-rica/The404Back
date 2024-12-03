const mongoose = require("mongoose");

const pm2ManagedAppSchema = mongoose.Schema({
  pm2Id: Number,
  nameOfApp: String,
  projectWorkingDirectory: String,
  port: Number,
  localIpOfMachine: String,
  machineName: String,
  status: String,
  nodeEnv: String,
  lastUpdatedRecord: Date,
  createdDateRecord: { type: Date, default: Date.now },
});

const Pm2ManagedApp = mongoose.model("pm2ManagedApps", pm2ManagedAppSchema);
module.exports = Pm2ManagedApp;
