const {
  generateMockReply,
} = require("./providers/mockProvider");

const {
  generateGeminiReply,
} = require("./providers/geminiProvider");

const {
  generateGroqReply,
} = require("./providers/groqProvider");

const generateAIReply = async ({
  message,
  history = [],
  workspace = "banking",
  context = {},
}) => {
  const provider = (
    process.env.AI_PROVIDER || "mock"
  ).toLowerCase();

  try {
    switch (provider) {
      case "groq":
        return await generateGroqReply({
          message,
          history,
          workspace,
          context,
        });

      case "gemini":
        return await generateGeminiReply({
          message,
          history,
          workspace,
          context,
        });

      case "mock":
        return await generateMockReply({
          message,
          workspace,
          context,
        });

      default:
        return await generateMockReply({
          message,
          workspace,
          context,
        });
    }
  } catch (error) {
    console.error(
      `${provider} provider failed. Switching to mock:`,
      error.message
    );

    return await generateMockReply({
      message,
      workspace,
      context,
    });
  }
};

module.exports = {
  generateAIReply,
};