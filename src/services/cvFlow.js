const { setState } = require('../db/stateManager');
const { sendMessage } = require('./whatsapp');
const { generateCV } = require('./groq');
const supabase = require('../db/supabase');

const QUESTIONS = [
  { key: 'fullName', prompt: "Let's build your CV. What's your full name?" },
  { key: 'jobTitle', prompt: "What job title are you applying for?" },
  { key: 'experience', prompt: "Briefly describe your most recent work experience." },
  { key: 'education', prompt: "What's your highest level of education?" },
  { key: 'skills', prompt: "List your top 5 skills, separated by commas." }
];

async function startCvFlow(user) {
  await setState(user.id, 'cv_flow', { step: 0, answers: {} });
  await sendMessage(user.phone_number, QUESTIONS[0].prompt);
}

async function handleCvFlowMessage(user, state, text) {
  const step = state.data.step;
  const answers = state.data.answers;

  const currentQuestion = QUESTIONS[step];
  answers[currentQuestion.key] = text;

  const nextStep = step + 1;

  if (nextStep < QUESTIONS.length) {
    await setState(user.id, 'cv_flow', { step: nextStep, answers });
    await sendMessage(user.phone_number, QUESTIONS[nextStep].prompt);
  } else {
    await setState(user.id, 'cv_ready', { answers });
    await sendMessage(
      user.phone_number,
      "Got everything I need! Generating your CV now, one moment..."
    );

    const cvText = await generateCV(answers);

    await supabase.from('cvs').insert({ user_id: user.id, cv_text: cvText });
    await sendMessage(user.phone_number, cvText);
  }
}

module.exports = { startCvFlow, handleCvFlowMessage, QUESTIONS };

