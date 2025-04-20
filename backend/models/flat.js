const db = require("../utils/db");

const createFlat = async (name, invite_code) => {
  console.log(name, invite_code)
  await db.query("INSERT INTO flat (name, invite_code) VALUES (?, ?);", [name, invite_code]);
  flatID = await getFlatFromInviteCode(invite_code)
  return flatID;
};

const getFlatFromInviteCode = async (code) => {
  const [flat] = await db.query("SELECT * FROM flat WHERE invite_code = ?;", [code]);
  return flat;
};

const getFlatCodeByUserId = async (userId) => {
  const invite_code = await db.execute(`
    SELECT f.invite_code
    FROM users u
    JOIN flat f ON u.flat_id = f.id
    WHERE u.id = ?
  `, [userId]);

  return invite_code[0]
};


const getUsersByFlatId = async (flatId) => {
  const [userVals] = await db.execute(
    'SELECT id, name, profile_picture, about_me FROM users WHERE flat_id = ?',
    [flatId]
  );
  return userVals;
};


module.exports = {
  createFlat,
  getFlatFromInviteCode,
  getFlatCodeByUserId,
  getUsersByFlatId
};
