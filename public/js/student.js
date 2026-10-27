// Student dashboard: my applications with a progress stepper and history timeline.

async function init() {
  const user = await getMe();
  if (!user || user.role !== "student") { location.href = "/"; return; }   // page guard
  renderNav(user);
  document.getElementById("profileLine").textContent =
    `${user.usn} · ${user.branch} · Year ${user.year}` + (user.skills.length ? " · " + user.skills.join(", ") : "");
  loadApplications();
}

async function loadApplications() {
  const list = document.getElementById("appList");
  try {
    const apps = (await api("GET", "/api/applications/mine")).filter(a => a.opening);  // skip if opening was deleted
    renderStats(apps);
    if (apps.length === 0) {
      list.innerHTML = '<p class="empty">You haven\'t applied anywhere yet. <a href="/">Browse openings →</a></p>';
      return;
    }
    list.innerHTML = apps.map(appCard).join("");
  } catch (err) {
    list.innerHTML = `<p class="error">${esc(err.message)}</p>`;
  }
}

function renderStats(apps) {
  const count = s => apps.filter(a => a.status === s).length;
  document.getElementById("stats").innerHTML = `
    <div class="stat"><b>${apps.length}</b><span>applied</span></div>
    <div class="stat"><b>${count("Shortlisted") + count("Interview")}</b><span>in progress</span></div>
    <div class="stat good"><b>${count("Selected")}</b><span>selected</span></div>
    <div class="stat bad"><b>${count("Rejected")}</b><span>rejected</span></div>`;
}

function appCard(a) {
  // newest event first in the timeline
  const timeline = a.history.slice().reverse().map(h => `
    <li><span class="badge ${h.status}">${h.status}</span>
      <span>${esc(h.note || "")}</span>
      <span class="muted">${formatDateTime(h.at)}</span></li>`).join("");

  return `
    <article class="card app-card">
      <div class="card-top">
        <div>
          <span class="club-name">${esc(a.opening.club.name)}</span>
          <h3>${esc(a.opening.title)}</h3>
        </div>
        <span class="badge ${a.status}">${a.status}</span>
      </div>
      ${stepperHTML(a.status)}
      <details>
        <summary>Timeline (${a.history.length})</summary>
        <ul class="timeline">${timeline}</ul>
        <p class="muted small">Your message: “${esc(a.message)}”</p>
      </details>
      ${a.status === "Applied" ? `<button class="btn small danger withdraw-btn" data-id="${a._id}">Withdraw</button>` : ""}
    </article>`;
}

document.getElementById("appList").addEventListener("click", async e => {
  const btn = e.target.closest(".withdraw-btn");
  if (!btn) return;
  if (!confirm("Withdraw this application?")) return;
  try {
    await api("DELETE", "/api/applications/" + btn.dataset.id);
    toast("Application withdrawn");
    loadApplications();
  } catch (err) {
    toast(err.message, "error");
  }
});

init();
