const router = require("express").Router();

const { listDonors } = require("../controllers/donorController");
router.get("/", listDonors);

module.exports = router;
