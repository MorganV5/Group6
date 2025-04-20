const allAreas = require("../models/areas");

exports.getAreas = async (req, res) => {
  try {

    const areas = await allAreas.allAreas();

    res.status(201).json(areas);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Unable to retrieve freqs"});
  }
};