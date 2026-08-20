const mongoose = require("mongoose");
const BloodRequest = require("../models/BloodRequest");
const asyncHandler = require("../utils/asyncHandler");
const { sendError, sendSuccess } = require("../utils/response");

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const listBloodRequests = asyncHandler(async (req, res) => {
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

  return sendSuccess(res, { requests }, "Blood requests loaded");
});

const createBloodRequest = asyncHandler(async (req, res) => {
  if (!isDatabaseReady()) {
    return sendError(res, "MongoDB is not connected.", 503);
  }

  const request = await BloodRequest.create({
    requesterId: req.user?.id || null,
    requesterName: String(req.body.requesterName || req.body.name || "").trim(),
    patientName: String(req.body.patientName || "").trim(),
    bloodGroup: String(req.body.bloodGroup || "").trim(),
    units: req.body.units === undefined || req.body.units === "" ? 1 : Number(req.body.units),
    urgency: String(req.body.urgency || "Normal").trim(),
    status: String(req.body.status || "Open").trim(),
    hospital: String(req.body.hospital || "").trim(),
    location: String(req.body.location || "").trim(),
    city: String(req.body.city || "").trim(),
    fullAddress: String(req.body.fullAddress || "").trim(),
    phone: String(req.body.phone || "").trim(),
    whatsapp: String(req.body.whatsapp || "").trim(),
    neededDate: String(req.body.neededDate || "").trim(),
    note: String(req.body.note || "").trim(),
    meta: {
      source: "api-create",
    },
  });

  return sendSuccess(res, { request }, "Blood request created", 201);
});

module.exports = {
  createBloodRequest,
  listBloodRequests,
};
