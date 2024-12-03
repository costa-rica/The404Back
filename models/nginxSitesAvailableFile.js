const mongoose = require("mongoose");

const nginxSitesAvailableFileSchema = mongoose.Schema({
  filename: String,
  urls: [String],
  port: Number,
  localIpOfApp: String,
  localIpOfMachine: String,
  machineName: String,
  nginxSitesEnabled: String,
  dateFileModified: Date,
  dateRecordModified: Date,
  dateRecordCreated: { type: Date, default: Date.now },
});

const NginxSitesAvailableFile = mongoose.model(
  "nginxSitesAvailableFiles",
  nginxSitesAvailableFileSchema
);
module.exports = NginxSitesAvailableFile;
