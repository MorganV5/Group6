const express = require("express");
const {createRoom, getRoomsByFlatId} = require("../controllers/handleRoomController");
const verifyToken = require("../middleware/authenticate");

const router = express.Router();

router.post("/create", verifyToken, createRoom);
router.get("/my", verifyToken, getRoomsByFlatId);

module.exports = router;
