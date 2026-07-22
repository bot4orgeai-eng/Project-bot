require('dotenv').config();
// Entry point: starts the Express server
require('./jobs/alertScheduler');
const express = require('express');
const app = express();

// NEW: turns incoming JSON request bodies into usable JS objects (req.body)
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).send('WhatsApp Job Assistant server is running.');
});

// NEW: any request to /webhook gets handled by the router in routes/webhook.js
app.use('/webhook', require('./routes/webhook'));

// Opay payment webhook — separate route, separate concern from WhatsApp inbound
app.use('/opay-webhook', require('./routes/opayWebhook'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});