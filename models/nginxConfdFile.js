const mongoose = require("mongoose");

const nginxConfdFileSchema = mongoose.Schema({
  filename: String,
  urls: [String],
  port: Number,
  localIpOfMachine: String,
  machineName: String,
  dateFileModified: Date,
  dateRecordModified: Date,
  dateRecordCreated: { type: Date, default: Date.now },
});

const NginxConfdFile = mongoose.model("nginxConfdFiles", nginxConfdFileSchema);
module.exports = NginxConfdFile;
