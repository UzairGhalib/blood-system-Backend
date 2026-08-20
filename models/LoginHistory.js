const mongoose = require("mongoose");

const loginHistorySchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "AuthAccount",
      required: true,
      index: true,
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
    ipAddress: {
      type: String,
      trim: true,
      default: "unknown",
    },
    userAgent: {
      type: String,
      trim: true,
      default: "",
    },
    status: {
      type: String,
      enum: ["success", "failed"],
      default: "success",
    },
    passwordVerified: {
      type: Boolean,
      required: true,
      default: false,
    },
    message: {
      type: String,
      trim: true,
      default: "Login successful",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("LoginHistory", loginHistorySchema);
