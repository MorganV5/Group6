const express = require("express");
const {logProgress, getProgressForTask} = require("../controllers/handleProgressTaskController");
const verifyToken = require("../middleware/authenticate");

const router = express.Router();

router.post("/log", verifyToken, logProgress);
router.get("/task/:taskId", verifyToken, getProgressForTask);

module.exports = router;
