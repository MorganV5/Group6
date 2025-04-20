const db = require("../utils/db");

const getUserByEmail = async (email) => {
  console.log(email)
  const [user] = await db.query("SELECT id, email, password, flat_id, name FROM users WHERE email = ?", [email]);
  return user;
};

const createUser = async ({name, email, password, flat_id, phone, about_me, profile_picture}) => {
  const sql = `
    INSERT INTO users 
      (name, email, password, flat_id, phone, about_me, profile_picture)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [name, email, password, flat_id, phone || null, about_me || null, profile_picture || null];

  return await db.query(sql, values);
};


const getUserById = async (id) => {
  const [user] = await db.query("SELECT * FROM users WHERE id = ?", [id]);
  return user;
};

const assignUserToFlat = async (userId, flatId) => {

  await db.query("UPDATE users SET flat_id = ? WHERE id = ?", [flatId, userId]);
};


const getallUsers = async (flatId) => {
  const [users] = await db.query(
    "SELECT id, name, email FROM users WHERE flat_id = ?",
    [flatId]
  );
  return users;
};



module.exports = {
  getUserByEmail,
  createUser,
  getUserById,
  assignUserToFlat,
  getallUsers
};
