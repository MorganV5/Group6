const express = require("express");
const {createFlat, getFlatByInviteCode, getFlatInfo} = require("../controllers/handleFlatController");
const verifyToken = require("../middleware/authenticate");

const router = express.Router();

router.post("/create", verifyToken, createFlat);
router.get("/invite/:code", verifyToken, getFlatByInviteCode);
router.get('/flat', verifyToken, getFlatInfo); 


module.exports = router;
