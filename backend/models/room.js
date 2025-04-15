const db = require("../utils/db");

const createRoom = async ({flat_id, name, room_number}) => {
  await db.query("INSERT INTO rooms (flat_id, name, room_number) VALUES (?, ?, ?)", [flat_id, name, room_number]);
};

const getRoomsByFlatId = async (flatId) => {
  const [rooms] = await db.query("SELECT * FROM rooms WHERE flat_id = ?", [flatId]);
  return rooms;
};

module.exports = {
  createRoom,
  getRoomsByFlatId,
};
