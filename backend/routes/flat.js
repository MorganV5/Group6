const express = require("express");
const { createFlat, getFlatByInviteCode } = require("../controllers/handleFlatController");
const verifyToken = require("../middleware/authenticate");

const router = express.Router();

router.post("/create", verifyToken, createFlat);
router.get("/invite/:code", verifyToken, getFlatByInviteCode);

module.exports = router;
