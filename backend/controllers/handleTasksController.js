const task = require("../models/task");

// create a new task
exports.createTask = async (req, res) => {
  try {

    // all values from the post body
    const {name, description, due_date, repeat_frequency, area, assigned_to_id} = req.body;
    
    // get user ID from token (set by middleware)
    const creator_id = req.user.user_id;
    // get f;at ID from token
    const flat_id = req.user.flat_id;

    if (flat_id === null) {
      return res.status(400).json({error: "Join a flat to create tasks."});
    }

    // create new task for the flat
    await task.createTask({
      name,
      description,
      due_date,
      repeat_frequency,
      area,
      creator_id,
      assigned_to_id,
      flat_id,
    });

    
    res.status(201).json({message: "Task created"});
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Unable to create task"});
  }
};

// get all tasks
exports.getTasks = async (req, res) => {
  try {
    const flatId = req.user.flat_id;
    console.log(flatId)
    if (flatId === null) {
      return res.status(400).json({error: "User is not in a flat"});
    }
    // get every task for the users flat
    const tasks = await task.getTasksForFlat(flatId);
    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Please try again"});
  }
};


exports.getUserTasks = async (req, res) => {
  try {
    const userId = req.user.user_id;  
    const flatId = req.user.flat_id;   

    // if the user hasnt been added to flat then return error
    if (!flatId) {
      return res.status(400).json({error: "User is not in a flat"});
    }
    // get every task assigned to them
    const tasks = await task.getTasksForUser(flatId, userId);

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Unable to fetch user's tasks"});
  }
};

exports.assignUserToTask = async (req, res) => {
  try {
    const {taskId} = req.params;
    const {assigned_to_id} = req.body;
    const flatId = req.user.flat_id;

    // see if assigning the task was successful
    const success = await task.assignUserToTask(taskId, assigned_to_id, flatId);

    if (!success) {
      return res.status(404).json({error: "Task not found or not in your flat"});
    }

    res.json({message: "User assigned to task"});
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Unable to assign user to task"});
  }
};

