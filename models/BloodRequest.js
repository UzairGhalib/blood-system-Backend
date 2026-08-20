const mongoose = require("mongoose");
const { BLOOD_GROUPS, REQUEST_STATUSES } = require("../utils/constants");

const bloodRequestSchema = new mongoose.Schema(
  {
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthAccount",
      required: false,
      index: true,
    },
    requesterName: {
      type: String,
      trim: true,
      required: true,
    },
    patientName: {
      type: String,
      trim: true,
      required: true,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
      index: true,
    },
    units: {
      type: Number,
      min: 1,
      default: 1,
    },
    urgency: {
      type: String,
      trim: true,
      default: "Normal",
      index: true,
    },
    status: {
      type: String,
      enum: REQUEST_STATUSES,
      default: "Open",
      index: true,
    },
    hospital: {
      type: String,
      trim: true,
      default: "",
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    fullAddress: {
      type: String,
      trim: true,
      default: "",
    },
    phone: {
      type: String,
      trim: true,
      default: "",
    },
    whatsapp: {
      type: String,
      trim: true,
      default: "",
    },
    neededDate: {
      type: String,
      trim: true,
      default: "",
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    matchedDonorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    matchedDonorName: {
      type: String,
      trim: true,
      default: "",
    },
    contactCount: {
      type: Number,
      default: 0,
    },
    meta: {
      type: Object,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("BloodRequest", bloodRequestSchema);
