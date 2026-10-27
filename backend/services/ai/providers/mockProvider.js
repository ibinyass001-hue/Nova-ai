const generateMockReply = async (message) => {
  return `Hello! I'm Nova.

You said:

"${message}"

My AI provider isn't available at the moment, so this is my mock response.

Once Gemini is connected, you'll receive real AI responses.`;
};

module.exports = {
  generateMockReply,
};