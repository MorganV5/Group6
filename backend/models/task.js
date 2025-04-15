const db = require("../utils/db");

const createTask = async (task) => {
  const {name, description, due_date, repeat_frequency, area, creator_id, assigned_to_id, flat_id} = task;
  const sql = `
    INSERT INTO tasks (name, description, due_date, repeat_frequency, area, creator_id, assigned_to_id, flat_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await db.query(sql, [name, description, due_date, repeat_frequency, area, creator_id, assigned_to_id, flat_id]);
};

const getTasksForUser = async (flatId, userId) => {
  const [tasks] = await db.query(
    "SELECT * FROM tasks WHERE flat_id = ? AND assigned_to_id = ?",
    [flatId, userId]
  );
  return tasks;
};

const getTasksForFlat = async (flatId) => {
  const [tasks] = await db.query("SELECT * FROM tasks WHERE flat_id = ?", [flatId]);
  return tasks;
};


const assignUserToTask = async (taskId, assignToId, flatId) => {

  const [existing] = await db.query(
    "SELECT * FROM tasks WHERE id = ? AND flat_id = ?",
    [taskId, flatId]
  );

  if (existing.length === 0) {
    return null; 
  }

  await db.query(
    "UPDATE tasks SET assigned_to_id = ? WHERE id = ?",
    [assignToId, taskId]
  );

  return true;
};


module.exports = {
  createTask,
  getTasksForUser,
  getTasksForFlat,
  assignUserToTask
};