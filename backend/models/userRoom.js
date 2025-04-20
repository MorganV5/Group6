const db = require("../utils/db");

const assignUserToRoom = async ({user_id, room_id}) => {
  await db.query("INSERT INTO user_rooms (user_id, room_id) VALUES (?, ?)", [user_id, room_id]);
};

const getUserRooms = async (userId) => {
  const [rooms] = await db.query("SELECT * FROM user_rooms WHERE user_id = ?", [userId]);
  return rooms;
};

module.exports = {
  assignUserToRoom,
  getUserRooms,
};
