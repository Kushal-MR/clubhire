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

  const clubs = await Club.insertMany([
    { name: "Coding Club", category: "Technical", description: "Web, app and open-source projects, weekly build sessions and hackathons." },
    { name: "Rotaract Club of RVCE", category: "Social", description: "Community service, leadership and social impact projects." },
    { name: "CodeChef RVCE", category: "Technical", description: "Competitive programming contests, DSA sessions and hackathons." },
    { name: "Team Antariksh", category: "Technical", description: "Student space technology and rocketry team." }
  ]);
  const [coding, rotaract, codechef, antariksh] = clubs;

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

  console.log("Seeded: 4 clubs, 4 admins, 3 students, 5 openings, 3 applications");
  console.log("All passwords: password123   e.g. coding@rvce.edu.in (admin), student@rvce.edu.in (student)");
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
