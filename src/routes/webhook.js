const express = require('express');
const router = express.Router();
const { sendMessage } = require('../services/whatsapp');
const { getOrCreateUser, getState } = require('../db/stateManager');
const { startCvFlow, handleCvFlowMessage } = require('../services/cvFlow');
const { isPaidUser, UPGRADE_MESSAGE } = require('../services/accessControl');

router.post('/webhook', async (req, res) => {
  const result = req.body.results?.[0];
  const from = result?.from;
  const text = result?.message?.text;

  if (from && text) {
    console.log(`Message from ${from}: ${text}`);

    const user = await getOrCreateUser(from);
    if (!user) {
      res.sendStatus(200);
      return;
    }

    const state = await getState(user.id);
    console.log(`User ${from} is currently on stage: ${state.stage}`);

    if (state.stage === 'idle' && /cv/i.test(text)) {
      const paid = await isPaidUser(user.id);
      if (!paid) {
        await sendMessage(from, UPGRADE_MESSAGE);
      } else {
        await startCvFlow(user);
      }
    } else if (state.stage === 'cv_flow') {
      await handleCvFlowMessage(user, state, text);
    } else {
      await sendMessage(from, `You said: ${text} (stage: ${state.stage})`);
    }
  }

  res.sendStatus(200);
});

module.exports = router;
