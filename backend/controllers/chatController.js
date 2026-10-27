const {
  generateAIReply,
} = require("../services/ai/providerManager");

/* ========================================
   CLEAN NOVA RESPONSE
======================================== */

const cleanNovaReply = (value) => {
  if (!value) {
    return "";
  }

  let text = String(value);

  /*
    Remove markdown bold / italic markers.

    **₦50,000** → ₦50,000
    __Transfer__ → Transfer
  */
  text = text
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/\*(.*?)\*/g, "$1");

  /*
    Remove markdown headings.

    ## Recent transactions
    becomes:
    Recent transactions
  */
  text = text.replace(
    /^\s*#{1,6}\s+/gm,
    ""
  );

  /*
    Convert markdown table rows into
    readable lines instead of showing
    ugly | pipes inside Nova.
  */
  const lines = text.split("\n");

  const cleanedLines = lines
    .map((line) => {
      const trimmed =
        line.trim();

      /*
        Remove markdown table separator:

        | --- | --- | --- |
      */
      if (
        /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(
          trimmed
        )
      ) {
        return "";
      }

      /*
        Convert:

        | Ibrahim | ₦20,000 | Credit |

        into:

        Ibrahim • ₦20,000 • Credit
      */
      if (
        trimmed.startsWith("|") &&
        trimmed.endsWith("|")
      ) {
        const columns = trimmed
          .slice(1, -1)
          .split("|")
          .map((column) =>
            column.trim()
          )
          .filter(Boolean);

        return columns.join(" • ");
      }

      return line;
    })
    .filter((line, index, array) => {
      /*
        Avoid excessive blank lines.
      */

      if (line.trim()) {
        return true;
      }

      return (
        index === 0 ||
        array[index - 1]?.trim()
      );
    });

  text = cleanedLines.join("\n");

  /*
    Clean common markdown bullets.
  */
  text = text.replace(
    /^\s*[-*]\s+/gm,
    "• "
  );

  /*
    Remove accidental excessive spacing.
  */
  text = text
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  return text;
};

/* ========================================
   CHAT CONTROLLER
======================================== */

const chat = async (
  req,
  res
) => {
  try {
    const {
      message,
      history = [],
      workspace = "banking",
      context = {},
    } = req.body;

    /* ========================================
       VALIDATE MESSAGE
    ======================================== */

    if (
      !message ||
      !message.trim()
    ) {
      return res
        .status(400)
        .json({
          success: false,

          message:
            "Please enter a message.",
        });
    }

    const cleanMessage =
      message.trim();

    /* ========================================
       ASK NOVA AI
    ======================================== */

    const aiResult =
      await generateAIReply({
        message:
          cleanMessage,

        history:
          Array.isArray(history)
            ? history
            : [],

        workspace,

        context:
          context &&
          typeof context ===
            "object"
            ? context
            : {},
      });

    /* ========================================
       NORMALIZE PROVIDER RESPONSE
    ======================================== */

    const rawReply =
      typeof aiResult ===
      "string"
        ? aiResult
        : aiResult?.reply;

    const action =
      aiResult &&
      typeof aiResult ===
        "object"
        ? aiResult.action ||
          null
        : null;

    if (!rawReply) {
      throw new Error(
        "Nova returned an empty response."
      );
    }

    /* ========================================
       CLEAN RESPONSE
    ======================================== */

    const novaReply =
      cleanNovaReply(
        rawReply
      );

    if (!novaReply) {
      throw new Error(
        "Nova returned an empty response after formatting."
      );
    }

    /* ========================================
       SEND TO 4PAY
    ======================================== */

    return res
      .status(200)
      .json({
        success: true,

        userMessage:
          cleanMessage,

        novaReply,

        action,
      });
  } catch (error) {
    console.error(
      "Nova chat error:",
      error
    );

    return res
      .status(500)
      .json({
        success: false,

        message:
          "Nova could not respond right now.",
      });
  }
};

module.exports = {
  chat,
};