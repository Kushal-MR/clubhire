// Home page: list openings, search/filter, login/register, apply.

let currentUser = null;
let appliedIds = new Set();    // openings this student already applied to
let applyingTo = null;         // opening currently shown in the apply dialog
let openingsCache = [];

async function init() {
  currentUser = await getMe();
  renderNav(currentUser);
  bindNavLogin();

  const clubs = await api("GET", "/api/clubs").catch(() => []);
  document.getElementById("clubFilter").innerHTML += clubs.map(c => `<option value="${c._id}">${esc(c.name)}</option>`).join("");

  if (currentUser && currentUser.role === "student") {
    const mine = await api("GET", "/api/applications/mine").catch(() => []);
    appliedIds = new Set(mine.filter(a => a.opening).map(a => a.opening._id));
  }
  loadOpenings();
}

function bindNavLogin() {
  const btn = document.getElementById("loginBtn");
  if (btn) btn.addEventListener("click", () => document.getElementById("authDialog").showModal());
}

// ---------- openings list ----------
async function loadOpenings() {
  const q = document.getElementById("searchInput").value.trim();
  const club = document.getElementById("clubFilter").value;
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (club) params.set("club", club);

  try {
    openingsCache = await api("GET", "/api/openings?" + params.toString());
    renderOpenings(openingsCache);
  } catch (err) {
    document.getElementById("openingsGrid").innerHTML = `<p class="error">${esc(err.message)}</p>`;
  }
}

function renderOpenings(list) {
  document.getElementById("resultInfo").textContent = list.length + " open recruitment" + (list.length === 1 ? "" : "s");
  const grid = document.getElementById("openingsGrid");
  if (list.length === 0) {
    grid.innerHTML = '<p class="empty">No openings match your search.</p>';
    return;
  }
  grid.innerHTML = list.map(o => {
    let button = `<button class="btn apply-btn" data-id="${o._id}">Apply</button>`;
    if (appliedIds.has(o._id)) button = '<span class="badge Applied">Applied ✓</span>';
    else if (currentUser && currentUser.role === "admin") button = "";
    return `
      <article class="card">
        <div class="card-top">
          <span class="club-name">${esc(o.club.name)}</span>
          <span class="tag ${esc(o.club.category)}">${esc(o.club.category)}</span>
        </div>
        <h3>${esc(o.title)}</h3>
        <p class="desc">${esc(o.description)}</p>
        <div class="skills">${o.skills.map(s => `<span class="skill">${esc(s)}</span>`).join("")}</div>
        <div class="card-bottom">
          <span class="muted">⏳ ${daysLeft(o.deadline)} · 👥 ${o.applicants} applied</span>
          ${button}
        </div>
      </article>`;
  }).join("");
}

// one listener for every Apply button (event delegation)
document.getElementById("openingsGrid").addEventListener("click", e => {
  const btn = e.target.closest(".apply-btn");
  if (!btn) return;
  if (!currentUser) {
    toast("Log in as a student to apply");
    document.getElementById("authDialog").showModal();
    return;
  }
  openApply(openingsCache.find(o => o._id === btn.dataset.id));
});

// search while typing, but wait 300 ms after the last key so we don't call the server on every letter
let searchTimer;
document.getElementById("searchInput").addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadOpenings, 300);
});
document.getElementById("clubFilter").addEventListener("change", loadOpenings);

// ---------- apply ----------
function openApply(opening) {
  applyingTo = opening;
  document.getElementById("applyTitle").textContent = opening.title;
  document.getElementById("applyClub").textContent = opening.club.name + " · deadline " + formatDate(opening.deadline);
  document.getElementById("applyDesc").textContent = opening.description;
  document.getElementById("applyForm").reset();
  document.getElementById("charCount").textContent = "0 / 500";
  document.getElementById("applyError").textContent = "";
  document.getElementById("applyDialog").showModal();
}

document.querySelector("#applyForm textarea").addEventListener("input", e => {
  document.getElementById("charCount").textContent = e.target.value.length + " / 500";
});

document.getElementById("applyForm").addEventListener("submit", async e => {
  e.preventDefault();
  const message = e.target.message.value.trim();
  const errorBox = document.getElementById("applyError");
  if (message.length < 20) { errorBox.textContent = "Please write at least 20 characters."; return; }
  try {
    await api("POST", `/api/openings/${applyingTo._id}/apply`, { message: message });
    appliedIds.add(applyingTo._id);
    document.getElementById("applyDialog").close();
    toast("Application submitted 🎉", "success");
    loadOpenings();
  } catch (err) {
    errorBox.textContent = err.message;
  }
});

// ---------- login / register ----------
document.querySelectorAll(".tab").forEach(tab => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach(t => t.classList.toggle("active", t === tab));
    document.getElementById("loginForm").hidden = tab.dataset.tab !== "login";
    document.getElementById("registerForm").hidden = tab.dataset.tab !== "register";
  });
});

document.getElementById("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target;
  const errorBox = document.getElementById("loginError");
  if (!f.email.value || !f.password.value) { errorBox.textContent = "Enter your email and password."; return; }
  try {
    const user = await api("POST", "/api/auth/login", { email: f.email.value, password: f.password.value });
    location.href = user.role === "admin" ? "/admin.html" : "/";
  } catch (err) {
    errorBox.textContent = err.message;
  }
});

document.getElementById("registerForm").addEventListener("submit", async e => {
  e.preventDefault();
  const f = e.target;
  const errorBox = document.getElementById("registerError");
  const data = {
    name: f.name.value.trim(), email: f.email.value.trim(), usn: f.usn.value.trim().toUpperCase(),
    branch: f.branch.value, year: f.year.value, skills: f.skills.value, password: f.password.value
  };
  // frontend checks (the server checks again, never trust only the browser)
  if (data.name.length < 2) return (errorBox.textContent = "Enter your full name.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return (errorBox.textContent = "Enter a valid email.");
  if (!/^1RV\d{2}[A-Z]{2}\d{3}$/.test(data.usn)) return (errorBox.textContent = "USN must look like 1RV24CS101.");
  if (!data.branch || !data.year) return (errorBox.textContent = "Select your branch and year.");
  if (data.password.length < 8) return (errorBox.textContent = "Password must be at least 8 characters.");
  try {
    await api("POST", "/api/auth/register", data);
    location.href = "/";
  } catch (err) {
    errorBox.textContent = err.message;
  }
});

// every "Cancel" button closes its dialog
document.querySelectorAll(".close-dialog").forEach(b => b.addEventListener("click", () => b.closest("dialog").close()));

init();
