const db = require("../utils/db");

const allFrequencies = async () => {

  const freqs = await db.query("select * from task_frequency;");

  return freqs[0]
};

module.exports = {
    allFrequencies
  };