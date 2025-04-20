const task = require("../models/task");

// create a new task
exports.createTask = async (req, res) => {
  try {
    const {
      name,
      description,
      due_date,
      repeat_frequency,
      area_id,
      assigned_to_id
    } = req.body;

    const {user_id: creator_id, flat_id} = req.user;

    if (!name || !due_date || !area_id) {
      return res.status(400).json({message: "Name, due date, and area are required."});
    }

    // check for duplicate task name in same area for this flat
    const exists = await task.checkExistingTask(name, flat_id, area_id);
    if (exists) {
      return res.status(400).json({
        message: "A task with this name already exists in the selected area"
      });
    }

    await task.createTask({
      name,
      description,
      due_date,
      repeat_frequency,
      area_id,
      creator_id,
      assigned_to_id: assigned_to_id || null,
      flat_id
    });

    res.status(201).json({message: "Task created successfully"});

  } catch (err) {
    console.error("Error creating task:", err);
    res.status(500).json({message: "Server error while creating task"});
  }
};



// get all tasks
exports.getTasks = async (req, res) => {
  try {
    const flatId = req.user.flat_id;

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
    const assigned_to_id = req.body.assigned_to_id;
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

exports.updateTask = async (req, res) => {
  const taskId = req.params.id;
  const updatedTask = req.body;

  try {
    await task.updateTask(taskId, updatedTask);
    res.status(200).json({message: 'Task updated successfully'});
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({message: 'Failed to update task'});
  }
};


exports.getTaskById = async (req, res) => {
  try {
    const taskId = req.params.id;
    const [rows] = await task.getTaskById(taskId);

    if (!rows.length) {
      return res.status(404).json({message: "Task not found"});
    }

    res.json(rows[0]); 
  } catch (err) {
    console.error("Error getting task by ID:", err);
    res.status(500).json({message: "Server error"});
  }
};


exports.updateTask = async (req, res) => {
  const taskId = req.params.id;
  let {description, due_date, repeat_frequency, area_id, assigned_to_id} = req.body;

  try {
    const flatId = await task.getFlatIdForTask(taskId);
    if (!flatId) return res.status(404).json({message: 'Task not found'});

    if (assigned_to_id && isNaN(assigned_to_id)) {
      const userId = await task.getUserIdByNameAndFlat(assigned_to_id, flatId);
      if (!userId) return res.status(400).json({message: 'User not found in this flat'});
      assigned_to_id = userId;
    }

    await task.updateTaskById(taskId, {
      description,
      due_date,
      repeat_frequency,
      area_id,
      assigned_to_id
    });

    res.json({message: 'Task updated successfully'});
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({message: 'Server error'});
  }
};

exports.deleteTask = async (req, res) => {
  const taskId = req.params.id;
  try {
    await task.deleteTaskById(taskId);
    res.status(200).json({message: "Task deleted successfully"});
  } catch (err) {
    console.error("Error deleting task:", err);
    res.status(500).json({message: "Server error while deleting task"});
  }
};