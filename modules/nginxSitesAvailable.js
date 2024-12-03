const fs = require("fs").promises;
const path = require("path");
const os = require("os");
const { getLocalIpAddress } = require("./common");
const NginxSitesAvailableFile = require("../models/nginxSitesAvailableFile");

async function extractNginxSitesAvailableFileDetails(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    let serverNames = [];
    let port = null;
    let localIpOfApp = null;

    const lines = fileContent.split("\n");
    for (const line of lines) {
      const trimmedLine = line.trim();

      // Extract server_name
      if (trimmedLine.startsWith("server_name")) {
        const match = trimmedLine.match(/server_name\s+([^;]+);/);
        if (match) {
          serverNames = match[1].split(" ").map((name) => name.trim());
        }
      }

      // Extract proxy_pass port
      if (trimmedLine.startsWith("proxy_pass")) {
        const match = trimmedLine.match(
          /proxy_pass\s+http:\/\/(\d{1,3}(?:\.\d{1,3}){3}):(\d+);/
        );
        if (match) {
          localIpOfApp = match[1];
          port = Number(match[2]);
        }
      }
    }
    return { urls: serverNames, localIpOfApp, port };
  } catch (error) {
    throw new Error(
      `Failed to extract details from file ${filePath}: ${error.message}`
    );
  }
}

async function createNginxSitesAvailableFilesList(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath);
    const localIpOfMachine = getLocalIpAddress();
    const machineName = os.hostname();
    const fileList = [];
    for (const file of files) {
      const fullPath = path.join(directoryPath, file);
      const stat = await fs.stat(fullPath);

      if (stat.isFile()) {
        console.log("-- isFile()");
        const { urls, localIpOfApp, port } =
          await extractNginxSitesAvailableFileDetails(fullPath);
        fileList.push({
          filename: file,
          urls,
          port,
          localIpOfApp,
          localIpOfMachine,
          machineName,
          dateRecordModified: new Date(),
          dateFileModified: stat.mtime,
        });
      }
    }
    return fileList;
  } catch (error) {
    throw new Error(`Failed to list files: ${error.message}`);
  }
}

async function appendNginxSitesAvailableCollection() {
  const fileListSitesAvailable = await createNginxSitesAvailableFilesList(
    process.env.NGINX_SITES_AVAILABLE_PATH
  );

  fileListSitesAvailable.map(async (elem) => {
    const { filename, port, localIpOfApp, ...rest } = elem;
    await NginxSitesAvailableFile.updateOne(
      { filename, port, localIpOfApp },
      { $set: elem }, // Update fields
      { upsert: true } // Create a new document if no match is found
    );
  });
  return fileListSitesAvailable;
}

module.exports = {
  createNginxSitesAvailableFilesList,
  appendNginxSitesAvailableCollection,
};
