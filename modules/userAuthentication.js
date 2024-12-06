const jwt = require("jsonwebtoken");
const User = require("../models/user");

function createToken(user) {
  const payload = { userId: user.id };
  const secretKey = process.env.SECRET_KEY;
  console.log("secret eky: ", process.env.SECRET_KEY);
  return jwt.sign(payload, secretKey, { expiresIn: "1h" });
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

module.exports = {
  createToken,
  authenticateToken,
  findUserByEmail,
};
