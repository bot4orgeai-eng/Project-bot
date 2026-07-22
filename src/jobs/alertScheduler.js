// node// node-cron job alert scheduler

const cron = require('node-cron');
const { searchJobs } = require('../services/jobBoard');
const { sendMessage } = require('../services/whatsapp');
const { getUsersWithAlertKeyword } = require('../db/stateManager');

async function checkAndSendAlerts() {
  console.log('Running scheduled job alert check...');

  const users = await getUsersWithAlertKeyword();

  for (const user of users) {
    const matches = await searchJobs(user.alert_keyword);

    if (matches.length === 0) continue;

    const topMatch = matches[0];
    const message = `New job matching "${user.alert_keyword}": ${topMatch.title}\n${topMatch.url}`;

    await sendMessage(user.phone_number, message);
  }
}

// Runs every hour, on the hour
cron.schedule('0 * * * *', checkAndSendAlerts);

module.exports = { checkAndSendAlerts }
