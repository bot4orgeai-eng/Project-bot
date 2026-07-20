const supabase = require('../db/supabase');

async function isPaidUser(userId) {
  const { data, error } = await supabase
    .from('users')
    .select('tier')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error checking tier:', error.message);
    return false;
  }

  return data.tier === 'paid';
}

const UPGRADE_MESSAGE =
  "This feature is part of our Premium plan. Reply 'upgrade' to unlock CVs, cover letters, interview prep, and quizzes.";

module.exports = { isPaidUser, UPGRADE_MESSAGE };
