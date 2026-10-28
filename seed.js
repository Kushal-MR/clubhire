// Fills the database with the RVCE club directory, demo admins, students, openings and applications.
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

// Real RVCE recruitment schedule (Oct–Nov 2026). Days are "YYYY-MM-DD"; venues come from config/venues.js.
// formLink is empty until each club shares its Google Form; the site then uses a general form link.
const CLUBS = [
  { name: "Coding Club", recruitmentDays: ["2026-10-27", "2026-10-29"], venues: ["CSE Department", "ISE Department"], rounds: "Rounds 1–2",
    description: "Web, app and open-source projects, weekly build sessions and hackathons.",
    website: "https://codingclubrvce.com/", instagram: "https://www.instagram.com/coding_club_rvce/" },
  { name: "Team Antariksh", recruitmentDays: ["2026-10-30", "2026-11-02"], venues: ["ETE Seminar Hall"], rounds: "Rounds 1–2",
    description: "Student space technology and rocketry team.",
    website: "https://www.teamantariksh.in/index.html", instagram: "https://www.instagram.com/teamantarikshofficial/" },
  { name: "Accelerate", recruitmentDays: ["2026-10-28"], venues: ["DTH"], rounds: "Round 1" },
  { name: "Ashwa Racing", recruitmentDays: ["2026-10-29", "2026-11-02"], venues: ["IEM Seminar Hall"], rounds: "Rounds 1–2" },
  { name: "Dhruva", recruitmentDays: ["2026-10-29", "2026-11-02"], venues: ["DTH"], rounds: "Rounds 1–2" },
  { name: "Entrepreneurship Cell", recruitmentDays: ["2026-10-28", "2026-10-29", "2026-10-30"], venues: ["Civil Seminar Hall"], rounds: "Rounds 1–3" },
  { name: "GDG RVCE", recruitmentDays: ["2026-10-29"], venues: ["MCA Seminar Hall"], rounds: "Round 1",
    description: "Google Developer Group: tech talks, study jams and community events." },
  { name: "Project Garuda", recruitmentDays: ["2026-10-27"], venues: ["DTH"], rounds: "Round 1" },
  { name: "Project Jatayu", recruitmentDays: ["2026-10-27", "2026-10-30"], venues: ["AS002", "AS003"], rounds: "Rounds 1–2" },
  { name: "RVCE Ham Club", recruitmentDays: ["2026-10-28"], venues: ["ETE Seminar Hall"], rounds: "Round 1" },
  { name: "SPARK: The IUCEE Student Chapter of RVCE", recruitmentDays: ["2026-10-28", "2026-10-30"], venues: ["MCA Seminar Hall"], rounds: "Rounds 1–2" },
  { name: "Team Astra Robotics", recruitmentDays: ["2026-10-30", "2026-11-02"], venues: ["DTH", "MCA Seminar Hall"], rounds: "Rounds 1–2",
    description: "Robotics team building autonomous and remote-operated robots for national competitions." },
  { name: "Team Chimera", recruitmentDays: ["2026-10-27", "2026-10-30"], venues: ["ECE Seminar Hall"], rounds: "Rounds 1–2" },
  { name: "Team Chitrak", recruitmentDays: ["2026-10-28"], venues: ["Mech PG Seminar Hall"], rounds: "Round 1" },
  { name: "Team Elektra", recruitmentDays: ["2026-10-27", "2026-11-02"], venues: ["ISE Seminar Hall", "ECE Seminar Hall"], rounds: "Rounds 1–2" },
  { name: "Team Helios Racing", recruitmentDays: ["2026-10-28", "2026-11-02"], venues: ["Civil Classrooms", "Civil Seminar Hall"], rounds: "Rounds 1–2" },
  { name: "Team Krushi", recruitmentDays: ["2026-10-27"], venues: ["ETE Seminar Hall"], rounds: "Round 1" },
  { name: "Team Vyoma", recruitmentDays: ["2026-10-28", "2026-10-29"], venues: ["AS002", "AS003"], rounds: "Rounds 1–2" }
];

async function seed() {
  await connectDB();
  await Promise.all([User.deleteMany(), Club.deleteMany(), Opening.deleteMany(), Application.deleteMany()]);

  const clubs = await Club.insertMany(CLUBS);
  const club = name => clubs.find(x => x.name === name);
  const coding = club("Coding Club"), gdg = club("GDG RVCE"),
        astra = club("Team Astra Robotics"), antariksh = club("Team Antariksh");

  const hash = await bcrypt.hash("password123", 10);
  await User.insertMany([
    { name: "Coding Club Admin", email: "coding@rvce.edu.in", passwordHash: hash, role: "admin", club: coding._id },
    { name: "GDG Admin", email: "gdg@rvce.edu.in", passwordHash: hash, role: "admin", club: gdg._id },
    { name: "Astra Admin", email: "astra@rvce.edu.in", passwordHash: hash, role: "admin", club: astra._id },
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
    { club: gdg._id, title: "Event Volunteer", description: "Help run tech talks, study jams and community events: registrations, stage and social media.", skills: ["Communication", "Teamwork"], deadline: days(14) },
    { club: astra._id, title: "Embedded Systems Member", description: "Program motor controllers and sensors for our competition robots. Arduino or STM32 experience helps.", skills: ["C++", "Arduino"], deadline: days(8) },
    { club: antariksh._id, title: "Avionics Team", description: "Build flight computers and telemetry for our sounding rocket. Embedded experience preferred.", skills: ["Embedded C", "PCB design"], deadline: days(12) }
  ]);

  // a few applications at different stages so the dashboards aren't empty
  const at = d => new Date(Date.now() - d * 24 * 60 * 60 * 1000);
  await Application.insertMany([
    { opening: openings[0]._id, student: students[0]._id, message: "I have built a few small web apps in JavaScript and would love to work on the club website.", status: "Interview",
      history: [{ status: "Applied", note: "Application submitted", at: at(4) }, { status: "Shortlisted", note: "Strong profile", at: at(2) }, { status: "Interview", note: "Interview on Friday 4 PM, CSE Department", at: at(1) }] },
    { opening: openings[4]._id, student: students[1]._id, message: "I have designed two PCBs and worked with STM32 boards; avionics is exactly what I want to do.", status: "Shortlisted",
      history: [{ status: "Applied", note: "Application submitted", at: at(3) }, { status: "Shortlisted", note: "Good embedded background", at: at(1) }] },
    { opening: openings[1]._id, student: students[2]._id, message: "I enjoy sketching UI ideas in Figma and would love to design screens for the club projects.", status: "Applied",
      history: [{ status: "Applied", note: "Application submitted", at: at(1) }] }
  ]);

  console.log(`Seeded: ${clubs.length} clubs, 4 admins, 3 students, 5 openings, 3 applications`);
  console.log("All passwords: password123   e.g. astra@rvce.edu.in (admin with clashes), student@rvce.edu.in (student)");
  await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });
