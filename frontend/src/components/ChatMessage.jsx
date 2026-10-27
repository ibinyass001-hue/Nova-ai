import { useState } from "react";

import {
  FiCheck,
  FiCopy,
  FiEdit2,
  FiRefreshCw,
  FiUser,
} from "react-icons/fi";

import { HiSparkles } from "react-icons/hi2";

import MarkdownRenderer from "./MarkdownRenderer";

import "./ChatMessage.css";

function ChatMessage({
  sender,
  text,
  time,
  onEdit,
  onRegenerate,
}) {
  const [copied, setCopied] = useState(false);

  const isUser = sender === "user";

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(text);

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1500);
    } catch (error) {
      console.error(
        "Could not copy message:",
        error
      );
    }
  };

  const handleEdit = () => {
    if (typeof onEdit === "function") {
      onEdit();
    }
  };

  const handleRegenerate = () => {
    if (typeof onRegenerate === "function") {
      onRegenerate();
    }
  };

  return (
    <article
      className={`message-row ${
        isUser ? "user-row" : "nova-row"
      }`}
    >
      {!isUser && (
        <div
          className="message-avatar nova-avatar"
          aria-hidden="true"
        >
          <HiSparkles />
        </div>
      )}

      <div className="message-wrapper">
        <div
          className={`message-content ${
            isUser
              ? "user-message"
              : "nova-message"
          }`}
        >
          {isUser ? (
            <p className="user-message-text">
              {text}
            </p>
          ) : (
            <MarkdownRenderer text={text} />
          )}

          <div className="message-meta">
            <span className="message-time">
              {time}
            </span>

            {isUser && (
              <span
                className="message-check"
                aria-label="Message sent"
              >
                ✓✓
              </span>
            )}
          </div>
        </div>

        <div
          className={`message-actions ${
            isUser
              ? "user-message-actions"
              : "nova-message-actions"
          }`}
        >
          {isUser && (
            <button
              type="button"
              className="message-action-button"
              onClick={handleEdit}
              aria-label="Edit message"
              title="Edit message"
            >
              <FiEdit2 />
            </button>
          )}

          <button
            type="button"
            className="message-action-button"
            onClick={copyMessage}
            aria-label="Copy message"
            title={
              copied
                ? "Copied"
                : "Copy message"
            }
          >
            {copied ? (
              <FiCheck />
            ) : (
              <FiCopy />
            )}
          </button>

          {!isUser && (
            <button
              type="button"
              className="message-action-button"
              onClick={handleRegenerate}
              aria-label="Regenerate response"
              title="Regenerate response"
            >
              <FiRefreshCw />
            </button>
          )}
        </div>
      </div>

      {isUser && (
        <div
          className="message-avatar user-avatar"
          aria-hidden="true"
        >
          <FiUser />
        </div>
      )}
    </article>
  );
}

export default ChatMessage;