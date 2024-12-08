const fs = require("fs");
const path = require("path");

function createServerFile(createObj) {
  const templateFilename = `${createObj.framework}${createObj.nginxDir}.txt`;
  console.log(`templateFilename: ${templateFilename}`);
  console.log(`createObj.serverNames: ${createObj.serverNames}`);
  console.log(
    `createObj.serverNames.includes(","): ${createObj.serverNames.includes(
      ","
    )}`
  );
  let serverNameList, primaryServerName, serverNamesString;
  if (createObj.serverNames.includes(",")) {
    console.log("FOUND  a Comma");
    serverNameList = createObj.serverNames
      .split(",")
      .map((name) => name.trim());
    primaryServerName = serverNameList[0]; // Use the first server name for the file name
    serverNamesString = serverNameList.join(" "); // Join all server names with spaces
  } else {
    console.log("did NOT find  a comma");
    serverNameList =
      primaryServerName =
      serverNamesString =
        createObj.serverNames;
  }

  // const proj_resources_path = path.join(
  const projectResourcesPath = path.join(
    process.env.PROJECT_RESOURCES,
    "createTemplateFiles"
  );

  // Check if the directory exists
  if (!fs.existsSync(projectResourcesPath)) {
    return {
      result: false,
      message: "Missing project_resources/createTemplateFiles directory",
    };
  }
  const filePath = path.join(projectResourcesPath, templateFilename);
  let templateFileContents;
  let newFileContent;
  let createNginxFilesDir = path.join(process.env.NGINX_FILES_CREATED);

  // Check if the createNginxFilesDir directory exists
  if (!fs.existsSync(createNginxFilesDir)) {
    fs.mkdirSync(createNginxFilesDir, { recursive: true });
    console.log(`Directory created: ${createNginxFilesDir}`);
  }

  let outputFilePath = path.join(createNginxFilesDir, `${primaryServerName}`);

  // try {
  // Read the file contents synchronously
  templateFileContents = fs.readFileSync(filePath, "utf8");

  if (templateFilename === "expressJsConfd.txt") {
    outputFilePath = outputFilePath + ".conf";
    // replace the strings with
    newFileContent = templateFileContents
      .replace("<ReplaceMe: server name>", serverNamesString) // only once
      .replace("<ReplaceMe: port number>", createObj.port); // only once
  } else if (
    templateFilename === "nextJsConfd.txt" ||
    templateFilename === "pythonFlaskConfd.txt"
  ) {
    outputFilePath = outputFilePath + ".conf";
    newFileContent = templateFileContents
      .replace("<ReplaceMe: server name>", serverNamesString) // only once
      .replace(/<ReplaceMe: app cwd>/g, createObj.appCwd) // every instance
      .replace("<ReplaceMe: port number>", createObj.port); // only once
  } else {
    newFileContent = templateFileContents
      .replace("<ReplaceMe: server name>", serverNamesString) // only once
      .replace(/<ReplaceMe: local ip>/g, createObj.localIp) // every instance
      .replace(/<ReplaceMe: port number>/g, createObj.port); // every instance
  }

  // Write the new configuration to a file synchronously
  fs.writeFileSync(outputFilePath, newFileContent);
  console.log("Finished writing file ----");
  // } catch (error) {
  //   console.error(`Error during file operation: ${error.message}`);

  //   return {
  //     result: false,
  //     message: "Error processing the file",
  //     error: error.message,
  //   };
  // }

  return {
    result: true,
    templateFilename,
    outputFilePath,
    message: `Your ${createObj.nginxDir} file is stored at ${outputFilePath}`,
  };
}

module.exports = { createServerFile };
