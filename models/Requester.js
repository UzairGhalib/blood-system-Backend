const mongoose = require("mongoose");
const { BLOOD_GROUPS } = require("../utils/constants");

const requesterSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthAccount",
      required: true,
      unique: true,
      index: true,
    },
    requesterName: { type: String, required: true, trim: true },
    patientName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true, index: true },
    email: { type: String, trim: true, default: "" },
    bloodGroup: { type: String, enum: BLOOD_GROUPS, required: true, index: true },
    location: { type: String, trim: true, default: "" },
    city: { type: String, trim: true, default: "" },
    fullAddress: { type: String, trim: true, default: "" },
    whatsapp: { type: String, trim: true, default: "" },
    hospital: { type: String, trim: true, default: "" },
    urgency: { type: String, trim: true, default: "Normal" },
    units: { type: Number, min: 1, default: 1 },
    neededDate: { type: String, trim: true, default: "" },
    note: { type: String, trim: true, default: "" },
    verified: { type: Boolean, default: false },
    consent: { type: Boolean, required: true },
  },
  { collection: "requesters", timestamps: true }
);

module.exports = mongoose.model("Requester", requesterSchema);
