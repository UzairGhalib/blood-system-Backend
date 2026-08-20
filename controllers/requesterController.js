const mongoose = require("mongoose");
const BloodRequest = require("../models/BloodRequest");
const asyncHandler = require("../utils/asyncHandler");
const { sendError, sendSuccess } = require("../utils/response");

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const listRequesterRequests = asyncHandler(async (req, res) => {
  if (!isDatabaseReady()) {
    return sendError(res, "MongoDB is not connected.", 503);
  }

  const requests = await BloodRequest.find()
    .select(
      "requesterName patientName bloodGroup units urgency status hospital location city phone whatsapp neededDate note createdAt"
    )
    .sort({ createdAt: -1 })
    .limit(200)
    .lean();

  return sendSuccess(res, { requests }, "Requester requests loaded");
});

module.exports = {
  listRequesterRequests,
};
