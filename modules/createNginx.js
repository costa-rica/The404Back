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

  console.log(`--> projectResourcesPath: ${projectResourcesPath}`);

  // Check if the directory exists
  if (!fs.existsSync(projectResourcesPath)) {
    console.log("projectResourcesPath does NOT exists");
    return {
      result: false,
      message: "Missing project_resources/createTemplateFiles directory",
    };
  }
  console.log("projectResourcesPath EXISTS");
  const filePath = path.join(projectResourcesPath, templateFilename);
  let templateFileContents;
  let newFileContent;
  const storeNginxFilePath =
    createObj.storeNginxFilePath || process.env.USER_HOME_DIR;
  let createNginxFilesDir = path.join(storeNginxFilePath);

  // Check if the createNginxFilesDir directory exists
  if (!fs.existsSync(createNginxFilesDir)) {
    fs.mkdirSync(createNginxFilesDir, { recursive: true });
    console.log(`Directory created: ${createNginxFilesDir}`);
  }

  let outputFilePath = path.join(createNginxFilesDir, `${primaryServerName}`);

  try {
    console.log("--> trying to read the nginx templateFile");
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
  } catch (error) {
    console.error(`Error during file operation: ${error.message}`);
    console.log("There might not be any nginx Template files <----");
    return {
      result: false,
      error:
        "Error processing the file -> there might not be any template files on the server ? check!",
    };
  }

  return {
    result: true,
    templateFilename,
    outputFilePath,
    message: `Your ${createObj.nginxDir} file is stored at ${outputFilePath}`,
  };
}

function getNginxStoragePaths() {
  // Retrieve environmental variables
  const storeHome = process.env.USER_HOME_DIR;
  const envVars = {
    NGINX_CONF_D_PATH: process.env.NGINX_CONF_D_PATH,
    NGINX_SITES_AVAILABLE_PATH: process.env.NGINX_SITES_AVAILABLE_PATH,
  };

  // Filter out invalid or missing paths
  const validPaths = Object.values(envVars).filter((elem) => {
    return typeof elem === "string" && elem.trim().length > 0;
  });

  // Always add USER_HOME_DIR as the first element if valid
  if (typeof storeHome === "string" && storeHome.trim().length > 0) {
    validPaths.unshift(storeHome);
  }

  return validPaths;
}

module.exports = { createServerFile, getNginxStoragePaths };
