const fs = require("fs");
const path = require("path");

function createConfdFile(createObj) {
  const { framework, nginxDir, port, serverNames } = createObj;

  const serverNameList = serverNames.split(",").map((name) => name.trim());
  const primaryServerName = serverNameList[0]; // Use the first server name for the file name
  const serverNamesString = serverNameList.join(" "); // Join all server names with spaces

  console.log(`nginxDir: ${nginxDir}, framework: ${framework}`);
  const templateFilename = `${framework}${nginxDir}.txt`;
  console.log(`templateFilename: ${templateFilename}`);

  const proj_resources_path = path.join(
    process.env.PROJECT_RESOURCES,
    "createTemplateFiles"
  );

  // Check if the directory exists
  if (!fs.existsSync(proj_resources_path)) {
    return {
      result: false,
      message: "Missing project_resources/createTemplateFiles directory",
    };
  }
  const filePath = path.join(proj_resources_path, templateFilename);
  let templateFileContents;
  let newFileContent;
  let createNginxFilesDir = path.join(
    process.env.PROJECT_RESOURCES,
    "created_nginx_files"
  );

  // Check if the createNginxFilesDir directory exists
  if (!fs.existsSync(createNginxFilesDir)) {
    fs.mkdirSync(createNginxFilesDir, { recursive: true });
    console.log(`Directory created: ${createNginxFilesDir}`);
  }

  const outputFilePath = path.join(
    createNginxFilesDir,
    `${primaryServerName}.conf`
  );

  try {
    // Read the file contents synchronously
    templateFileContents = fs.readFileSync(filePath, "utf8");
    // replace the strings with
    newFileContent = templateFileContents
      .replace("<ReplaceMe: server name>", serverNamesString)
      .replace("<ReplaceMe: port number>", port);

    // Write the new configuration to a file synchronously
    fs.writeFileSync(outputFilePath, newFileContent);
    console.log("Finished writing file ----");
  } catch (error) {
    console.error(`Error during file operation: ${error.message}`);

    return {
      result: false,
      message: "Error processing the file",
      error: error.message,
    };
  }

  return { templateFilename, result: true };
}

module.exports = { createConfdFile };
