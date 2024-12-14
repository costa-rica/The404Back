var express = require("express");
var router = express.Router();
const os = require("os");
const { checkBody } = require("../modules/common");
const {
  createToken,
  findUserByEmail,
} = require("../modules/userAuthentication");
const User = require("../models/user");
const bcrypt = require("bcrypt");

router.post("/register", async (req, res) => {
  console.log("in POST /register");
  if (!checkBody(req.body, ["email", "password"])) {
    return res
      .status(401)
      .json({ result: false, error: "Missing or empty fields" });
  }
  const acceptedEmails = JSON.parse(process.env.ACCEPTED_EMAILS || "[]");

  const isAcceptedEmail = acceptedEmails.includes(req.body.email);

  if (!restrictEmails(req.body.email)) {
    console.log("🚨 email not accepted");
    return res.status(401).json({ message: "This email is not accepted" });
  }

  const email = req.body.email;
  const passwordHashed = bcrypt.hashSync(req.body.password, 10);
  const existing_user = await findUserByEmail(email);
  if (existing_user) {
    return res
      .status(400)
      .json({ result: false, message: "User exists already" });
  }
  const user = await User.create({ email, password: passwordHashed });
  const token = createToken(user);
  return res.json({ result: true, token });
});

router.post("/login", async (req, res) => {
  console.log("in POST /login");
  if (!checkBody(req.body, ["email", "password"])) {
    return res
      .status(401)
      .json({ result: false, error: "Missing or empty fields" });
  }

  const email = req.body.email;

  try {
    const user = await findUserByEmail(email);
    // check password
    if (!bcrypt.compareSync(req.body.password, user.password)) {
      console.log("wrong password");
      return res
        .status(401)
        .json({ result: false, message: "Mot de passe erroné" });
    }

    const token = createToken({ user_id: user.id });

    console.log("token: ", token);
    return res.json({ result: true, message: "found user", token });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = router;
