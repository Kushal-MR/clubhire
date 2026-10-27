// Shared helpers used by every page.

// Calls our backend and returns the JSON. Throws an Error with the server's message if it fails.
async function api(method, url, body) {
  const options = { method: method, headers: {} };
  if (body !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(url, options);
  } catch (e) {
    throw new Error("Server not reachable. Is `npm start` running?");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed (" + res.status + ")");
  return data;
}

// Returns the logged-in user, or null if not logged in
async function getMe() {
  try { return await api("GET", "/api/auth/me"); } catch (e) { return null; }
}

// Escape text before putting it inside innerHTML, so user input can't inject HTML/scripts (XSS)
function esc(text) {
  return String(text == null ? "" : text)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function formatDateTime(d) {
  return new Date(d).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}
function daysLeft(d) {
  const n = Math.ceil((new Date(d) - Date.now()) / 86400000);
  return n < 0 ? "closed" : n === 0 ? "last day" : n + " days left";
}

// Small popup message at the bottom of the screen
function toast(message, type) {
  const box = document.createElement("div");
  box.className = "toast " + (type || "");
  box.textContent = message;
  document.body.appendChild(box);
  setTimeout(() => box.remove(), 3000);
}

// Builds the top navigation depending on who is logged in
function renderNav(user) {
  const nav = document.getElementById("navLinks");
  let links = '<a href="/">Openings</a>';
  if (user && user.role === "student") links += '<a href="/student.html">My applications</a>';
  if (user && user.role === "admin") links += '<a href="/admin.html">Club dashboard</a>';
  if (user) {
    links += `<span class="nav-user">${esc(user.name)} · ${user.role}</span><button id="logoutBtn" class="btn small ghost">Log out</button>`;
  } else {
    links += '<button id="loginBtn" class="btn small">Log in / Sign up</button>';
  }
  nav.innerHTML = links;

  // highlight the current page
  nav.querySelectorAll("a").forEach(a => { if (a.getAttribute("href") === location.pathname) a.classList.add("active"); });

  const logout = document.getElementById("logoutBtn");
  if (logout) logout.addEventListener("click", async () => {
    await api("POST", "/api/auth/logout");
    location.href = "/";
  });
}

const STEPS = ["Applied", "Shortlisted", "Interview", "Selected"];

// Progress bar: Applied -> Shortlisted -> Interview -> Selected (or Rejected)
function stepperHTML(status) {
  const rejected = status === "Rejected";
  const current = STEPS.indexOf(status);
  return '<div class="stepper">' + STEPS.map((s, i) => {
    let cls = "";
    if (rejected) cls = "rejected";
    else if (i < current) cls = "done";
    else if (i === current) cls = "current";
    return `<div class="step ${cls}"><span class="dot">${i + 1}</span><span class="label">${s}</span></div>`;
  }).join("") + "</div>";
}
