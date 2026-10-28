// Club directory: loads every club and its recruitment schedule from the backend (GET /api/clubs)
// and lets students sort by "next recruitment first" so they know what's coming up.

// General registration form, used until a club adds its own Google Form link
const DEFAULT_FORM_URL = "https://forms.google.com/";
let directoryClubs = [];

const isWebLink = url => /^https?:\/\//i.test(url || "");

// today's date as "YYYY-MM-DD" in local time (same format the database uses)
function todayString() {
  const d = new Date();
  return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
}
const dayLabel = day => new Date(day + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
const daysBetween = (from, to) => Math.round((new Date(to + "T00:00:00") - new Date(from + "T00:00:00")) / 86400000);

// first recruitment day that is today or later (null if all are over / none set)
function nextDay(club) {
  const today = todayString();
  return club.recruitmentDays.find(d => d >= today) || null;
}

// "Today", "Tomorrow", "In 3 days", "Over" or "Dates TBA"
function whenChip(club) {
  if (!club.recruitmentDays.length) return '<span class="when tba">Dates TBA</span>';
  const next = nextDay(club);
  if (!next) return '<span class="when over">Over</span>';
  const n = daysBetween(todayString(), next);
  const text = n === 0 ? "Today" : n === 1 ? "Tomorrow" : `In ${n} days`;
  return `<span class="when ${n <= 1 ? "now" : n <= 3 ? "soon" : ""}">${text}</span>`;
}

function clubCard(club) {
  const name = isWebLink(club.website)
    ? `<a href="${esc(club.website)}" target="_blank" rel="noopener noreferrer">${esc(club.name)}</a>`
    : esc(club.name);
  const website = isWebLink(club.website)
    ? `<a href="${esc(club.website)}" target="_blank" rel="noopener noreferrer" title="Official website">🌐 Website</a>`
    : `<span class="social-placeholder" title="Website link coming soon">🌐 Website soon</span>`;
  const instagram = isWebLink(club.instagram)
    ? `<a href="${esc(club.instagram)}" target="_blank" rel="noopener noreferrer" title="Instagram">📷 Instagram</a>`
    : `<span class="social-placeholder" title="Instagram link coming soon">📷 Instagram soon</span>`;

  // bold the next upcoming day; past days are greyed out
  const today = todayString(), next = nextDay(club);
  const days = club.recruitmentDays.length
    ? club.recruitmentDays.map(d => d === next ? `<b>${dayLabel(d)}</b>` : d < today ? `<span class="past">${dayLabel(d)}</span>` : dayLabel(d)).join(", ")
    : "To be announced";

  const hasOwnForm = isWebLink(club.formLink);
  return `
    <article class="card">
      <div class="card-top"><h3>${name}</h3>${whenChip(club)}</div>
      <div class="club-socials">${website}${instagram}</div>
      <p><strong>Recruitment:</strong> ${days}</p>
      <p><strong>Venue:</strong> ${esc(club.venues.join(" / ") || "To be announced")}</p>
      <p><strong>Rounds:</strong> ${esc(club.rounds || "To be announced")}</p>
      <a class="btn" href="${esc(hasOwnForm ? club.formLink : DEFAULT_FORM_URL)}" target="_blank" rel="noopener noreferrer"
         title="${hasOwnForm ? "Opens the club's registration form" : "General registration form"}">Register Now ↗</a>
    </article>`;
}

// sort: upcoming (soonest first) → finished → dates not announced; ties A–Z
function sortClubs(clubs, mode) {
  const list = clubs.slice();
  if (mode === "name") return list.sort((a, b) => a.name.localeCompare(b.name));
  const group = c => (nextDay(c) ? 0 : c.recruitmentDays.length ? 1 : 2);
  return list.sort((a, b) =>
    group(a) - group(b) ||
    (nextDay(a) || "").localeCompare(nextDay(b) || "") ||
    a.name.localeCompare(b.name));
}

function renderDirectory() {
  const grid = document.getElementById("clubsGrid");
  const mode = document.getElementById("clubSort").value;
  grid.innerHTML = directoryClubs.length
    ? sortClubs(directoryClubs, mode).map(clubCard).join("")
    : '<p class="empty">No clubs yet.</p>';

  // "Next up" line: the soonest upcoming recruitment day and who is recruiting then
  const upcoming = directoryClubs.filter(nextDay);
  const line = document.getElementById("nextUpLine");
  if (!upcoming.length) { line.textContent = "No upcoming recruitments right now."; return; }
  const soonest = upcoming.map(nextDay).sort()[0];
  const who = upcoming.filter(c => nextDay(c) === soonest).map(c => c.name);
  const n = daysBetween(todayString(), soonest);
  line.innerHTML = `📅 <b>Next up: ${dayLabel(soonest)}</b> (${n === 0 ? "today" : n === 1 ? "tomorrow" : "in " + n + " days"}): ${esc(who.join(", "))}`;
}

async function loadClubDirectory() {
  const grid = document.getElementById("clubsGrid");
  if (!grid) return;
  try {
    directoryClubs = await api("GET", "/api/clubs");
    renderDirectory();
  } catch (err) {
    grid.innerHTML = `<p class="error">${esc(err.message)}</p>`;
  }
}

document.getElementById("clubSort").addEventListener("change", renderDirectory);
loadClubDirectory();
