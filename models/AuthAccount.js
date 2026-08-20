const mongoose = require("mongoose");
const { ROLES } = require("../utils/constants");

const authAccountSchema = new mongoose.Schema(
  {
    phone: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    role: {
      type: String,
      enum: [ROLES.DONOR, ROLES.REQUESTER, ROLES.ADMIN],
      required: true,
      index: true,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    passwordUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    collection: "loginaccounts",
    timestamps: true,
  }
);

authAccountSchema.set("toJSON", {
  transform: (_, object) => {
    delete object.passwordHash;
    return object;
  },
});

module.exports = mongoose.model("AuthAccount", authAccountSchema);
