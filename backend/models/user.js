const db = require("../utils/db");

const getUserByEmail = async (email) => {
  const [user] = await db.query("SELECT id, email, password, flat_id FROM users WHERE email = ?", [email]);
  return user;
};

const createUser = async ({name, email, password}) => {
  const sql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
  await db.query(sql, [name, email, password]);
};

const getUserById = async (id) => {
  const [user] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
  return user;
};

const assignUserToFlat = async (userId, flatId) => {
  await db.query("UPDATE users SET flat_id = ? WHERE id = ?", [flatId, userId]);
};

module.exports = {
  getUserByEmail,
  createUser,
  getUserById,
  assignUserToFlat,
};
