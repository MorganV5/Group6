const db = require("../config/db");

// Create a new task
exports.createTask = async (req, res) => {
  try {

    // all values from the post body
    const {name, description, due_date, repeat_frequency, area, assigned_to_id} = req.body;
    console.log(assigned_to_id)
    // get user ID from token set in middleware
    const creator_id = req.user.user_id;

    const insertQuery = "INSERT INTO tasks (name, description, due_date, repeat_frequency, area, creator_id, assigned_to_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
    await db.query(insertQuery, [name, description, due_date, repeat_frequency, area, creator_id, assigned_to_id]);

    res.status(201).json({message: "Task created"});
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Unable to create task"});
  }
};

// get all tasks for user
exports.getTasks = async (req, res) => {
  try {
    console.log(req)
    let userId = req.user.user_id;
    console.log(userId)
    // get all tasks for current user and ones created by them
    const [tasks] = await db.query(
      "SELECT * FROM tasks WHERE creator_id = ? OR assigned_to_id = ?",
      [userId, userId]
    );

    res.json(tasks);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Please try again"});
  }
};
