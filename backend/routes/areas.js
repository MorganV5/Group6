const express = require("express");
const {getAreas} = require("../controllers/handleAreasController");
const verifyToken = require("../middleware/authenticate");

const router = express.Router();

router.get("/areas", verifyToken, getAreas);

module.exports = router;
