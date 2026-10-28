# ClubHire: Requirements

## Problem
Club recruitments at RVCE happen over Google Forms and WhatsApp groups. Students don't know where they stand after applying, and club leads juggle spreadsheets. ClubHire puts openings, applications and status updates in one place.

## Users
- **Student**: wants to find clubs and track applications.
- **Club admin**: one per club; posts openings and shortlists applicants.

## User stories
| # | As a… | I want to… | so that… |
|---|---|---|---|
| 1 | student | sign up with my USN and branch | clubs know who is applying |
| 2 | student | browse and search open recruitments | I can find roles matching my skills |
| 3 | student | apply with a short message | I can tell the club why I fit |
| 4 | student | see each application's status and history | I know where I stand |
| 5 | student | withdraw an application before shortlisting | I can change my mind |
| 6 | club admin | create, edit, close and delete openings | our recruitment info stays accurate |
| 7 | club admin | see all applicants for an opening | I can review them in one place |
| 8 | club admin | move an applicant to the next stage with a note | the student is informed (e.g. interview time) |
| 9 | anyone | get clear error messages | I can fix wrong input |
| 10 | student | sort clubs by their next recruitment date | I can see which recruitment is next and prepare |
| 11 | club admin | be warned when another club books my venue on the same day | we can fix the clash before recruitment day |

## Wireframes

**Home (browse openings)**
```
+--------------------------------------------------------------+
| ClubHire                     Openings  [Log in / Sign up]    |
+--------------------------------------------------------------+
|              Find your club at RVCE                          |
|   [ search by role or skill...........] [ All clubs  v ]     |
|  +----------------+  +----------------+  +----------------+  |
|  | Coding Club    |  | GDG RVCE       |  | Team Astra     |  |
|  | Web Developer  |  | Event Volunteer|  | Embedded Member|  |
|  | description... |  | description... |  | description... |  |
|  | [Python][C++]  |  | [Teamwork]     |  | [C++][Arduino] |  |
|  | 10 days left   |  | 14 days left   |  | 8 days left    |  |
|  |        [Apply] |  |        [Apply] |  |        [Apply] |  |
|  +----------------+  +----------------+  +----------------+  |
+--------------------------------------------------------------+
```

**Student: My applications**
```
| My applications                         [Browse openings]   |
| [ 3 applied ] [ 1 in progress ] [ 0 selected ] [ 0 rejected ]|
| +----------------------------------------------------------+ |
| | Coding Club · Web Developer                (Interview)   | |
| |  (1)------(2)------(3)------(4)                          | |
| | Applied Shortlisted Interview Selected                   | |
| | > Timeline: Interview - "Fri 4 PM, Mech block" - 28 Oct  | |
| +----------------------------------------------------------+ |
```

**Admin: Club dashboard**
```
| Coding Club                                [+ New opening]   |
| [ 2 openings ] [ 2 accepting ] [ 2 applications ]            |
| Title            Deadline   Applicants   Status   Actions    |
| Web Developer    6 Nov      1 view       Open     Close Edit Delete |
| ---- Applicants · Web Developer ---------------------------- |
| Demo Student  1RV24CS001 · CSE · Year 2        (Interview)   |
| "I have built small web apps..."                             |
| [note for student.........]  [-> Selected] [Reject]          |
```
