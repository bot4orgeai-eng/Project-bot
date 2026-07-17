// Entry point: starts the Express server

const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.status(200).send('WhatsApp Job Assistant server is running.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});