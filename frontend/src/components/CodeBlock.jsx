import { useState } from "react";

import { FiCheck, FiCopy } from "react-icons/fi";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

import "./CodeBlock.css";

function CodeBlock({ language = "text", code = "" }) {
  const [copied, setCopied] = useState(false);

  const cleanCode = String(code).replace(/\n$/, "");

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1600);
    } catch (error) {
      console.error("Could not copy code:", error);
    }
  };

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-language">
          {language || "text"}
        </span>

        <button
          type="button"
          className="copy-code-button"
          onClick={copyCode}
          aria-label="Copy code"
        >
          {copied ? <FiCheck /> : <FiCopy />}

          <span>{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>

      <SyntaxHighlighter
        language={language}
        style={oneDark}
        customStyle={{
          margin: 0,
          padding: "18px",
          background: "transparent",
          fontSize: "13px",
          lineHeight: "1.65",
        }}
        wrapLongLines
      >
        {cleanCode}
      </SyntaxHighlighter>
    </div>
  );
}

export default CodeBlock;