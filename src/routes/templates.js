const express = require('express');
const { TEMPLATES } = require('../services/templates');

const router = express.Router();

router.get('/', (req, res) => {
  res.json({ templates: TEMPLATES });
});

module.exports = router;

