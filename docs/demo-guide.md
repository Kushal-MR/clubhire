# ClubHire: Demo Guide

A 6–7 minute live demo. Each step lists **what to click**, **what to say**, and the **backup screenshot** (in `docs/screenshots/`) to show if something breaks live.

All passwords: `password123`

| Account | Use it for |
|---|---|
| `student@rvce.edu.in` | student side |
| `astra@rvce.edu.in` | club admin **with schedule clashes** (Team Astra Robotics) |
| `coding@rvce.edu.in` | club admin with applicants (Coding Club) |

---

## Before the teacher arrives (2 minutes)

1. Double-click **`setup.bat`**. This resets the demo data, so Astra's clashes are back and the test application is gone.
2. Double-click **`start.bat`** and wait for `ClubHire running at http://localhost:5050` in the black window. **Keep that window open.**
3. Open http://localhost:5050 and check that the club cards appear.
4. Have `docs/screenshots/` open in another window, just in case.
5. If anything fails, see [Troubleshooting](../README.md#troubleshooting). Most problems are fixed by running `scripts\stop-server.bat`, then `start.bat`.

> ⚠ The "Today / Tomorrow / In N days / Over" chips depend on **today's date**. The seed data uses the real Oct–Nov 2026 schedule. If you demo after 2 Nov, every club shows "Over"; update the days in `seed.js` and re-run `setup.bat`.

---

## 1. The problem (30 s): no clicking
**Say:** "Club recruitments at RVCE happen over Google Forms, WhatsApp and posters. Students can't see what's coming up, and clubs end up booking the same hall on the same day. ClubHire puts the whole recruitment schedule, the applications and the status tracking in one place."

## 2. Club directory and date sorting (1 min)
**Click:** nothing. The home page opens on the club directory.
**Point at:** the blue **"Next up"** line, the **Sort: Next recruitment first** dropdown, and the green **Today** chips.
**Say:** "Every RVCE club and its real recruitment schedule, loaded from MongoDB. It's sorted by the next recruitment day, so students know which interview is next and can prepare. The next day is in bold."
**Then:** scroll down to show **In 2 days / In 5 days**, then **Over** with the past days struck through. Switch the dropdown to **Name (A–Z)** and back.
**Backup:** `01-club-directory-next-up.jpg`, `02-countdown-chips-and-past-days.jpg`

## 3. Search open roles (30 s)
**Click:** scroll to **Open roles**, type `python` in the search box.
**Say:** "Clubs also post specific roles. Search works on title and skills; the request goes to `GET /api/openings?q=python`."
**Backup:** `03-search-open-roles.jpg`

## 4. Student login and validation (1 min)
**Click:** **Log in / Sign up** → enter `student@rvce.edu.in` and a **wrong** password → **Log in**.
**Say:** "Validation happens on both sides. The server returns 401 with one message for both a wrong email and a wrong password, so nobody can find out which emails are registered. Passwords are stored as bcrypt hashes, never as plain text."
**Then:** type `password123` → **Log in**.
**Backup:** `04-login-validation-error.jpg`

## 5. Apply to a role (1 min)
**Click:** clear the search → **Apply** on **GDG RVCE · Event Volunteer** → type `I like events` → **Submit application**.
**Say:** "Under 20 characters, so it's rejected. The server enforces the same rule."
**Then:** write a proper message → **Submit**. The card now shows **Applied ✓**.
**Say:** "A unique index in MongoDB stops the same student applying twice."
**Backup:** `05-apply-validation.jpg`, `06-application-submitted.jpg`

## 6. Track the application (45 s)
**Click:** **My applications** in the top bar → open **Timeline (3)** on **Web Developer**.
**Say:** "Each application moves Applied → Shortlisted → Interview → Selected. Every status change is stored with a note from the club, like the interview time here."
**Backup:** `07-student-applications-stepper.jpg`, `08-student-status-timeline.jpg`

## 7. ⭐ Schedule clash detection (1.5 min): the main feature
**Click:** **Log out** → log in as `astra@rvce.edu.in`. You land on the Club dashboard.
**Point at:** the red **⚠ Schedule clash (2)** box.
**Say:** "Venues are picked from a fixed list, not typed, so 'DTH' can't be spelt three ways. The server compares every club's days and venues: same venue on the same day is a clash. In the real schedule, Team Astra and SPARK both booked the MCA Seminar Hall on 30 Oct, and Astra and Dhruva both booked DTH on 2 Nov. Both clubs see this warning on their dashboards."
**Then fix it:**
1. In **Recruitment days**, click **×** on *Mon, 2 Nov* → pick **3 Nov** in the date box → **+ Add day**.
2. Under **Venues**, untick **MCA Seminar Hall**.
3. **Save club details**.

**Point at:** the clash box disappears, and a green toast says **"Saved. No schedule clashes ✓"**.
**Say:** "The save goes to `PUT /api/clubs/mine`, and the server sends back the recalculated clash list. Admins can only edit their own club: the club ID comes from the login session, not from the request."
**Backup:** `09-admin-schedule-clash-warning.jpg`, `10-admin-fix-days-and-venues.jpg`, `11-clash-fixed.jpg`

> To repeat this demo, run `setup.bat` again to restore the clashes.

## 8. Club admin: manage applicants (45 s)
**Click:** **Log out** → log in as `coding@rvce.edu.in` → **👥 1 view** next to **Web Developer**.
**Say:** "Admins post, edit, close and delete openings (full CRUD) and move applicants through the stages. The server only allows the next step: an admin can't jump from Applied straight to Selected."
**Backup:** `12-admin-applicant-board.jpg`

## 9. Proof it's tested (30 s)
**Click:** double-click `scripts\run-smoke-test.bat` (the server must be running).
**Say:** "40 automated end-to-end API checks: login, CRUD, validation, permissions, status rules and clash detection. It resets the demo data at the end."
**Backup:** open `smoke-test-log.txt`; the last line says `RESULT: 40 passed, 0 failed`.

## 10. Close (20 s)
Show the GitHub repo: feature branches and pull requests, plus `docs/` (user stories, wireframes, API and database design, Postman collection).

---

## Likely questions

| Question | Answer |
|---|---|
| Where is the data stored? | MongoDB, in 4 collections: users, clubs, openings, applications (`docs/api.md`). |
| How does login work? | `express-session` stores the user id and role in a server-side session. The browser only holds a session cookie (`httpOnly`, so page JavaScript can't read it). Passwords are hashed with bcrypt. |
| How do you stop a student acting as an admin? | Every admin route uses the `requireRole("admin")` middleware, and admins can only touch data of the club stored in their session. Hiding buttons isn't enough, so the server checks every request. |
| How is a clash detected? | `utils/clashes.js`: for each other club, take the intersection of recruitment days and the intersection of venues. Every (day, venue) pair in both is a clash. |
| Why a fixed venue list? | Free text can't be compared reliably ("DTH" vs "D.T.H"). A fixed list (`config/venues.js`) makes clash detection possible, and the server rejects unknown venues. |
| Why store dates as `"2026-10-28"` strings? | They sort and compare correctly as plain strings, and there are no time-zone shifts. A JavaScript `Date` at midnight can turn into the previous day in UTC. |
| What's the limitation? | We don't store which venue is used on which day, so a club using two halls on different days counts as using both on every day. It can flag too much, but never misses a real clash. Next step: store a venue for each day. |
| What happens with XSS? | All user text is escaped before it goes into the page (`esc()` in `api.js`), and links must start with `http(s)://`, so `javascript:` links are rejected. |
| How do you register for a club? | The **Register Now** button opens the club's own Google Form (`formLink`), or a general form until the club adds one. Specific roles use in-app applications, which is what makes status tracking possible. |

## Retaking screenshots in full quality
The backup screenshots are 800×500. For a sharper poster image, open the page full screen and press **Win + Shift + S** to capture a region; it's copied to the clipboard and saved in Pictures → Screenshots.
