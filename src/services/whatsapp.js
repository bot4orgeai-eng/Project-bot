// Sends WhatsApp messages via Infobip API
const axios = require('axios');

const BASE_URL = process.env.INFOBIP_BASE_URL; // e.g. https://xxxxx.api.infobip.com
const API_KEY = process.env.INFOBIP_API_KEY;
const SENDER = process.env.INFOBIP_WHATSAPP_SENDER; // your Infobip WhatsApp number

async function sendMessage(to, text) {
  const url = `${BASE_URL}/messages-api/1/messages`;

  try {
    await axios.post(
      url,
      {
        messages: [
          {
            channel: 'WHATSAPP',
            sender: SENDER,
            destinations: [{ to: to }],
            content: {
              body: {
                text: text,
                type: 'TEXT'
              }
            }
          }
        ]
      },
      {
        headers: {
          Authorization: `App ${API_KEY}`,
          'Content-Type': 'application/json',
          Accept: 'application/json'
        }
      }
    );
    console.log(`Sent message to ${to}: ${text}`);
  } catch (error) {
    console.error('Error sending message:', error.response?.data || error.message);
  }
}

module.exports = { sendMessage };
