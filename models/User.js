const mongoose = require("mongoose");
const { BLOOD_GROUPS, ROLES } = require("../utils/constants");

const userSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: [ROLES.DONOR, ROLES.REQUESTER, ROLES.ADMIN],
      required: true,
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
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      default: "",
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    bloodGroup: {
      type: String,
      enum: BLOOD_GROUPS,
      default: "",
    },
    gender: {
      type: String,
      trim: true,
      default: "",
    },
    age: {
      type: Number,
      min: 0,
      default: null,
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
    whatsapp: {
      type: String,
      trim: true,
      default: "",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    availability: {
      type: String,
      trim: true,
      default: "Available",
    },
    lastDonationDate: {
      type: String,
      trim: true,
      default: "",
    },
    hospital: {
      type: String,
      trim: true,
      default: "",
    },
    urgency: {
      type: String,
      trim: true,
      default: "",
    },
    units: {
      type: Number,
      min: 0,
      default: null,
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
    medicalStatus: {
      type: String,
      trim: true,
      default: "",
    },
    consent: {
      type: Boolean,
      default: false,
    },
    preferences: {
      preferredContactTime: {
        type: String,
        trim: true,
        default: "",
      },
    },
    auth: {
      passwordUpdatedAt: {
        type: Date,
        default: null,
      },
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

userSchema.set("toJSON", {
  transform: (_, returnedObject) => {
    delete returnedObject.passwordHash;
    return returnedObject;
  },
});

module.exports = mongoose.model("User", userSchema);
