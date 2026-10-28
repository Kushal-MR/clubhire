// Club directory: loads every club and its recruitment schedule from the backend (GET /api/clubs).
// Club admins update their own club's dates, venue and links from the Club dashboard.

// General registration form, used until a club adds its own Google Form link
const DEFAULT_FORM_URL = "https://forms.google.com/";

// only real web links are turned into <a> tags
function isWebLink(url) {
  return /^https?:\/\//i.test(url || "");
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

  const hasOwnForm = isWebLink(club.formLink);
  const formUrl = hasOwnForm ? club.formLink : DEFAULT_FORM_URL;

  return `
    <article class="card">
      <h3>${name}</h3>
      <div class="club-socials">${website}${instagram}</div>
      <p><strong>Recruitment:</strong> ${esc(club.recruitmentDates || "To be announced")}</p>
      <p><strong>Venue:</strong> ${esc(club.venue || "To be announced")}</p>
      <p><strong>Rounds:</strong> ${esc(club.rounds || "To be announced")}</p>
      <a class="btn" href="${esc(formUrl)}" target="_blank" rel="noopener noreferrer"
         title="${hasOwnForm ? "Opens the club's registration form" : "General registration form"}">Register Now ↗</a>
    </article>`;
}

async function loadClubDirectory() {
  const grid = document.getElementById("clubsGrid");
  if (!grid) return;
  try {
    const clubs = await api("GET", "/api/clubs");
    // clubs with an announced schedule first, then the rest (each group already A–Z from the server)
    clubs.sort((a, b) => Boolean(b.recruitmentDates) - Boolean(a.recruitmentDates));
    grid.innerHTML = clubs.length ? clubs.map(clubCard).join("") : '<p class="empty">No clubs yet.</p>';
  } catch (err) {
    grid.innerHTML = `<p class="error">${esc(err.message)}</p>`;
  }
}

loadClubDirectory();
