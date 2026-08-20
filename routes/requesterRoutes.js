const router = require("express").Router();

const { listRequesterRequests } = require("../controllers/requesterController");
router.get("/", listRequesterRequests);

module.exports = router;
