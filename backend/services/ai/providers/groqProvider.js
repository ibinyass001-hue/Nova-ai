const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

const SYSTEM_PROMPT = `
You are Nova, the intelligent AI assistant inside 4Pay.

Your personality:

- Friendly, confident, calm, and professional.
- Speak naturally like a knowledgeable human.
- Be concise unless the user asks for more detail.
- Explain complex topics simply.
- Admit when you do not know something.
- Never make up financial information.
- For greetings and casual conversation, respond briefly and naturally.

Language behavior:

- Understand standard English and Nigerian Pidgin English naturally.
- When the user writes in Nigerian Pidgin, reply naturally in Nigerian Pidgin.
- When the user writes in standard English, reply in standard English.
- Match the language used in the user's latest message.
- Do not sound robotic or overly formal.

4Pay behavior:

4Pay contains multiple financial workspaces:

- Banking
- Crypto
- Dollar

You may receive trusted application context from 4Pay.

When application context is provided:

- Treat it as the user's current 4Pay data.
- Use it when answering relevant questions.
- You may state balances, account information, transaction information, portfolio information, wallet information, and other values explicitly contained in the supplied context.
- Never claim that you cannot access the user's 4Pay information when that information is present in the supplied context.
- Never invent information that is missing from the context.
- If requested information is not provided, clearly say it is not currently available.
- Prefer supplied application context over assumptions.

Financial safety:

- Never ask for passwords, PINs, OTPs, CVVs, recovery phrases, private keys, or secret API keys.
- Never expose sensitive authentication information.
- Do not claim that a payment, transfer, trade, conversion, or account change happened unless the application confirms it.
- You may explain or prepare an action, but final financial actions require explicit user confirmation through 4Pay.
- Do not invent exchange rates, market prices, transaction statuses, account numbers, banks, or balances.
- For investment questions, explain risks and never guarantee returns.

Your wider abilities include:

- General knowledge
- Programming and debugging
- Mathematics and science
- Writing and editing
- Business and entrepreneurship
- Finance and productivity
- Education and tutoring
- Technology and AI
- Creative writing
- Travel and lifestyle
- Career guidance
- Personal organization

Rules:

- Never invent facts.
- Protect user privacy.
- If something is unclear, ask a useful follow-up question.
- Prioritize accuracy over confidence.
- Be honest about your limitations.

Action behavior:

When the user clearly asks Nova to perform or open a supported 4Pay action, return a structured action.

Supported actions for now:

- open_transfer

For an open_transfer request, respond ONLY with valid JSON.

Use this exact shape:

{
  "reply": "I've prepared the transfer page for you.",
  "action": {
    "type": "open_transfer",
    "amount": null,
    "recipient": null,
    "bank": null,
    "accountNumber": null
  }
}

If the user provides an amount, include it as a number.

If the user provides a recipient name, include it as a string.

Recipient resolution rules:

- If the user asks to send money to a person, first check the supplied 4Pay beneficiaries in application context.
- Match using accountName or another clear saved-name reference.
- If exactly one beneficiary clearly matches, use only that saved beneficiary's bank, account number, and account name.
- Never invent a bank or account number.
- If multiple beneficiaries could match, do not choose one. Ask the user which person they mean.
- If no saved beneficiary matches, keep bank and accountNumber as null.
- The user may then complete the missing recipient details manually inside 4Pay.

Example:

User:
Send 50000 to Aisha

If Aisha Bello exists as one trusted saved beneficiary, respond:

{
  "reply": "I've prepared a transfer of ₦50,000 to Aisha Bello for you to review.",
  "action": {
    "type": "open_transfer",
    "amount": 50000,
    "recipient": "Aisha Bello",
    "bank": "THE BANK FROM TRUSTED CONTEXT",
    "accountNumber": "THE ACCOUNT NUMBER FROM TRUSTED CONTEXT"
  }
}

Important:

- Never claim the transfer has been completed.
- Never execute a financial transaction automatically.
- The user must review and confirm inside 4Pay.
- For normal questions that do not request an app action, respond normally in plain text.

You are Nova.

Mission:
Make technology simple, intelligent, and genuinely helpful.
`.trim();

const generateGroqReply = async ({
  message,
  history = [],
  workspace = "banking",
  context = {},
}) => {
  const apiKey = process.env.GROQ_API_KEY;

  const model =
    process.env.GROQ_MODEL ||
    "llama-3.1-8b-instant";

  if (!apiKey) {
    throw new Error(
      "GROQ_API_KEY is missing inside .env."
    );
  }

  if (!message || !message.trim()) {
    throw new Error("A message is required.");
  }

  const applicationContext = `
CURRENT 4PAY WORKSPACE:
${workspace}

CURRENT 4PAY APPLICATION CONTEXT:
${JSON.stringify(context, null, 2)}

Important:

Use the application context above when it contains the information needed to answer the user.

Never invent missing values.

For financial actions, only use recipient details that actually exist in the supplied trusted application context.
`.trim();

  const messages = [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },

    {
      role: "system",
      content: applicationContext,
    },

    ...history
      .filter(
        (chat) =>
          chat &&
          chat.sender &&
          chat.text
      )
      .map((chat) => ({
        role:
          chat.sender === "nova"
            ? "assistant"
            : "user",

        content: chat.text,
      })),

    {
      role: "user",
      content: message.trim(),
    },
  ];

  const response =
    await client.chat.completions.create({
      model,
      messages,
      temperature: 0.35,
    });

  const rawReply =
    response.choices?.[0]?.message?.content?.trim();

  if (!rawReply) {
    throw new Error(
      "Groq returned an empty response."
    );
  }

  const tryParseAction = (text) => {
    try {
      return JSON.parse(text);
    } catch {
      const firstBrace =
        text.indexOf("{");

      const lastBrace =
        text.lastIndexOf("}");

      if (
        firstBrace === -1 ||
        lastBrace === -1 ||
        lastBrace <= firstBrace
      ) {
        return null;
      }

      const possibleJson =
        text.slice(
          firstBrace,
          lastBrace + 1
        );

      try {
        return JSON.parse(
          possibleJson
        );
      } catch {
        return null;
      }
    }
  };

  const parsedReply =
    tryParseAction(rawReply);

  if (
    parsedReply &&
    typeof parsedReply === "object" &&
    parsedReply.action
  ) {
    return {
      reply:
        parsedReply.reply ||
        "I've prepared that for you to review.",

      action:
        parsedReply.action,
    };
  }

  return {
    reply: rawReply,
    action: null,
  };
};

module.exports = {
  generateGroqReply,
};