const db = require("../utils/db");

const createFlat = async ({name, invite_code}) => {
  await db.query("INSERT INTO flat (name, invite_code) VALUES (?, ?)", [name, invite_code]);
};

const getFlatFromInviteCode = async (code) => {
  const [flat] = await db.query("SELECT * FROM flat WHERE invite_code = ?", [code]);
  return flat;
};

module.exports = {
  createFlat,
  getFlatFromInviteCode,
};
