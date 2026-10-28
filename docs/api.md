# ClubHire: Database design and REST API

## Collections (MongoDB)
```
users                    clubs
-----                    -----
_id                      _id
name                     name (unique)
email (unique)           category: Technical|Social|Cultural|Sports
passwordHash (bcrypt)    description
role: student|admin
usn, branch, year        openings
skills [ ]               --------
club -> clubs (admins)   _id
                         club -> clubs
applications             title, description
------------             skills [ ]
_id                      deadline
opening -> openings      isOpen
student -> users
message
status: Applied|Shortlisted|Interview|Selected|Rejected
history [ {status, note, at} ]
UNIQUE (opening, student)   <- one application per student per opening
```

Club directory fields (all optional, editable by that club's admin): `recruitmentDates`, `venue`, `rounds`, `website`, `instagram`, `formLink` (the club's Google Form). Links must start with `http://` or `https://`.

Relationships: a club has many openings, an opening has many applications, and a student has many applications. Each admin belongs to one club.

Status rules (server-enforced):
`Applied → Shortlisted → Interview → Selected`, and any non-final step can go to `Rejected`.

## Endpoints
| Method | URL | Who | What |
|---|---|---|---|
| POST | /api/auth/register | public | create a student account |
| POST | /api/auth/login | public | log in (starts a session) |
| POST | /api/auth/logout | logged in | log out |
| GET | /api/auth/me | logged in | current user |
| GET | /api/clubs | public | club directory (schedule, venue, links) |
| GET | /api/clubs/mine | admin | my club's details |
| PUT | /api/clubs/mine | admin | update my club's schedule, venue and links |
| GET | /api/openings?q=&club= | public | list open openings (search, filter) |
| GET | /api/openings?mine=1 | admin | all openings of my club |
| GET | /api/openings/:id | public | one opening |
| POST | /api/openings | admin | create opening |
| PUT | /api/openings/:id | admin (own club) | edit / close / reopen |
| DELETE | /api/openings/:id | admin (own club) | delete opening and its applications |
| POST | /api/openings/:id/apply | student | apply |
| GET | /api/openings/:id/applications | admin (own club) | applicants for an opening |
| GET | /api/applications/mine | student | my applications |
| DELETE | /api/applications/:id | student (own) | withdraw (only while "Applied") |
| PATCH | /api/applications/:id/status | admin (own club) | move to next status with a note |

## Status codes used
`200` OK · `201` created · `400` invalid input · `401` not logged in · `403` wrong role / other club's data · `404` not found · `409` duplicate (email taken, already applied) · `500` server error
All errors return JSON: `{ "error": "message" }`.
