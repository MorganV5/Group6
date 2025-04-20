const express = require("express");
const {assignUserToRoom, getUserRooms, getallUsers} = require("../controllers/handleUserRoomController");
const verifyToken = require("../middleware/authenticate");

const router = express.Router();

router.post("/assign", verifyToken, assignUserToRoom);
router.get("/my", verifyToken, getUserRooms);


module.exports = router;
