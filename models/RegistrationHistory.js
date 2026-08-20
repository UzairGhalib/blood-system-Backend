const mongoose = require("mongoose");

const registrationHistorySchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthAccount",
      required: true,
      index: true,
    },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    profileCollection: {
      type: String,
      enum: ["donors", "requesters"],
      required: true,
    },
    role: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    fullName: {
      type: String,
      trim: true,
      default: "",
    },
    requesterName: {
      type: String,
      trim: true,
      default: "",
    },
    patientName: {
      type: String,
      trim: true,
      default: "",
    },
    city: {
      type: String,
      trim: true,
      default: "",
    },
    bloodGroup: {
      type: String,
      trim: true,
      default: "",
    },
    passwordStored: {
      type: Boolean,
      required: true,
      default: true,
    },
    passwordStorage: {
      type: String,
      default: "bcrypt hash in users collection",
      immutable: true,
    },
    source: {
      type: String,
      trim: true,
      default: "web",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("RegistrationHistory", registrationHistorySchema);
