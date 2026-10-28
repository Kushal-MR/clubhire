// Fills the database with clubs, one admin per club, sample students and openings.
// Run with: npm run seed   (WARNING: clears existing data)
require("dotenv").config();
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const User = require("./models/User");
const Club = require("./models/Club");
const Opening = require("./models/Opening");
const Application = require("./models/Application");

const days = n => new Date(Date.now() + n * 24 * 60 * 60 * 1000);

async function seed() {
  await connectDB();
  await Promise.all([User.deleteMany(), Club.deleteMany(), Opening.deleteMany(), Application.deleteMany()]);

  // Real RVCE recruitment schedule (club directory), plus Rotaract and CodeChef used by the demo openings.
  // formLink is left empty until each club shares its Google Form; the site then uses a general form link.
  const c = (name, recruitmentDates, venue, rounds, extra) =>
    Object.assign({ name, recruitmentDates, venue, rounds, category: "Technical" }, extra);

  const clubs = await Club.insertMany([
    c("Coding Club", "27 Oct, 29 Oct 2026", "CSE / ISE Department", "Rounds 1–2",
      { description: "Web, app and open-source projects, weekly build sessions and hackathons.",
        website: "https://codingclubrvce.com/", instagram: "https://www.instagram.com/coding_club_rvce/" }),
    c("Team Antariksh", "30 Oct, 2 Nov 2026", "ETE Seminar Hall", "Rounds 1–2",
      { description: "Student space technology and rocketry team.",
        website: "https://www.teamantariksh.in/index.html", instagram: "https://www.instagram.com/teamantarikshofficial/" }),
    c("Accelerate", "28 Oct 2026", "DTH", "Round 1"),
    c("Ashwa Racing", "29 Oct, 2 Nov 2026", "IEM Seminar Hall", "Rounds 1–2"),
    c("Dhruva", "29 Oct, 2 Nov 2026", "DTH", "Rounds 1–2"),
    c("Entrepreneurship Cell", "28–30 Oct 2026", "Civil Seminar Hall", "Rounds 1–3"),
    c("GDG RVCE", "29 Oct 2026", "MCA Seminar Hall", "Round 1"),
    c("Project Garuda", "27 Oct 2026", "DTH", "Round 1"),
    c("Project Jatayu", "27, 30 Oct 2026", "AS002 and AS003", "Rounds 1–2"),
    c("RVCE Ham Club", "28 Oct 2026", "ETE Seminar Hall", "Round 1"),
    c("SPARK: The IUCEE Student Chapter of RVCE", "28, 30 Oct 2026", "MCA Seminar Hall", "Rounds 1–2"),
    c("Team Astra Robotics", "30 Oct, 2 Nov 2026", "DTH / MCA Seminar Hall", "Rounds 1–2"),
    c("Team Chimera", "27, 30 Oct 2026", "ECE Seminar Hall", "Rounds 1–2"),
    c("Team Chitrak", "28 Oct 2026", "Mech PG Seminar Hall", "Round 1"),
    c("Team Elektra", "27 Oct, 2 Nov 2026", "ISE / ECE Seminar Hall", "Rounds 1–2"),
    c("Team Helios Racing", "28 Oct, 2 Nov 2026", "Civil Classrooms / Civil Seminar Hall", "Rounds 1–2"),
    c("Team Krushi", "27 Oct 2026", "ETE Seminar Hall", "Round 1"),
    c("Team Vyoma", "28–29 Oct 2026", "AS002 and AS003", "Rounds 1–2"),
    c("Rotaract Club of RVCE", "", "", "", { category: "Social", description: "Community service, leadership and social impact projects." }),
    c("CodeChef RVCE", "", "", "", { description: "Competitive programming contests, DSA sessions and hackathons." })
  ]);
  const club = name => clubs.find(x => x.name === name);
  const coding = club("Coding Club"), rotaract = club("Rotaract Club of RVCE"),
        codechef = club("CodeChef RVCE"), antariksh = club("Team Antariksh");

  const hash = await bcrypt.hash("password123", 10);
  await User.insertMany([
    { name: "Coding Club Admin", email: "coding@rvce.edu.in", passwordHash: hash, role: "admin", club: coding._id },
    { name: "Rotaract Admin", email: "rotaract@rvce.edu.in", passwordHash: hash, role: "admin", club: rotaract._id },
    { name: "CodeChef Admin", email: "codechef@rvce.edu.in", passwordHash: hash, role: "admin", club: codechef._id },
    { name: "Antariksh Admin", email: "antariksh@rvce.edu.in", passwordHash: hash, role: "admin", club: antariksh._id }
  ]);
  const students = await User.insertMany([
    { name: "Demo Student", email: "student@rvce.edu.in", passwordHash: hash, role: "student", usn: "1RV24CS001", branch: "CSE", year: 2, skills: ["JavaScript", "Python", "Git"] },
    { name: "Ananya Rao", email: "ananya@student.rvce.edu.in", passwordHash: hash, role: "student", usn: "1RV24EC045", branch: "ECE", year: 2, skills: ["Embedded C", "PCB design"] },
    { name: "Rahul Shetty", email: "rahul@student.rvce.edu.in", passwordHash: hash, role: "student", usn: "1RV25ME012", branch: "ME", year: 1, skills: ["Figma", "Sketching"] }
  ]);

  const openings = await Opening.insertMany([
    { club: coding._id, title: "Web Developer", description: "Build and maintain the club website and internal tools with HTML, CSS, JavaScript and Node.js.", skills: ["JavaScript", "Node.js", "Python"], deadline: days(10) },
    { club: coding._id, title: "UI/UX Designer", description: "Design screens and clickable prototypes for club projects and event pages.", skills: ["Figma", "Design"], deadline: days(6) },
    { club: rotaract._id, title: "Event Volunteer", description: "Help organise blood donation camps, school outreach drives and fundraisers this semester.", skills: ["Communication", "Teamwork"], deadline: days(14) },
    { club: codechef._id, title: "Problem Setter", description: "Write and test problems for our monthly internal contests. Strong DSA needed.", skills: ["C++", "DSA"], deadline: days(8) },
    { club: antariksh._id, title: "Avionics Team", description: "Build flight computers and telemetry for our sounding rocket. Embedded experience preferred.", skills: ["Embedded C", "PCB design"], deadline: days(12) }
  ]);

  // a few applications at different stages so the dashboards aren't empty
  const at = d => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
  await Application.insertMany([
    { opening: openings[0]._id, student: students[0]._id, message: "I have built a few small web apps in JavaScript and would love to work on the club website.", status: "Interview",
      history: [{ status: "Applied", note: "Application submitted", at: at(4) }, { status: "Shortlisted", note: "Strong profile", at: at(2) }, { status: "Interview", note: "Interview on Friday 4 PM, Mech block", at: at(1) }] },
    { opening: openings[4]._id, student: students[1]._id, message: "I have designed two PCBs and worked with STM32 boards; avionics is exactly what I want to do.", status: "Shortlisted",
      history: [{ status: "Applied", note: "Application submitted", at: at(3) }, { status: "Shortlisted", note: "Good embedded background", at: at(1) }] },
    { opening: openings[1]._id, student: students[2]._id, message: "I enjoy sketching UI ideas in Figma and would love to design screens for the club projects.", status: "Applied",
      history: [{ status: "Applied", note: "Application submitted", at: at(1) }] }
  ]);

  console.log(`Seeded: ${clubs.length} clubs, 4 admins, 3 students, 5 openings, 3 applications`);
  console.log("All passwords: password123   e.g. coding@rvce.edu.in (admin), student@rvce.edu.in (student)");
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
