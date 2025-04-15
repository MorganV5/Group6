const db = require("../utils/db");

const logProgress = async ({task_id, user_id, status_id, completion_date, completion_time, comment}) => {
  // had to use ` for multiple lines
  await db.query(`
    INSERT INTO progress_tasks (task_id, user_id, status_id, completion_date, completion_time, comment) VALUES (?, ?, ?, ?, ?, ?)
  `, [task_id, user_id, status_id, completion_date, completion_time, comment]);
};

const getProgressForTask = async (taskId) => {
  const [progress] = await db.query("SELECT * FROM progress_tasks WHERE task_id = ?", [taskId]);
  return progress;
};

module.exports = {
  logProgress,
  getProgressForTask,
};
