const router = require("express").Router();
const { body } = require("express-validator");

const {
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
} = require("../controllers/authController");
const { requireAuth } = require("../middleware/auth");
const validateRequest = require("../middleware/validationMiddleware");

const phoneRule = body("phone")
  .trim()
  .notEmpty()
  .withMessage("Phone number is required.")
  .bail()
  .custom((value) => {
    const digitCount = String(value).replace(/\D/g, "").length;

    if (digitCount < 8 || digitCount > 15) {
      throw new Error("Phone number must contain 8 to 15 digits.");
    }

    return true;
  });

const passwordRule = body("password")
  .isString()
  .withMessage("Password is required.")
  .bail()
  .isLength({ min: 6 })
  .withMessage("Password must be at least 6 characters.")
  .isLength({ max: 128 })
  .withMessage("Password must not exceed 128 characters.");

router.post(
  "/register",
  [
    body("role").trim().notEmpty().withMessage("Role is required."),
    phoneRule,
    passwordRule,
    validateRequest,
  ],
  registerUser
);

router.post(
  "/login",
  [phoneRule, passwordRule, validateRequest],
  loginUser
);

router.get("/me", requireAuth, getCurrentUser);

router.post("/logout", logoutUser);

router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Auth routes ready",
    endpoints: ["/register", "/login", "/me", "/logout"],
  });
});

module.exports = router;
