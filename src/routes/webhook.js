// Receives incoming WhatsApp messages
const express = require('express');
const router = express.Router();
const { sendMessage } = require('../services/whatsapp');

router.post('/webhook', async (req, res) => {
  const entry = req.body.entry?.[0];
  const change = entry?.changes?.[0];
  const message = change?.value?.messages?.[0];

  if (message) {
    const from = message.from;        // sender's phone number
    const text = message.text?.body;  // what they typed

    console.log(`Message from ${from}: ${text}`);

    if (text) {
      await sendMessage(from, `You said: ${text}`);
    }
  }

  res.sendStatus(200); // tell WhatsApp "got it, all good"
});

module.exports = router;