import axios from 'axios';
// import Prompt from './prompts/geminiPrompt.js';

export async function sendToGemini(prompt) {
  const response = await axios.post(
    'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    {
      contents: [
        {
          parts: [
            {
              text: prompt,
            },
          ],
        },
      ],
    },
    {
      headers: {
        'x-goog-api-key': import.meta.env.VITE_GEMINI_API_KEY,
      },
    }
  );
  return response.data;
}
