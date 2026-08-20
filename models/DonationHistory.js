const mongoose = require("mongoose");
const { BLOOD_GROUPS } = require("../utils/constants");

const donationHistorySchema = new mongoose.Schema(
  {
    donorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthAccount",
      required: true,
      index: true,
    },
    donorName: {
      type: String,
      trim: true,
      required: true,
    },
    requesterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthAccount",
      default: null,
      index: true,
    },
    requesterName: {
      type: String,
      trim: true,
      default: "",
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      required: true,
    },
    units: {
      type: Number,
      min: 1,
      default: 1,
    },
    donatedAt: {
      type: Date,
      default: Date.now,
    },
    location: {
      type: String,
      trim: true,
      default: "",
    },
    hospital: {
      type: String,
      trim: true,
      default: "",
    },
    notes: {
      type: String,
      trim: true,
      default: "",
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

module.exports = mongoose.model("DonationHistory", donationHistorySchema);
