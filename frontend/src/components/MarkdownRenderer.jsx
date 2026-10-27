import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import CodeBlock from "./CodeBlock";

import "./MarkdownRenderer.css";

function MarkdownRenderer({ text = "" }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({
            inline,
            className,
            children,
            ...props
          }) {
            const languageMatch =
              /language-(\w+)/.exec(
                className || ""
              );

            const language = languageMatch
              ? languageMatch[1]
              : "text";

            const code = String(children);

            if (!inline && languageMatch) {
              return (
                <CodeBlock
                  language={language}
                  code={code}
                />
              );
            }

            return (
              <code
                className="inline-code"
                {...props}
              >
                {children}
              </code>
            );
          },

          a({ href, children }) {
            return (
              <a
                href={href}
                target="_blank"
                rel="noreferrer"
              >
                {children}
              </a>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

export default MarkdownRenderer;