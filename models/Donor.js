const mongoose = require("mongoose");
const { BLOOD_GROUPS } = require("../utils/constants");

const donorSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthAccount",
      required: true,
      unique: true,
      index: true,
    },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, default: "" },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true, index: true },
    gender: { type: String, trim: true, default: "" },
    age: { type: Number, min: 0, default: null },
    location: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    fullAddress: { type: String, trim: true, default: "" },
    whatsapp: { type: String, trim: true, default: "" },
    availability: { type: String, trim: true, default: "Available" },
    lastDonationDate: { type: String, trim: true, default: "" },
    medicalStatus: { type: String, trim: true, default: "" },
    note: { type: String, trim: true, default: "" },
    verified: { type: Boolean, default: false },
    consent: { type: Boolean, required: true },
    preferences: {
      preferredContactTime: { type: String, trim: true, default: "" },
    },
  },
  { collection: "donors", timestamps: true }
);

module.exports = mongoose.model("Donor", donorSchema);
