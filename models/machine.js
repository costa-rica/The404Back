const mongoose = require("mongoose");

const machineSchema = mongoose.Schema({
  machineName: String,
  urlFor404Api: String,
  localIpAddress: String,
  userHomeDir: String,
  // nginxDir: String,
  nginxStoragePathOptions: [String],
  dateLastModified: Date,
  dateCreated: { type: Date, default: Date.now },
});

const Machine = mongoose.model("machines", machineSchema);
module.exports = Machine;
