const userroom = require("../models/userRoom");

exports.assignUserToRoom = async (req, res) => {
  try {
    const {user_id, room_id} = req.body;
    await userroom.assignUserToRoom({user_id, room_id});
    res.status(201).json({message: "User assigned to room"});
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Unable to assign user to room"});
  }
};

exports.getUserRooms = async (req, res) => {
  try {
    const {userId} = req.params;
    const rooms = await userroom.getUserRooms(userId);
    res.json(rooms);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Unable to retrieve user rooms"});
  }
};
