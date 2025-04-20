const express = require("express");
const {getFrequencies} = require("../controllers/handleFrequenciesController");
const verifyToken = require("../middleware/authenticate");

const router = express.Router();

router.get("/frequency", verifyToken, getFrequencies);

module.exports = router;
