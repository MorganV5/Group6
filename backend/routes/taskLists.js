const express = require("express");
const {createTask, getTasks, getUserTasks, assignUserToTask, updateTask, getTaskById, deleteTask} = require("../controllers/handleTasksController");
const verifyToken = require("../middleware/authenticate");

const router = express.Router();

router.post("/createTask", verifyToken, createTask);
router.get("/getTasks", verifyToken, getTasks);
router.get("/:userid", verifyToken, getUserTasks); 
router.post("/assign/:taskId", verifyToken, assignUserToTask);
router.post('/update/:id', verifyToken, updateTask);
router.get('/getTask/:id', verifyToken, getTaskById);
router.delete('/delete/:id', verifyToken, deleteTask);




module.exports = router;
