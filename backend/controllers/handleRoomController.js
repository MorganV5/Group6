const room = require("../models/room");

exports.createRoom = async (req, res) => {
  try {
    const {flat_id, name, room_number} = req.body;
    await room.createRoom({flat_id, name, room_number});
    res.status(201).json({message: "Room created"});
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Unable to create room"});
  }
};

exports.getRoomsByFlatId = async (req, res) => {
  try {
    const { flatId } = req.params;
    const rooms = await room.getRoomsByFlatId(flatId);
    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Unable to retrieve rooms"});
  }
};

