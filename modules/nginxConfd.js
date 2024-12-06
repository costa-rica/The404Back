const fs = require("fs").promises;
const path = require("path");
const os = require("os");
const { getLocalIpAddress } = require("./common");
const NginxConfdFile = require("../models/nginxConfdFile");

async function extractNginxConfdFileDetails(filePath) {
  try {
    const fileContent = await fs.readFile(filePath, "utf8");
    let serverNames = [];
    let portNumber = null;

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
        const match = trimmedLine.match(/proxy_pass\s+.*:(\d{4});/);
        if (match) {
          portNumber = Number(match[1]);
        }
      }
    }

    return { urls: serverNames, port: portNumber };
  } catch (error) {
    throw new Error(
      `Failed to extract details from file ${filePath}: ${error.message}`
    );
  }
}

async function createNginxConfdFilesList(directoryPath) {
  try {
    const files = await fs.readdir(directoryPath);
    const localIpOfMachine = getLocalIpAddress();
    const machineName = os.hostname();
    const fileList = [];
    for (const file of files) {
      const fullPath = path.join(directoryPath, file);
      const stat = await fs.stat(fullPath);

      if (stat.isFile()) {
        const { urls, port } = await extractNginxConfdFileDetails(fullPath);
        fileList.push({
          filename: file,
          urls,
          port,
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

async function appendNginxConfdCollection() {
  const fileListConfd = await createNginxConfdFilesList(
    process.env.NGINX_CONF_D_PATH
  );

  const localIpAddress = getLocalIpAddress();
  // Step 2: filter candidates for deletion
  const filteredLocalFileListConfd = await NginxConfdFile.find({
    localIpOfMachine: localIpAddress,
  });

  // Step 3: Collect all app names from fileListConfd for quick lookup
  const filenamesSet = new Set(fileListConfd.map((app) => app.filename));

  // Step 4: Delete ConfD documents that are not in fileListConfd
  const deletionPromises = filteredLocalFileListConfd
    .filter((doc) => !filenamesSet.has(doc.filename)) // Filter out apps not in fileListConfd
    .map((doc) => {
      console.log(`Deleting: ${doc.filename}`);
      return NginxConfdFile.deleteOne({ _id: doc._id }); // Delete by _id for safety
    });

  await Promise.all(deletionPromises);

  // Step 5: update db with confd files from this machine
  fileListConfd.map(async (elem) => {
    const { filename, port, localIpOfMachine, ...rest } = elem;

    await NginxConfdFile.updateOne(
      { filename, port, localIpOfMachine },
      { $set: elem }, // Update fields
      { upsert: true } // Create a new document if no match is found
    );
  });

  return fileListConfd;
}

module.exports = {
  appendNginxConfdCollection,
};
