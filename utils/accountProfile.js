const Donor = require("../models/Donor");
const Requester = require("../models/Requester");
const { ROLES } = require("./constants");

const getProfileModel = (role) => {
  if (role === ROLES.DONOR) return Donor;
  if (role === ROLES.REQUESTER) return Requester;
  return null;
};

const findProfileByAccount = async (account, options = {}) => {
  const Model = getProfileModel(account.role);
  if (!Model) return null;

  const query = Model.findOne({ accountId: account._id });
  if (options.session) query.session(options.session);
  return query;
};

const mapAccountResponse = (account, profile) => {
  const profileObject = profile ? profile.toObject() : {};
  const { _id, accountId, ...publicProfile } = profileObject;

  return {
    ...publicProfile,
    id: account._id,
    role: account.role,
    phone: account.phone,
  };
};

module.exports = {
  findProfileByAccount,
  getProfileModel,
  mapAccountResponse,
};
