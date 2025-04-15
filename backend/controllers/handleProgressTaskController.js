const progresstask = require("../models/ProgressTask");

exports.logProgress = async (req, res) => {
  try {
    const progressData = req.body;
    await progresstask.logProgress(progressData);
    res.status(201).json({message: "Progress logged" });
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Unable to log progress"});
  }
};

exports.getProgressForTask = async (req, res) => {
  try {
    const {taskId} = req.params;
    const progress = await progresstask.getProgressForTask(taskId);
    res.json(progress);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Unable to retrieve progress"});
  }
};
