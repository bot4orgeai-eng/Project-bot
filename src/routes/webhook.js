// Receives incoming WhatsApp messages// This file listens for incoming WhatsApp messages forwarded by Infobip
const express = require('express');
const router = express.Router();

// NEW: import the sendMessage function so we can reply
const { sendMessage } = require('../services/whatsapp');

// This function runs every time Infobip sends a POST request to /webhook
router.post('/', (req, res) => {
  // req.body contains the actual message data Infobip sent us
  console.log('Incoming WhatsApp payload:', JSON.stringify(req.body, null, 2));

  // NEW: pull out the sender's number and message text, then echo it back
  const incoming = req.body.results?.[0];
  if (incoming && incoming.message?.type === 'TEXT') {
    const from = incoming.from;
    const text = incoming.message.text;
    sendMessage(from, text); // echoes the same text back to the sender
  }

  // We MUST respond quickly, or Infobip will think delivery failed and retry
  res.sendStatus(200);
});

module.exports = router;