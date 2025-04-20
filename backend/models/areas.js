const db = require("../utils/db");

const allAreas = async () => {
  const areas = await db.query("select distinct(name) from areas;");

  return areas[0]
};

module.exports = {
  allAreas
};