
const REGISTER_FORM_URL = "https://forms.google.com/";
const INSTAGRAM_PLACEHOLDER = "https://www.instagram.com/";
const clubs = [
  {
    name: "Coding Club",
    date: "27 Oct, 29 Oct 2026",
    venue: "CSE / ISE Department",
    rounds: "Rounds 1–2",
    url: "https://codingclubrvce.com/",
    instagram: "https://www.instagram.com/coding_club_rvce/"
  },
  {
    name: "Team Antariksh",
    date: "30 Oct, 2 Nov 2026",
    venue: "ETE Seminar Hall",
    rounds: "Rounds 1–2",
    url: "https://www.teamantariksh.in/index.html",
    instagram: "https://www.instagram.com/teamantarikshofficial/"
  },
  { name: "Accelerate", date: "28 Oct 2026", venue: "DTH", rounds: "Round 1", url: "#", instagram: "#" },
  { name: "Ashwa Racing", date: "29 Oct, 2 Nov 2026", venue: "IEM Seminar Hall", rounds: "Rounds 1–2", url: "#", instagram: "#" },
  { name: "Dhruva", date: "29 Oct, 2 Nov 2026", venue: "DTH", rounds: "Rounds 1–2", url: "#", instagram: "#" },
  { name: "Entrepreneurship Cell", date: "28–30 Oct 2026", venue: "Civil Seminar Hall", rounds: "Rounds 1–3", url: "#", instagram: "#" },
  { name: "GDG RVCE", date: "29 Oct 2026", venue: "MCA Seminar Hall", rounds: "Round 1", url: "#", instagram: "#" },
  { name: "Project Garuda", date: "27 Oct 2026", venue: "DTH", rounds: "Round 1", url: "#", instagram: "#" },
  { name: "Project Jatayu", date: "27, 30 Oct 2026", venue: "AS002 and AS003", rounds: "Rounds 1–2", url: "#", instagram: "#" },
  { name: "RVCE Ham Club", date: "28 Oct 2026", venue: "ETE Seminar Hall", rounds: "Round 1", url: "#", instagram: "#" },
  { name: "SPARK: The IUCEE Student Chapter of RVCE", date: "28, 30 Oct 2026", venue: "MCA Seminar Hall", rounds: "Rounds 1–2", url: "#", instagram: "#" },
  { name: "Team Astra Robotics", date: "30 Oct, 2 Nov 2026", venue: "DTH / MCA Seminar Hall", rounds: "Rounds 1–2", url: "#", instagram: "#" },
  { name: "Team Chimera", date: "27, 30 Oct 2026", venue: "ECE Seminar Hall", rounds: "Rounds 1–2", url: "#", instagram: "#" },
  { name: "Team Chitrak", date: "28 Oct 2026", venue: "Mech PG Seminar Hall", rounds: "Round 1", url: "#", instagram: "#" },
  { name: "Team Elektra", date: "27 Oct, 2 Nov 2026", venue: "ISE / ECE Seminar Hall", rounds: "Rounds 1–2", url: "#", instagram: "#" },
  { name: "Team Helios Racing", date: "28 Oct, 2 Nov 2026", venue: "Civil Classrooms / Civil Seminar Hall", rounds: "Rounds 1–2", url: "#", instagram: "#" },
  { name: "Team Krushi", date: "27 Oct 2026", venue: "ETE Seminar Hall", rounds: "Round 1", url: "#", instagram: "#" },
  { name: "Team Vyoma", date: "28–29 Oct 2026", venue: "AS002 and AS003", rounds: "Rounds 1–2", url: "#", instagram: "#" }
];

const clubsGrid = document.getElementById("clubsGrid");

if (clubsGrid) {
  clubsGrid.innerHTML = clubs.map(club => `
    <article class="card">
      <h3>
        ${club.url !== "#"
          ? `<a href="${club.url}" target="_blank" rel="noopener noreferrer">${club.name}</a>`
          : club.name}
      </h3>

      <div class="club-socials">
        ${club.url !== "#"
          ? `<a href="${club.url}" target="_blank" rel="noopener noreferrer" aria-label="${club.name} website" title="Official website">🌐 Website</a>`
          : `<span class="social-placeholder" title="Website link coming soon">🌐 Website soon</span>`}

        <a
        href="${club.instagram !== "#" ? club.instagram : INSTAGRAM_PLACEHOLDER}"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="${club.name} Instagram"
        title="Instagram"
        >📷 Instagram</a>
      </div>

      <p><strong>Recruitment:</strong> ${club.date}</p>
      <p><strong>Venue:</strong> ${club.venue}</p>
      <p><strong>Rounds:</strong> ${club.rounds}</p>

      <a class="btn"
         href="${REGISTER_FORM_URL}"
         target="_blank"
         rel="noopener noreferrer">
        Register Now ↗
      </a>
    </article>
  `).join("");
}
