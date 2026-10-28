// Club admin dashboard: CRUD on openings + move applicants through the stages.

const NEXT = {   // same rules as the server (routes/applications.js)
  Applied: ["Shortlisted", "Rejected"],
  Shortlisted: ["Interview", "Rejected"],
  Interview: ["Selected", "Rejected"],
  Selected: [],
  Rejected: []
};

let openings = [];
let editingId = null;          // null = creating a new opening
let selectedOpening = null;    // whose applicants are shown
let applicants = [];

async function init() {
  const user = await getMe();
  if (!user || user.role !== "admin") { location.href = "/"; return; }   // page guard
  renderNav(user);
  document.getElementById("clubTitle").textContent = (user.club && user.club.name) || "Club dashboard";
  loadOpenings();
  loadClubDetails();
}

// ---------- openings table ----------
async function loadOpenings() {
  try {
    openings = await api("GET", "/api/openings?mine=1");
    renderOpenings();
    renderStats();
  } catch (err) {
    toast(err.message, "error");
  }
}

function renderStats() {
  const total = openings.reduce((sum, o) => sum + o.applicants, 0);
  document.getElementById("stats").innerHTML = `
    <div class="stat"><b>${openings.length}</b><span>openings</span></div>
    <div class="stat"><b>${openings.filter(o => o.isOpen).length}</b><span>accepting</span></div>
    <div class="stat"><b>${total}</b><span>applications</span></div>`;
}

function renderOpenings() {
  const body = document.getElementById("openingsBody");
  if (openings.length === 0) {
    body.innerHTML = '<tr><td colspan="5" class="empty">No openings yet. Click “+ New opening”.</td></tr>';
    return;
  }
  body.innerHTML = openings.map(o => `
    <tr class="${selectedOpening && selectedOpening._id === o._id ? "selected-row" : ""}">
      <td><b>${esc(o.title)}</b><br><span class="muted small">${o.skills.map(esc).join(", ")}</span></td>
      <td>${formatDate(o.deadline)}<br><span class="muted small">${daysLeft(o.deadline)}</span></td>
      <td><button class="link-btn" data-action="applicants" data-id="${o._id}">👥 ${o.applicants} view</button></td>
      <td><span class="badge ${o.isOpen ? "open" : "closed"}">${o.isOpen ? "Open" : "Closed"}</span></td>
      <td class="row-actions">
        <button class="btn small ghost" data-action="toggle" data-id="${o._id}">${o.isOpen ? "Close" : "Reopen"}</button>
        <button class="btn small ghost" data-action="edit" data-id="${o._id}">Edit</button>
        <button class="btn small danger" data-action="delete" data-id="${o._id}">Delete</button>
      </td>
    </tr>`).join("");
}

document.getElementById("openingsBody").addEventListener("click", async e => {
  const btn = e.target.closest("button[data-action]");
  if (!btn) return;
  const opening = openings.find(o => o._id === btn.dataset.id);
  try {
    if (btn.dataset.action === "applicants") showApplicants(opening);
    if (btn.dataset.action === "edit") openForm(opening);
    if (btn.dataset.action === "toggle") {
      await api("PUT", "/api/openings/" + opening._id, { isOpen: !opening.isOpen });
      toast(opening.isOpen ? "Opening closed" : "Opening reopened");
      loadOpenings();
    }
    if (btn.dataset.action === "delete") {
      if (!confirm(`Delete "${opening.title}" and all its applications?`)) return;
      await api("DELETE", "/api/openings/" + opening._id);
      if (selectedOpening && selectedOpening._id === opening._id) {
        selectedOpening = null;
        document.getElementById("applicantsPanel").hidden = true;
      }
      toast("Opening deleted");
      loadOpenings();
    }
  } catch (err) {
    toast(err.message, "error");
  }
});

// ---------- create / edit form ----------
function openForm(opening) {
  editingId = opening ? opening._id : null;
  const f = document.getElementById("openingForm");
  f.reset();
  document.getElementById("openingError").textContent = "";
  document.getElementById("openingDialogTitle").textContent = opening ? "Edit opening" : "New opening";
  if (opening) {
    f.title.value = opening.title;
    f.description.value = opening.description;
    f.skills.value = opening.skills.join(", ");
    f.deadline.value = opening.deadline.slice(0, 10);   // "2026-11-05T..." -> "2026-11-05"
  }
  document.getElementById("openingDialog").showModal();
}

document.getElementById("newOpeningBtn").addEventListener("click", () => openForm(null));

document.getElementById("openingForm").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target;
  const errorBox = document.getElementById("openingError");
  const data = {
    title: f.title.value.trim(),
    description: f.description.value.trim(),
    skills: f.skills.value,
    deadline: f.deadline.value ? f.deadline.value + "T23:59:00" : ""   // open until the end of that day
  };
  if (data.title.length < 3) return (errorBox.textContent = "Title must be at least 3 characters.");
  if (data.description.length < 20) return (errorBox.textContent = "Description must be at least 20 characters.");
  if (!data.deadline) return (errorBox.textContent = "Pick a deadline.");
  if (!editingId && new Date(data.deadline) < new Date()) return (errorBox.textContent = "Deadline must be today or later.");
  try {
    if (editingId) await api("PUT", "/api/openings/" + editingId, data);
    else await api("POST", "/api/openings", data);
    document.getElementById("openingDialog").close();
    toast(editingId ? "Opening updated" : "Opening posted 🎉", "success");
    loadOpenings();
  } catch (err) {
    errorBox.textContent = err.message;
  }
});

// ---------- applicants ----------
async function showApplicants(opening) {
  selectedOpening = opening;
  renderOpenings();
  document.getElementById("applicantsPanel").hidden = false;
  document.getElementById("applicantsTitle").textContent = "Applicants · " + opening.title;
  try {
    applicants = await api("GET", `/api/openings/${opening._id}/applications`);
    renderApplicants();
    document.getElementById("applicantsPanel").scrollIntoView({ behavior: "smooth" });
  } catch (err) {
    toast(err.message, "error");
  }
}

function renderApplicants() {
  const filter = document.getElementById("statusFilter").value;
  const list = applicants.filter(a => !filter || a.status === filter);
  const box = document.getElementById("applicantsList");
  if (list.length === 0) { box.innerHTML = '<p class="empty">No applicants here yet.</p>'; return; }

  box.innerHTML = list.map(a => {
    const s = a.student;
    const buttons = NEXT[a.status].map(next =>
      `<button class="btn small ${next === "Rejected" ? "danger" : ""}" data-app="${a._id}" data-status="${next}">${next === "Rejected" ? "Reject" : "→ " + next}</button>`).join("");
    return `
      <article class="card applicant">
        <div class="card-top">
          <div>
            <h3>${esc(s.name)} <span class="muted small">${esc(s.usn)} · ${esc(s.branch)} · Year ${s.year}</span></h3>
            <span class="muted small">${esc(s.email)}</span>
          </div>
          <span class="badge ${a.status}">${a.status}</span>
        </div>
        <div class="skills">${(s.skills || []).map(k => `<span class="skill">${esc(k)}</span>`).join("")}</div>
        <p class="message">“${esc(a.message)}”</p>
        ${stepperHTML(a.status)}
        ${buttons ? `<div class="move-row">
            <input class="note-input" id="note-${a._id}" placeholder="Note for the student (optional), e.g. Interview Fri 4 PM, CS lab">
            ${buttons}
          </div>` : '<p class="muted small">Final decision made.</p>'}
      </article>`;
  }).join("");
}

document.getElementById("statusFilter").addEventListener("change", renderApplicants);

document.getElementById("applicantsList").addEventListener("click", async e => {
  const btn = e.target.closest("button[data-status]");
  if (!btn) return;
  const status = btn.dataset.status;
  if (status === "Rejected" && !confirm("Reject this applicant?")) return;
  const note = document.getElementById("note-" + btn.dataset.app).value;
  try {
    await api("PATCH", `/api/applications/${btn.dataset.app}/status`, { status: status, note: note });
    toast("Moved to " + status, status === "Rejected" ? "" : "success");
    applicants = await api("GET", `/api/openings/${selectedOpening._id}/applications`);
    renderApplicants();
  } catch (err) {
    toast(err.message, "error");
  }
});

// ---------- club details: schedule, venues, links + clash warning ----------
const TEXT_FIELDS = ["description", "rounds", "formLink", "website", "instagram"];
let selectedDays = [];     // "YYYY-MM-DD" strings, kept sorted

const dayText = d => new Date(d + "T00:00:00").toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

function renderDays() {
  const box = document.getElementById("dayList");
  box.innerHTML = selectedDays.length
    ? selectedDays.map(d => `<span class="day-chip">${dayText(d)} <button type="button" data-day="${d}" title="Remove this day">×</button></span>`).join("")
    : '<span class="muted small">No days added yet.</span>';
}

// red box at the top of the dashboard listing every double-booked venue
function renderClashes(clashes) {
  const box = document.getElementById("clashBox");
  if (!clashes.length) { box.hidden = true; return; }
  box.hidden = false;
  box.innerHTML = `
    <h3>⚠ Schedule clash (${clashes.length})</h3>
    <p>Another club has booked the same venue on the same day:</p>
    <ul>${clashes.map(c => `<li><b>${dayText(c.day)}</b> · ${esc(c.venue)}: also booked by <b>${esc(c.club)}</b></li>`).join("")}</ul>
    <p class="small">Change the day or venue in <b>Club details</b> below and save. The warning disappears once the clash is fixed.</p>`;
}

async function loadClubDetails() {
  try {
    const [club, venues] = await Promise.all([api("GET", "/api/clubs/mine"), api("GET", "/api/clubs/venues")]);
    const f = document.getElementById("clubForm");
    TEXT_FIELDS.forEach(name => { f[name].value = club[name] || ""; });
    selectedDays = club.recruitmentDays.slice();
    renderDays();
    document.getElementById("venueChecks").innerHTML = venues.map(v => `
      <label class="check"><input type="checkbox" value="${esc(v)}" ${club.venues.includes(v) ? "checked" : ""}> ${esc(v)}</label>`).join("");
    renderClashes(club.clashes);
    // open the form straight away if there's a clash to fix or the schedule is empty
    if (club.clashes.length || !club.recruitmentDays.length) document.getElementById("clubDetails").open = true;
  } catch (err) {
    toast(err.message, "error");
  }
}

document.getElementById("addDayBtn").addEventListener("click", () => {
  const value = document.getElementById("dayPicker").value;       // "" if nothing picked
  if (!value) return toast("Pick a date first", "error");
  if (!selectedDays.includes(value)) selectedDays = [...selectedDays, value].sort();
  document.getElementById("dayPicker").value = "";
  renderDays();
});

document.getElementById("dayList").addEventListener("click", e => {
  const btn = e.target.closest("button[data-day]");
  if (!btn) return;
  selectedDays = selectedDays.filter(d => d !== btn.dataset.day);
  renderDays();
});

document.getElementById("clubForm").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target;
  const errorBox = document.getElementById("clubError");
  const data = { recruitmentDays: selectedDays };
  TEXT_FIELDS.forEach(name => { data[name] = f[name].value.trim(); });
  data.venues = [...document.querySelectorAll("#venueChecks input:checked")].map(c => c.value);

  // links must be real web links (the server checks this too)
  for (const name of ["formLink", "website", "instagram"]) {
    if (data[name] && !/^https?:\/\//i.test(data[name])) {
      errorBox.textContent = `${name === "formLink" ? "Google Form link" : name[0].toUpperCase() + name.slice(1)} must start with http:// or https://`;
      return;
    }
  }
  try {
    const saved = await api("PUT", "/api/clubs/mine", data);
    errorBox.textContent = "";
    renderClashes(saved.clashes);
    toast(saved.clashes.length ? `Saved, but ${saved.clashes.length} clash(es) remain` : "Saved. No schedule clashes ✓", saved.clashes.length ? "error" : "success");
  } catch (err) {
    errorBox.textContent = err.message;
  }
});

document.querySelectorAll(".close-dialog").forEach(b => b.addEventListener("click", () => b.closest("dialog").close()));

init();
