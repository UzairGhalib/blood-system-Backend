const router = require("express").Router();

const {
  createBloodRequest,
  listBloodRequests,
} = require("../controllers/bloodRequestController");
const { requireAuth, requireRole } = require("../middleware/auth");

router.get("/", listBloodRequests);
router.post("/", requireAuth, requireRole("requester"), createBloodRequest);

module.exports = router;
