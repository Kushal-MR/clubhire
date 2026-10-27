require("dotenv").config();
const express = require("express");
const session = require("express-session");
const path = require("path");
const connectDB = require("./config/db");

const app = express();
const PORT = process.env.PORT || 5050;

// ---- middleware ----
app.use(express.json());                                   // read JSON request bodies
app.use(session({
  secret: process.env.SESSION_SECRET || "dev-secret-change-me",
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, maxAge: 1000 * 60 * 60 * 8 }   // 8 hours; JS in the page can't read it
}));
app.use(express.static(path.join(__dirname, "public")));    // serves the frontend

// simple request logger, handy during the demo
app.use((req, res, next) => {
  if (req.path.startsWith("/api")) console.log(new Date().toLocaleTimeString(), req.method, req.path);
  next();
});

// ---- API routes ----
app.use("/api/auth", require("./routes/auth"));
app.use("/api/clubs", require("./routes/clubs"));
app.use("/api/openings", require("./routes/openings"));
app.use("/api/applications", require("./routes/applications"));

// unknown API route -> JSON 404 (instead of an HTML page)
app.use("/api", (req, res) => res.status(404).json({ error: "API route not found" }));

// any error that wasn't handled in a route ends up here
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server" });
});

connectDB()
  .then(() => {
    const server = app.listen(PORT, () => console.log(`ClubHire running at http://localhost:${PORT}`));
    server.on("error", err => {
      if (err.code === "EADDRINUSE") console.error(`Port ${PORT} is already used by another app. Change PORT in .env and restart.`);
      else console.error(err);
      process.exit(1);
    });
  })
  .catch(err => {
    console.error("Could not connect to MongoDB. Is it running?\n", err.message);
    process.exit(1);
  });
