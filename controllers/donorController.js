const mongoose = require("mongoose");
const Donor = require("../models/Donor");
const asyncHandler = require("../utils/asyncHandler");
const { sendError, sendSuccess } = require("../utils/response");

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const listDonors = asyncHandler(async (req, res) => {
  if (!isDatabaseReady()) {
    return sendError(res, "MongoDB is not connected.", 503);
  }

  const donors = await Donor.find()
    .select(
      "fullName bloodGroup location city phone whatsapp availability lastDonationDate verified createdAt"
    )
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return sendSuccess(res, { donors }, "Donors loaded");
});

module.exports = {
  listDonors,
};
