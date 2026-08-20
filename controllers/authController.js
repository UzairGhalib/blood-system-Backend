const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const AuthAccount = require("../models/AuthAccount");
const Donor = require("../models/Donor");
const Requester = require("../models/Requester");
const BloodRequest = require("../models/BloodRequest");
const LoginHistory = require("../models/LoginHistory");
const RegistrationHistory = require("../models/RegistrationHistory");
const asyncHandler = require("../utils/asyncHandler");
const { findProfileByAccount, mapAccountResponse } = require("../utils/accountProfile");
const { ROLES } = require("../utils/constants");
const { sendError, sendSuccess } = require("../utils/response");

const normalizeRole = (role = "") => {
  const value = String(role).toLowerCase().trim();
  if (value === "donar" || value === "donor") return ROLES.DONOR;
  if (value === "requester") return ROLES.REQUESTER;
  return "";
};

const normalizePhone = (phone = "") => {
  const value = String(phone).trim();
  if (!value) return "";
  if (value.startsWith("+")) return `+${value.slice(1).replace(/\D/g, "")}`;
  return value.replace(/\D/g, "");
};

const isDatabaseReady = () => mongoose.connection.readyState === 1;

const createToken = (account) =>
  jwt.sign(
    { id: account._id.toString(), role: account.role, phone: account.phone },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

const setAuthCookie = (res, token) => {
  res.cookie("bloodlinkToken", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const getProfileFields = (body) => ({
  fullName: String(body.fullName || body.name || "").trim(),
  requesterName: String(body.requesterName || body.fullName || body.name || "").trim(),
  patientName: String(body.patientName || "").trim(),
  email: String(body.email || "").trim(),
  bloodGroup: String(body.bloodGroup || "").trim(),
  gender: String(body.gender || "").trim(),
  age: body.age === undefined || body.age === "" ? null : Number(body.age),
  location: String(body.location || "").trim(),
  city: String(body.city || "").trim(),
  fullAddress: String(body.fullAddress || "").trim(),
  whatsapp: normalizePhone(body.whatsapp || ""),
  availability: String(body.availability || "Available").trim(),
  lastDonationDate: String(body.lastDonationDate || "").trim(),
  hospital: String(body.hospital || "").trim(),
  urgency: String(body.urgency || "Normal").trim(),
  units: body.units === undefined || body.units === "" ? 1 : Number(body.units),
  neededDate: String(body.neededDate || "").trim(),
  note: String(body.note || "").trim(),
  medicalStatus: String(body.medicalStatus || "").trim(),
  consent: Boolean(body.consent),
  preferredContactTime: String(body.preferredContactTime || "").trim(),
});

const buildDonorProfile = (account, profile) => ({
  accountId: account._id,
  fullName: profile.fullName,
  phone: account.phone,
  email: profile.email,
  bloodGroup: profile.bloodGroup,
  gender: profile.gender,
  age: profile.age,
  location: profile.location,
  city: profile.city,
  fullAddress: profile.fullAddress,
  whatsapp: profile.whatsapp,
  availability: profile.availability,
  lastDonationDate: profile.lastDonationDate,
  medicalStatus: profile.medicalStatus,
  note: profile.note,
  consent: profile.consent,
  preferences: { preferredContactTime: profile.preferredContactTime },
});

const buildRequesterProfile = (account, profile) => ({
  accountId: account._id,
  requesterName: profile.requesterName,
  patientName: profile.patientName,
  phone: account.phone,
  email: profile.email,
  bloodGroup: profile.bloodGroup,
  location: profile.location,
  city: profile.city,
  fullAddress: profile.fullAddress,
  whatsapp: profile.whatsapp,
  hospital: profile.hospital,
  urgency: profile.urgency,
  units: profile.units,
  neededDate: profile.neededDate,
  note: profile.note,
  consent: profile.consent,
});

const writeLoginHistory = (account, req, values = {}) =>
  LoginHistory.create({
    accountId: account._id,
    role: account.role,
    phone: account.phone,
    status: values.status || "success",
    passwordVerified: Boolean(values.passwordVerified),
    message: values.message || "Login successful",
    ipAddress: req.ip || "unknown",
    userAgent: req.get("user-agent") || "",
  });

const registerUser = asyncHandler(async (req, res) => {
  if (!isDatabaseReady()) {
    return sendError(res, "MongoDB is not connected. Set MONGO_URI to enable registration.", 503);
  }

  const role = normalizeRole(req.body.role);
  const phone = normalizePhone(req.body.phone);
  const password = typeof req.body.password === "string" ? req.body.password : "";

  if (!role) return sendError(res, "Valid role is required.", 400);
  if (!phone) return sendError(res, "Phone number is required.", 400);
  if (password.length < 6) return sendError(res, "Password must be at least 6 characters.", 400);

  if (await AuthAccount.exists({ phone })) {
    return sendError(res, "A user with this phone number already exists.", 409);
  }

  const profileFields = getProfileFields(req.body);
  const passwordHash = await bcrypt.hash(password, 10);
  const session = await mongoose.startSession();
  let account;
  let profile;

  try {
    await session.withTransaction(async () => {
      [account] = await AuthAccount.create(
        [{ phone, role, passwordHash, passwordUpdatedAt: new Date() }],
        { session }
      );

      if (role === ROLES.DONOR) {
        [profile] = await Donor.create([buildDonorProfile(account, profileFields)], { session });
      } else {
        [profile] = await Requester.create([buildRequesterProfile(account, profileFields)], { session });

        await BloodRequest.create(
          [{
            requesterId: account._id,
            requesterName: profile.requesterName,
            patientName: profile.patientName,
            bloodGroup: profile.bloodGroup,
            units: profile.units,
            urgency: profile.urgency,
            status: "Open",
            hospital: profile.hospital,
            location: profile.location,
            city: profile.city,
            fullAddress: profile.fullAddress,
            phone: account.phone,
            whatsapp: profile.whatsapp,
            neededDate: profile.neededDate,
            note: profile.note,
            meta: { source: "registration" },
          }],
          { session }
        );
      }

      await RegistrationHistory.create(
        [{
          accountId: account._id,
          profileId: profile._id,
          profileCollection: role === ROLES.DONOR ? "donors" : "requesters",
          role,
          phone,
          fullName: profile.fullName || profile.requesterName || "",
          requesterName: profile.requesterName || "",
          patientName: profile.patientName || "",
          city: profile.city || "",
          bloodGroup: profile.bloodGroup || "",
          passwordStored: true,
          passwordStorage: "bcrypt hash in loginaccounts collection",
          source: "web",
        }],
        { session }
      );

      await LoginHistory.create(
        [{
          accountId: account._id,
          role,
          phone,
          status: "success",
          passwordVerified: true,
          message: "Registration and first login",
          ipAddress: req.ip || "unknown",
          userAgent: req.get("user-agent") || "",
        }],
        { session }
      );
    });
  } finally {
    await session.endSession();
  }

  const token = createToken(account);
  setAuthCookie(res, token);

  return sendSuccess(
    res,
    { token, user: mapAccountResponse(account, profile) },
    "Registration successful",
    201
  );
});

const loginUser = asyncHandler(async (req, res) => {
  if (!isDatabaseReady()) return sendError(res, "MongoDB is not connected.", 503);

  const phone = normalizePhone(req.body.phone);
  const password = typeof req.body.password === "string" ? req.body.password : "";
  const role = normalizeRole(req.body.role);

  if (!phone) return sendError(res, "Phone number is required.", 400);
  if (!password) return sendError(res, "Password is required.", 400);

  const account = await AuthAccount.findOne({ phone }).select("+passwordHash");
  if (!account) return sendError(res, "Invalid login credentials.", 401);

  if (role && account.role !== role) {
    await writeLoginHistory(account, req, {
      status: "failed",
      passwordVerified: false,
      message: "Account role mismatch",
    });
    return sendError(res, "Account role does not match this login.", 403);
  }

  const passwordVerified = await bcrypt.compare(password, account.passwordHash);
  if (!passwordVerified) {
    await writeLoginHistory(account, req, {
      status: "failed",
      passwordVerified: false,
      message: "Invalid password",
    });
    return sendError(res, "Invalid login credentials.", 401);
  }

  const profile = await findProfileByAccount(account);
  if (!profile) return sendError(res, "Account profile is missing. Run the database migration.", 409);

  await writeLoginHistory(account, req, {
    status: "success",
    passwordVerified: true,
    message: "Login successful",
  });

  const token = createToken(account);
  setAuthCookie(res, token);
  return sendSuccess(res, { token, user: mapAccountResponse(account, profile) }, "Login successful");
});

const getCurrentUser = asyncHandler(async (req, res) => {
  if (!isDatabaseReady()) return sendError(res, "MongoDB is not connected.", 503);

  const account = await AuthAccount.findById(req.user.id);
  if (!account) return sendError(res, "Account not found.", 404);

  const profile = await findProfileByAccount(account);
  if (!profile) return sendError(res, "Account profile not found.", 404);

  return sendSuccess(res, { user: mapAccountResponse(account, profile) }, "Current user loaded");
});

const logoutUser = asyncHandler(async (req, res) => {
  res.clearCookie("bloodlinkToken");
  return sendSuccess(res, null, "Logged out successfully");
});

module.exports = { getCurrentUser, loginUser, logoutUser, registerUser };
