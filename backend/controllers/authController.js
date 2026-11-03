const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Compared against when the email is unknown, so "no such user" costs the same time as "wrong password"
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", 10);

const isText = (v) => typeof v === "string" && v.trim().length > 0;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

//  REGISTER
exports.signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // typeof checks also stop objects like { "$ne": null } reaching the query
    if (!isText(name) || !isText(email) || typeof password !== "string") {
      return res.status(400).json({ msg: "Name, email and password are required" });
    }

    if (!EMAIL_RE.test(email.trim()) || email.length > 254) {
      return res.status(400).json({ msg: "Enter a valid email address" });
    }

    if (password.length < 6 || password.length > 72) {
      return res.status(400).json({ msg: "Password must be 6 to 72 characters" });
    }

    const existing = await User.findOne({ email: email.trim() });
    if (existing) {
      return res.status(400).json({ msg: "User already exists" });
    }

    const hash = await bcrypt.hash(password, 10);

    await User.create({
      name: name.trim().slice(0, 80),
      email: email.trim(),
      password: hash
    });

    res.json({
      msg: "User registered successfully"
    });

  } catch (err) {
    console.log("SIGNUP ERROR:", err.message);
    res.status(500).json({ msg: "Something went wrong" });
  }
};

//  LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!isText(email) || typeof password !== "string") {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const user = await User.findOne({ email: email.trim() });

    // one answer for "no such user" and "wrong password"
    const isMatch = await bcrypt.compare(password, user ? user.password : DUMMY_HASH);
    if (!user || !isMatch) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }

    const token = jwt.sign(
      {
        id: user._id,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (err) {
    console.log("LOGIN ERROR:", err.message);
    res.status(500).json({ msg: "Something went wrong" });
  }
};
