const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const { requireLogin } = require("../middleware/auth");

const router = express.Router();
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USN_RE = /^1RV\d{2}[A-Z]{2}\d{3}$/i;   // e.g. 1RV24CS101

// what we send to the browser: never the password hash
function publicUser(u) {
  return { id: u._id, name: u.name, email: u.email, role: u.role, usn: u.usn, branch: u.branch, year: u.year, skills: u.skills, club: u.club };
}

// POST /api/auth/register  (students only; admins are created by seed.js)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, usn, branch, year, skills } = req.body;
    const errors = [];
    if (!name || name.trim().length < 2) errors.push("Name must be at least 2 characters");
    if (!email || !EMAIL_RE.test(email)) errors.push("Enter a valid email");
    if (!password || password.length < 8) errors.push("Password must be at least 8 characters");
    if (!usn || !USN_RE.test(usn.trim())) errors.push("USN must look like 1RV24CS101");
    if (!branch) errors.push("Branch is required");
    if (![1, 2, 3, 4].includes(Number(year))) errors.push("Year must be 1 to 4");
    if (errors.length) return res.status(400).json({ error: errors.join(". ") });

    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return res.status(409).json({ error: "An account with this email already exists" });

    const user = await User.create({
      name, email, usn, branch, year: Number(year),
      skills: Array.isArray(skills) ? skills : String(skills || "").split(",").map(s => s.trim()).filter(Boolean),
      passwordHash: await bcrypt.hash(password, 10),
      role: "student"
    });

    req.session.user = { id: user._id.toString(), role: user.role, club: null };
    res.status(201).json(publicUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not register, try again" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    // same message for "no such user" and "wrong password", so nobody can probe which emails exist
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({ error: "Wrong email or password" });
    }

    req.session.user = { id: user._id.toString(), role: user.role, club: user.club ? user.club.toString() : null };
    res.json(publicUser(user));
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not log in, try again" });
  }
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.clearCookie("connect.sid");
    res.json({ message: "Logged out" });
  });
});

// GET /api/auth/me  -> who is logged in (used by every page on load)
router.get("/me", requireLogin, async (req, res) => {
  const user = await User.findById(req.session.user.id).populate("club", "name");
  if (!user) return res.status(401).json({ error: "Please log in first" });
  res.json(publicUser(user));
});

module.exports = router;
