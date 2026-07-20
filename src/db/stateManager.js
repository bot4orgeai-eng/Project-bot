const supabase = require('./supabase');

async function getOrCreateUser(phoneNumber) {
  let { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone_number', phoneNumber)
    .single();

  if (user) return user;

  const { data: newUser, error: insertError } = await supabase
    .from('users')
    .insert({ phone_number: phoneNumber })
    .select()
    .single();

  if (insertError) {
    console.error('Error creating user:', insertError.message);
    return null;
  }

  await supabase
    .from('conversation_state')
    .insert({ user_id: newUser.id, stage: 'idle', data: {} });

  return newUser;
}

async function getState(userId) {
  const { data, error } = await supabase
    .from('conversation_state')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching state:', error.message);
    return null;
  }
  return data;
}

async function setState(userId, stage, data = {}) {
  const { error } = await supabase
    .from('conversation_state')
    .update({ stage, data, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating state:', error.message);
  }
}

module.exports = { getOrCreateUser, getState, setState };