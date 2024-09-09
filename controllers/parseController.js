const fs = require("fs");
const path = require("path");
const textParser = require("../models/textParser");
const axios = require('axios');

function flattenStructure(data, parentKey = '') {
  let result = [];
  let lastAlphabetKey = null;

  data.forEach(item => {
    const currentKey = parentKey ? `${parentKey}.${item.key}` : item.key;

    result.push({ clause: currentKey, section: item.text });

    if (item.key.match(/^[a-zA-Z]$/)) {
      lastAlphabetKey = currentKey;
    }

    if (item.subpoints && item.subpoints.length > 0) {
      result = result.concat(flattenStructure(item.subpoints, currentKey));
    }

    if (item.romans && item.romans.length > 0 && lastAlphabetKey === currentKey) {
      result = result.concat(flattenStructure(item.romans, currentKey));
    }
  });

  return result;
}

exports.parseText = async (req, res) => {
  const inputText = req.body;
  if (!inputText) {
    return res.status(400).json({ error: "No text provided" });
  }

  try {
    let parsedData;
    try {
      parsedData = JSON.parse(inputText);
    } catch (jsonError) {
      parsedData = textParser.parseTextToMap(inputText);
    }

    if (!Array.isArray(parsedData)) {
      throw new Error("Parsed data is not in the expected format (array)");
    }

    const flattenedData = flattenStructure(parsedData);

    const sendPromises = flattenedData.map(async ({ clause, section }) => {
      return await axios.post('http://localhost:3002/addData', { clause, section });
    });

    await Promise.all(sendPromises);

    res.json(parsedData);
  } catch (error) {
    console.error("Error in parseText:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

exports.parseFromFile = (req, res) => {
  const filePath = path.join(__dirname, "../public", "text.txt");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      return res.status(500).json({ error: "Failed to read file" });
    }

    try {
      let parsedData;
      try {
        parsedData = JSON.parse(data);
      } catch (jsonError) {
        parsedData = textParser.parseTextToMap(data);
      }

      if (!Array.isArray(parsedData)) {
        throw new Error("Parsed data is not in the expected format (array)");
      }

      const flattenedData = flattenStructure(parsedData);
      res.json(flattenedData);
    } catch (error) {
      console.error("Error in parseFromFile:", error);
      res.status(500).json({ error: error.message, stack: error.stack });
    }
  });
};