require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const AuthAccount = require("../models/AuthAccount");
const Donor = require("../models/Donor");
const Requester = require("../models/Requester");
const BloodRequest = require("../models/BloodRequest");
const LoginHistory = require("../models/LoginHistory");
const RegistrationHistory = require("../models/RegistrationHistory");

const verify = async () => {
  const connected = await connectDB();
  if (!connected) throw new Error("Verification stopped because MongoDB is unavailable.");

  const [
    loginaccounts,
    donors,
    requesters,
    bloodrequests,
    loginhistories,
    registrationhistories,
    accountsMissingPasswordHash,
  ] = await Promise.all([
    AuthAccount.countDocuments(),
    Donor.countDocuments(),
    Requester.countDocuments(),
    BloodRequest.countDocuments(),
    LoginHistory.countDocuments(),
    RegistrationHistory.countDocuments(),
    AuthAccount.countDocuments({ passwordHash: { $exists: false } }),
  ]);

  console.table({
    loginaccounts,
    donors,
    requesters,
    bloodrequests,
    loginhistories,
    registrationhistories,
  });

  if (accountsMissingPasswordHash > 0) {
    throw new Error(`${accountsMissingPasswordHash} login account(s) are missing a password hash.`);
  }

  console.log("Database structure verification passed. Password values were not displayed.");
};

verify()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
