const express = require("express");
const {registerUser, loginUser, getallUsers} = require("../controllers/handleUserController");
const verifyToken = require("../middleware/authenticate");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/allUsers", verifyToken, getallUsers);


module.exports = router;
