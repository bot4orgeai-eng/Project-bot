const express = require('express');
const router = express.Router();
const { handleWebhook } = require('../services/opay');

router.post('/', async (req, res) => {
  const success = await handleWebhook(req.body);

  if (!success) {
    console.error('Opay webhook processing failed or signature invalid.');
  }

  // Always respond 200 — Opay's docs say anything outside 2xx triggers retries for 72 hours
  res.sendStatus(200);
});

module.exports = router;