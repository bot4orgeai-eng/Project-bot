/// Handles Opay payment creation, webhook verification, and DB updates

const crypto = require('crypto');
const supabase = require('../db/supabase');

const SECRET_KEY = process.env.OPAY_SECRET_KEY;

// Creates a pending payment record and returns the reference to send to Opay
async function createPendingPayment(userId, amount) {
  const reference = crypto.randomUUID();

  const { error } = await supabase
    .from('payments')
    .insert({
      user_id: userId,
      amount: amount,
      status: 'pending',
      provider_reference: reference
    });

  if (error) {
    console.error('Error creating pending payment:', error.message);
    return null;
  }

  return reference;
}

// Verifies an incoming Opay webhook's signature against our secret key
function verifySignature(payload, receivedSha512) {
  const refundedFlag = payload.refunded ? 't' : 'f';

  const signContent = `{Amount:"${payload.amount}",Currency:"${payload.currency}",Reference:"${payload.reference}",Refunded:${refundedFlag},Status:"${payload.status}",Timestamp:"${payload.timestamp}",Token:"${payload.token}",TransactionID:"${payload.transactionId}"}`;

  const expectedSignature = crypto
    .createHmac('sha3-512', SECRET_KEY)
    .update(signContent)
    .digest('hex');

  return expectedSignature.toLowerCase() === receivedSha512.toLowerCase();
}

// Handles a verified webhook: updates the payment row and flags the user as paid
async function handleWebhook(body) {
  const { payload, sha512 } = body;

  const isValid = verifySignature(payload, sha512);
  if (!isValid) {
    console.error('Invalid Opay webhook signature — ignoring.');
    return false;
  }

  const { data: payment, error: findError } = await supabase
    .from('payments')
    .select('*')
    .eq('provider_reference', payload.reference)
    .single();

  if (findError || !payment) {
    console.error('No matching payment found for reference:', payload.reference);
    return false;
  }

  await supabase
    .from('payments')
    .update({ status: payload.status })
    .eq('provider_reference', payload.reference);

  if (payload.status === 'SUCCESS') {
    await supabase
      .from('users')
      .update({ tier: 'paid' })
      .eq('id', payment.user_id);
  }

  return true;
}

module.exports = { createPendingPayment, verifySignature, handleWebhook };
