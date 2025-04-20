const db = require("../utils/db");

const createTask = async (task) => {
  const sql = `
    INSERT INTO tasks (name, description, due_date, repeat_frequency, creator_id, assigned_to_id, flat_id)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    task.name,
    task.description,
    task.due_date,
    task.repeat_frequency,
    task.creator_id,
    task.assigned_to_id,
    task.flat_id
  ];
  return db.query(sql, values);
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

  const [existingUser] = await db.query(
    "SELECT * FROM tasks WHERE id = ? AND flat_id = ?",
    [taskId, flatId]
  );

  if (existingUser.length === 0) {
    return null; 
  }

  await db.query(
    "UPDATE tasks SET assigned_to_id = ? WHERE id = ?",
    [assignToId, taskId]
  );

  return true;
};

const updateTask = async (taskId, taskData) => {
  const sql = `
    UPDATE tasks
    SET description = ?, due_date = ?, repeat_frequency = ?, area_id = ?, assigned_to_id = ?
    WHERE id = ?
  `;

  const values = [
    taskData.description,
    taskData.due_date,
    taskData.repeat_frequency,
    taskData.area_id,
    taskData.assigned_to_id || null,
    taskId
  ];

  return await db.query(sql, values);
};

const getTaskById = async (taskId) => {
  const sql = `SELECT * FROM tasks WHERE id = ?`;
  return await db.query(sql, [taskId]);
};


const getFlatIdForTask = async (taskId) => {
  const [flatId] = await db.query('SELECT flat_id FROM tasks WHERE id = ?', [taskId]);
  return flatId[0]?.flat_id || null;
};

const getUserIdByNameAndFlat = async (name, flatId) => {
  const [userId] = await db.query('SELECT id FROM users WHERE name = ? AND flat_id = ?', [name, flatId]);
  return userId[0]?.id || null;
};

const updateTaskById = async (taskId, updates) => {
  const {description, due_date, repeat_frequency, area_id, assigned_to_id} = updates;

  const sql = `
    UPDATE tasks
    SET description = ?, due_date = ?, repeat_frequency = ?, area_id = ?, assigned_to_id = ?
    WHERE id = ?
  `;

  return db.query(sql, [
    description,
    due_date,
    repeat_frequency,
    area_id || null,
    assigned_to_id || null,
    taskId
  ]);
};

const deleteTaskById = async (taskId) => {
  const sql = 'DELETE FROM tasks WHERE id = ?';
  return await db.query(sql, [taskId]);
};

const checkExistingTask = async (name, flat_id, area_id) => {
  const sql = `
    SELECT * FROM tasks
    WHERE name = ? AND flat_id = ? AND area_id = ?
  `;
  const [taskResults] = await db.query(sql, [name, flat_id, area_id]);
  return taskResults.length > 0;
};



module.exports = {
  createTask,
  getTasksForUser,
  getTasksForFlat,
  assignUserToTask,
  updateTask,
  getTaskById,
  getFlatIdForTask,
  getUserIdByNameAndFlat,
  updateTaskById,
  deleteTaskById,
  checkExistingTask
};