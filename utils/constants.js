const ROLES = {
  DONOR: "donor",
  REQUESTER: "requester",
  ADMIN: "admin",
};

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

const REQUEST_STATUSES = ["Open", "Matched", "Contacted", "Fulfilled", "Closed"];

module.exports = {
  BLOOD_GROUPS,
  REQUEST_STATUSES,
  ROLES,
};
