const express = require("express");
const {createTask, getTasks, getUserTasks, assignUserToTask} = require("../controllers/handleTasksController");
const verifyToken = require("../middleware/authenticate");

const router = express.Router();

// protect task routes with JWT authentication
router.post("/createTask", verifyToken, createTask);
router.get("/getTasks", verifyToken, getTasks);
router.get("/myTasks", verifyToken, getUserTasks); 
router.post("/assign/:taskId", verifyToken, assignUserToTask);

module.exports = router;
