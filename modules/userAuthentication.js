const jwt = require("jsonwebtoken");
const User = require("../models/user");

function createToken(user) {
  const secretKey = process.env.SECRET_KEY;
  return jwt.sign({ user }, secretKey, { expiresIn: "7d" });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) {
    return res.status(401).json({ message: "Token is required" });
  }

  jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    const { user } = decoded;
    console.log("in authThoken func()");
    console.log("user: ");
    console.log(user);

    req.user = user.user; // Set the decoded payload directly to req.user
    next();
  });
}

function checkPermission(req, res, next) {
  console.log("---> in middleware: checkPermission");
  const user = req.user;

  console.log(user);
  console.log("--- above is user in the middleware: checkPermission");
  if (!user.toggleOnOffPermis) {
    return res
      .status(401)
      .json({ message: "Invalid permission for this action" });
  }
  next();
}

// async function findUserByEmail(email) {
//   try {
//     const user = await User.findOne({ where: { email } });
//     if (!user) {
//       console.log("User not found");
//     }
//     return user;
//   } catch (error) {
//     console.error("Error finding user by email:", error);
//   }
// }

// for ACCEPTED_EMAILS in .env just add "," to each new email (i.e. do not use [])
const restrictEmails = (email) => {
  const acceptedEmailsEnv = process.env.ACCEPTED_EMAILS;

  // If ACCEPTED_EMAILS is not defined or empty, return false
  if (!acceptedEmailsEnv) {
    return true;
  }

  // Convert the comma-separated string into an array of emails
  const acceptedEmails = acceptedEmailsEnv.split(",");

  // Check if the provided email exists in the list of accepted emails
  return acceptedEmails.includes(email);
};

module.exports = {
  createToken,
  authenticateToken,
  checkPermission,
  // findUserByEmail,
  restrictEmails,
};
