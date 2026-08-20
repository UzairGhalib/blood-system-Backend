const router = require("express").Router();

const { getMyProfile, updateMyProfile } = require("../controllers/profileController");
const { requireAuth } = require("../middleware/auth");

router.get("/me", requireAuth, getMyProfile);
router.put("/me", requireAuth, updateMyProfile);

module.exports = router;
