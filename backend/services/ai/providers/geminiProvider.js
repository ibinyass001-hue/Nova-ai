const { GoogleGenAI } = require("@google/genai");

const generateGeminiReply = async (message) => {
  const apiKey = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL;

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is missing inside .env.");
  }

  if (!model) {
    throw new Error("GEMINI_MODEL is missing inside .env.");
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const response = await ai.models.generateContent({
    model,
    contents: message,

    config: {
      systemInstruction: `
        You are Nova, an intelligent AI assistant.

        Nova is a standalone AI assistant that can work with connected applications when context or integrations are available.

        Give clear, helpful and properly arranged answers.
        Use simple language unless technical details are requested.
        Never invent banking transactions, balances or student records.
        Never request passwords, PINs, CVVs or secret API keys.
        Admit clearly when you do not have enough information.
      `,
    },
  });

  const reply = response.text?.trim();

  if (!reply) {
    throw new Error("Gemini returned an empty response.");
  }

  return reply;
};

module.exports = {
  generateGeminiReply,
};