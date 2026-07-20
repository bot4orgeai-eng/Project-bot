// Handles Groq API calls (CV, cover letter, quiz, prep)
const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function generateCV(answers) {
  const prompt = `
You are a professional CV writer. Using the details below, write a clean,
well-formatted CV in plain text (no markdown symbols like ** or #).
Use clear section headers in capital letters (SUMMARY, EXPERIENCE, EDUCATION, SKILLS).

Full Name: ${answers.fullName}
Target Job Title: ${answers.jobTitle}
Recent Experience: ${answers.experience}
Education: ${answers.education}
Skills: ${answers.skills}

Write a short professional summary, then format the rest into sections.
Keep it concise enough to send over WhatsApp (under 1500 characters).
`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.5,
    max_tokens: 800
  });

  return completion.choices[0].message.content;
}

async function generateInterviewPrep(role) {
  const prompt = `
Give 5 concise, practical interview tips for someone interviewing for a
"${role}" role. Return them as a numbered plain-text list, no markdown symbols.
Keep the whole response under 1000 characters for WhatsApp.
`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.6,
    max_tokens: 500
  });

  return completion.choices[0].message.content;
}

async function generateQuiz(role) {
  const prompt = `
Create a 5-question multiple choice quiz to help someone prepare for a
"${role}" job interview. Respond with ONLY valid JSON, no other text,
no markdown code fences, in exactly this shape:

{
  "questions": [
    {
      "question": "string",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": "A"
    }
  ]
}
`;

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.4,
    max_tokens: 900
  });

  const raw = completion.choices[0].message.content;
  const cleaned = raw.replace(/```json|```/g, '').trim();

  try {
    return JSON.parse(cleaned);
  } catch (err) {
    console.error('Failed to parse quiz JSON:', err.message);
    console.error('Raw response was:', raw);
    return null;
  }
}

function formatQuizForWhatsApp(quiz) {
  if (!quiz || !quiz.questions) return "Sorry, I couldn't generate a quiz right now.";

  let text = "Here's your practice quiz:\n\n";
  quiz.questions.forEach((q, i) => {
    text += `${i + 1}. ${q.question}\n`;
    q.options.forEach((opt, j) => {
      text += `   ${String.fromCharCode(65 + j)}) ${opt}\n`;
    });
    text += '\n';
  });
  return text;
}

module.exports = { generateCV, generateInterviewPrep, generateQuiz, formatQuizForWhatsApp };
