const mongoose = require("mongoose");
const AuthAccount = require("../models/AuthAccount");
const asyncHandler = require("../utils/asyncHandler");
const {
  findProfileByAccount,
  getProfileModel,
  mapAccountResponse,
} = require("../utils/accountProfile");
const { sendError, sendSuccess } = require("../utils/response");

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const editableFields = [
  "fullName",
  "requesterName",
  "patientName",
  "email",
  "bloodGroup",
  "gender",
  "age",
  "location",
  "city",
  "fullAddress",
  "whatsapp",
  "availability",
  "lastDonationDate",
  "hospital",
  "urgency",
  "units",
  "neededDate",
  "note",
  "medicalStatus",
  "consent",
];

const getMyProfile = asyncHandler(async (req, res) => {
  if (!isDatabaseReady()) return sendError(res, "MongoDB is not connected.", 503);

  const account = await AuthAccount.findById(req.user.id);
  if (!account) return sendError(res, "Account not found.", 404);

  const profile = await findProfileByAccount(account);
  if (!profile) return sendError(res, "Profile not found.", 404);

  return sendSuccess(res, { user: mapAccountResponse(account, profile) }, "Profile loaded");
});

const updateMyProfile = asyncHandler(async (req, res) => {
  if (!isDatabaseReady()) return sendError(res, "MongoDB is not connected.", 503);

  const account = await AuthAccount.findById(req.user.id);
  if (!account) return sendError(res, "Account not found.", 404);

  const ProfileModel = getProfileModel(account.role);
  if (!ProfileModel) return sendError(res, "Profile role is not supported.", 400);

  const updates = {};
  editableFields.forEach((field) => {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  });

  if (req.body.preferredContactTime !== undefined) {
    updates["preferences.preferredContactTime"] = req.body.preferredContactTime;
  }

  if (req.body.phone !== undefined) {
    const phone = String(req.body.phone).trim();
    account.phone = phone;
    updates.phone = phone;
    await account.save();
  }

  const profile = await ProfileModel.findOneAndUpdate(
    { accountId: account._id },
    { $set: updates },
    { returnDocument: "after", runValidators: true }
  );

  if (!profile) return sendError(res, "Profile not found.", 404);

  return sendSuccess(
    res,
    { user: mapAccountResponse(account, profile) },
    "Profile updated"
  );
});

module.exports = { getMyProfile, updateMyProfile };
