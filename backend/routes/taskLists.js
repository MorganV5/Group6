const express = require("express");
const { createTask, getTasks } = require("../controllers/handleTasksController");
const verifyToken = require("../middleware/authenticate");

const router = express.Router();

// Protect task routes with JWT authentication
router.post("/createTask", verifyToken, createTask);
router.get("/getTasks", verifyToken, getTasks);

module.exports = router;
