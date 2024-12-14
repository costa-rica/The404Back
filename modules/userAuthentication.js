const jwt = require("jsonwebtoken");
const User = require("../models/user");

function createToken(user) {
  const payload = { userId: user.id };
  const secretKey = process.env.SECRET_KEY;
  console.log("secret eky: ", process.env.SECRET_KEY);
  return jwt.sign(payload, secretKey, { expiresIn: "7d" });
}

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token == null) return res.status(401).json({ message: "bad token" });

  jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: "invalid token" });
    req.user = user;
    next();
  });
}

async function findUserByEmail(email) {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      console.log("User not found");
    }
    return user;
  } catch (error) {
    console.error("Error finding user by email:", error);
  }
}

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
  findUserByEmail,
  restrictEmails,
};
