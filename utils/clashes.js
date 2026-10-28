// Schedule clash = two clubs booked the SAME VENUE on the SAME DAY.
// (Same day in different venues is fine: different rooms can run in parallel.)
//
// Days are stored as "YYYY-MM-DD" strings, so comparing two days is a plain string comparison,
// with no time-zone surprises.

function findClashes(club, allClubs) {
  const clashes = [];
  allClubs.forEach(other => {
    if (String(other._id) === String(club._id)) return;              // don't compare a club with itself
    const sharedDays = club.recruitmentDays.filter(d => other.recruitmentDays.includes(d));
    const sharedVenues = club.venues.filter(v => other.venues.includes(v));
    sharedDays.forEach(day => {
      sharedVenues.forEach(venue => clashes.push({ day: day, venue: venue, club: other.name }));
    });
  });
  // earliest problem first
  return clashes.sort((a, b) => a.day.localeCompare(b.day) || a.venue.localeCompare(b.venue));
}

module.exports = { findClashes };
