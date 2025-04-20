const allFreqs = require("../models/frequencies");

exports.getFrequencies = async (req, res) => {
  try {

    const frequencies = await allFreqs.allFrequencies();

    res.status(201).json(frequencies);
  } catch (error) {
    console.error(error);
    res.status(500).json({error: "Unable to retrieve freqs"});
  }
};