require("dotenv").config();
const mongoose = require("mongoose");

const connectDB = require("../config/db");
const User = require("../models/User");
const AuthAccount = require("../models/AuthAccount");
const Donor = require("../models/Donor");
const Requester = require("../models/Requester");
const { BLOOD_GROUPS, ROLES } = require("../utils/constants");

const validBloodGroup = (value) =>
  BLOOD_GROUPS.includes(value) ? value : "A+";

const donorData = (user) => ({
  accountId: user._id,
  fullName: user.fullName || "Registered donor",
  phone: user.phone,
  email: user.email || "",
  bloodGroup: validBloodGroup(user.bloodGroup),
  gender: user.gender || "",
  age: user.age ?? null,
  location: user.location || "",
  city: user.city || "",
  fullAddress: user.fullAddress || "",
  whatsapp: user.whatsapp || user.phone,
  availability: user.availability || "Available",
  lastDonationDate: user.lastDonationDate || "",
  medicalStatus: user.medicalStatus || "",
  note: user.note || "",
  verified: Boolean(user.verified),
  consent: Boolean(user.consent),
  preferences: user.preferences || {},
});

const requesterData = (user) => ({
  accountId: user._id,
  requesterName: user.requesterName || user.fullName || "Registered requester",
  patientName: user.patientName || user.fullName || "Patient",
  phone: user.phone,
  email: user.email || "",
  bloodGroup: validBloodGroup(user.bloodGroup),
  location: user.location || "",
  city: user.city || "",
  fullAddress: user.fullAddress || "",
  whatsapp: user.whatsapp || user.phone,
  hospital: user.hospital || "",
  urgency: user.urgency || "Normal",
  units: Number(user.units) || 1,
  neededDate: user.neededDate || "",
  note: user.note || "",
  verified: Boolean(user.verified),
  consent: Boolean(user.consent),
});

const migrate = async () => {
  const connected = await connectDB();
  if (!connected) throw new Error("Migration stopped because MongoDB is unavailable.");

  const users = await User.find().select("+passwordHash").lean();
  const summary = { found: users.length, migrated: 0, skipped: 0, failed: 0 };

  for (const user of users) {
    try {
      if (!user.phone || !user.passwordHash) {
        summary.skipped += 1;
        console.warn(`Skipped ${user._id}: phone or password hash is missing.`);
        continue;
      }

      if (![ROLES.DONOR, ROLES.REQUESTER].includes(user.role)) {
        summary.skipped += 1;
        console.warn(`Skipped ${user._id}: unsupported role ${user.role}.`);
        continue;
      }

      await AuthAccount.updateOne(
        { _id: user._id },
        {
          $set: {
            phone: user.phone,
            role: user.role,
            passwordHash: user.passwordHash,
            passwordUpdatedAt: user.auth?.passwordUpdatedAt || user.updatedAt || new Date(),
          },
          $setOnInsert: {
            createdAt: user.createdAt || new Date(),
          },
        },
        { upsert: true }
      );

      const ProfileModel = user.role === ROLES.DONOR ? Donor : Requester;
      const data = user.role === ROLES.DONOR ? donorData(user) : requesterData(user);
      const profile = await ProfileModel.findOneAndUpdate(
        { accountId: user._id },
        { $set: data, $setOnInsert: { createdAt: user.createdAt || new Date() } },
        { upsert: true, returnDocument: "after", runValidators: true }
      );

      const registrationResult = await mongoose.connection
        .collection("registrationhistories")
        .updateMany(
        { userId: user._id },
        {
          $set: {
            accountId: user._id,
            profileId: profile._id,
            profileCollection: user.role === ROLES.DONOR ? "donors" : "requesters",
            passwordStored: true,
            passwordStorage: "bcrypt hash in loginaccounts collection",
          },
          $unset: { userId: "" },
        }
        );

      const existingRegistration = await mongoose.connection
        .collection("registrationhistories")
        .findOne({ accountId: user._id });

      if (registrationResult.matchedCount === 0 && !existingRegistration) {
        await mongoose.connection.collection("registrationhistories").insertOne({
          accountId: user._id,
          profileId: profile._id,
          profileCollection: user.role === ROLES.DONOR ? "donors" : "requesters",
          role: user.role,
          phone: user.phone,
          fullName: user.fullName || user.requesterName || "",
          requesterName: user.requesterName || "",
          patientName: user.patientName || "",
          city: user.city || "",
          bloodGroup: validBloodGroup(user.bloodGroup),
          passwordStored: true,
          passwordStorage: "bcrypt hash in loginaccounts collection",
          source: "legacy-migration",
          createdAt: user.createdAt || new Date(),
          updatedAt: new Date(),
        });
      }

      await mongoose.connection.collection("loginhistories").updateMany(
        { userId: user._id },
        [
          {
            $set: {
              accountId: user._id,
              passwordVerified: { $eq: ["$status", "success"] },
            },
          },
          { $unset: "userId" },
        ]
      );

      summary.migrated += 1;
    } catch (error) {
      summary.failed += 1;
      console.error(`Failed ${user._id}: ${error.message}`);
    }
  }

  console.log("Migration summary:", summary);
  console.log("Legacy users collection was preserved as a safety backup.");

  if (summary.failed > 0) process.exitCode = 1;
};

migrate()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
