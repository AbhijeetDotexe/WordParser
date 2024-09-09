const express = require("express");
const router = express.Router();
const parseController = require("../controllers/parseController");

router.post("/parse", parseController.parseText);
router.get("/parse", parseController.parseFromFile);

module.exports = router;
