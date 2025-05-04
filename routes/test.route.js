const express = require("express");
const router = express.Router();
const { testAPI } = require("../controllers/test.controller");

// Test route to check if the backend is working
router.get("/", testAPI)



module.exports = router;
