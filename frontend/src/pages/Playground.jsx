import { useEffect, useRef, useState } from "react";

import {
  FiClock,
  FiCode,
  FiEdit2,
  FiEdit3,
  FiInfo,
  FiLock,
  FiMenu,
  FiMessageCircle,
  FiMoon,
  FiPaperclip,
  FiPlus,
  FiSearch,
  FiSend,
  FiSettings,
  FiSun,
  FiTrash2,
  FiX,
} from "react-icons/fi";

import {
  HiOutlineSparkles,
  HiSparkles,
} from "react-icons/hi2";

import ChatMessage from "../components/ChatMessage";

import {
  createChatTitle,
  loadActiveChatId,
  loadChats,
  saveActiveChatId,
  saveChats,
} from "../data/chatStorage";

import "./Playground.css";

function Playground() {
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const [editingChatId, setEditingChatId] =
    useState(null);

  const [editingTitle, setEditingTitle] =
    useState("");

  const [editingMessageId, setEditingMessageId] =
    useState(null);

  const [chats, setChats] = useState(() => {
    return loadChats();
  });

  const [activeChatId, setActiveChatId] = useState(
    () => {
      const savedChats = loadChats();
      const savedActiveChatId = loadActiveChatId();

      const activeChatExists = savedChats.some(
        (chat) => chat.id === savedActiveChatId
      );

      return activeChatExists
        ? savedActiveChatId
        : null;
    }
  );

  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [isLoading, setIsLoading] =
    useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [theme, setTheme] = useState(() => {
    return (
      localStorage.getItem("nova-theme") ||
      "dark"
    );
  });

  const activeChat =
    chats.find(
      (chat) => chat.id === activeChatId
    ) || null;

  const messages = activeChat?.messages || [];

  const cleanSearchTerm =
    searchTerm.trim().toLowerCase();

  const filteredChats = chats.filter((chat) =>
    chat.title
      .toLowerCase()
      .includes(cleanSearchTerm)
  );

  const isDarkMode = theme === "dark";
  const hasMessages = messages.length > 0;
  const isEditingMessage =
    editingMessageId !== null;

  const quickPrompts = [
    {
      id: 1,
      icon: <FiCode />,
      title: "Build something",
      text: "Help me build a professional React component",
    },
    {
      id: 2,
      icon: <FiEdit3 />,
      title: "Improve my writing",
      text: "Help me rewrite a message professionally",
    },
    {
      id: 3,
      icon: <HiOutlineSparkles />,
      title: "Explore an idea",
      text: "Help me develop a new business idea",
    },
  ];

  useEffect(() => {
    document.documentElement.setAttribute(
      "data-theme",
      theme
    );

    localStorage.setItem(
      "nova-theme",
      theme
    );
  }, [theme]);

  useEffect(() => {
    saveChats(chats);
  }, [chats]);

  useEffect(() => {
    saveActiveChatId(activeChatId);
  }, [activeChatId]);

  useEffect(() => {
    if (!hasMessages) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading, hasMessages]);

  useEffect(() => {
    if (isLoading || editingChatId) return;

    const timer = setTimeout(() => {
      inputRef.current?.focus();
    }, 50);

    return () => clearTimeout(timer);
  }, [
    isLoading,
    activeChatId,
    editingChatId,
    editingMessageId,
  ]);

  const createId = () => {
    if (
      typeof crypto !== "undefined" &&
      crypto.randomUUID
    ) {
      return crypto.randomUUID();
    }

    return `${Date.now()}-${Math.random()}`;
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleTheme = () => {
    setTheme((currentTheme) =>
      currentTheme === "dark"
        ? "light"
        : "dark"
    );
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const cancelRenameChat = () => {
    setEditingChatId(null);
    setEditingTitle("");
  };

  const cancelEditMessage = () => {
    setEditingMessageId(null);
    setMessage("");

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const startNewChat = () => {
    setActiveChatId(null);
    setMessage("");
    setSearchTerm("");
    setIsLoading(false);
    setEditingMessageId(null);

    cancelRenameChat();
    closeSidebar();

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const openChat = (chatId) => {
    if (isLoading || editingChatId) return;

    setActiveChatId(chatId);
    setMessage("");
    setEditingMessageId(null);

    closeSidebar();
  };

  const beginRenameChat = (event, chat) => {
    event.stopPropagation();

    setEditingChatId(chat.id);
    setEditingTitle(chat.title);
  };

  const saveRenamedChat = (chatId) => {
    const cleanTitle = editingTitle.trim();

    if (!cleanTitle) {
      cancelRenameChat();
      return;
    }

    setChats((currentChats) =>
      currentChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              title: cleanTitle,
              updatedAt:
                new Date().toISOString(),
            }
          : chat
      )
    );

    cancelRenameChat();
  };

  const deleteChat = (event, chatId) => {
    event.stopPropagation();

    setChats((currentChats) =>
      currentChats.filter(
        (chat) => chat.id !== chatId
      )
    );

    if (editingChatId === chatId) {
      cancelRenameChat();
    }

    if (activeChatId === chatId) {
      setActiveChatId(null);
      setMessage("");
      setEditingMessageId(null);
      setIsLoading(false);
    }
  };

  const selectPrompt = (promptText) => {
    setMessage(promptText);
    setEditingMessageId(null);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const setChatMessages = (
    chatId,
    updatedMessages
  ) => {
    setChats((currentChats) =>
      currentChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: updatedMessages,
              updatedAt:
                new Date().toISOString(),
            }
          : chat
      )
    );
  };

  const appendChatMessage = (
    chatId,
    newMessage
  ) => {
    setChats((currentChats) =>
      currentChats.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [
                ...chat.messages,
                newMessage,
              ],
              updatedAt:
                new Date().toISOString(),
            }
          : chat
      )
    );
  };

  const requestNovaReply = async (
    userText,
    conversationHistory
  ) => {
    const apiBaseUrl = (
      import.meta.env.VITE_API_URL || ["http:", "", "localhost:5000"].join("/")
    ).replace(/\/$/, "");

    const response = await fetch(
      `${apiBaseUrl}/api/chat`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: userText,
          history: conversationHistory,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message ||
          "Nova AI could not respond."
      );
    }

    if (!data.novaReply) {
      throw new Error(
        "Nova AI returned an empty response."
      );
    }

    return data.novaReply;
  };

  const createErrorMessage = (error) => {
    return {
      id: createId(),
      sender: "nova",
      text:
        error.message === "Failed to fetch"
          ? "I couldn’t reach the Nova AI server. Please check your connection and try again."
          : error.message ||
            "Something went wrong. Please try again.",
      time: getCurrentTime(),
    };
  };

  const editMessage = (messageId) => {
    if (isLoading) return;

    const selectedMessage = messages.find(
      (chatMessage) =>
        chatMessage.id === messageId &&
        chatMessage.sender === "user"
    );

    if (!selectedMessage) return;

    setEditingMessageId(messageId);
    setMessage(selectedMessage.text);

    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const submitEditedMessage = async (
    cleanMessage
  ) => {
    if (!activeChatId || !editingMessageId) {
      return;
    }

    const messageIndex = messages.findIndex(
      (chatMessage) =>
        chatMessage.id === editingMessageId
    );

    if (messageIndex === -1) {
      setEditingMessageId(null);
      return;
    }

    const messagesBeforeEdit =
      messages.slice(0, messageIndex);

    const conversationHistory =
      messagesBeforeEdit.map(
        ({ sender, text }) => ({
          sender,
          text,
        })
      );

    const editedUserMessage = {
      ...messages[messageIndex],
      text: cleanMessage,
      time: getCurrentTime(),
    };

    const updatedMessages = [
      ...messagesBeforeEdit,
      editedUserMessage,
    ];

    const targetChatId = activeChatId;

    setChatMessages(
      targetChatId,
      updatedMessages
    );

    setMessage("");
    setEditingMessageId(null);
    setIsLoading(true);

    try {
      const novaReply = await requestNovaReply(
        cleanMessage,
        conversationHistory
      );

      appendChatMessage(targetChatId, {
        id: createId(),
        sender: "nova",
        text: novaReply,
        time: getCurrentTime(),
      });
    } catch (error) {
      console.error(
        "Nova AI edit error:",
        error
      );

      appendChatMessage(
        targetChatId,
        createErrorMessage(error)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const regenerateMessage = async (
    novaMessageId
  ) => {
    if (
      isLoading ||
      !activeChatId
    ) {
      return;
    }

    const novaMessageIndex =
      messages.findIndex(
        (chatMessage) =>
          chatMessage.id === novaMessageId &&
          chatMessage.sender === "nova"
      );

    if (novaMessageIndex === -1) return;

    let userMessageIndex =
      novaMessageIndex - 1;

    while (
      userMessageIndex >= 0 &&
      messages[userMessageIndex].sender !==
        "user"
    ) {
      userMessageIndex -= 1;
    }

    if (userMessageIndex < 0) return;

    const userMessage =
      messages[userMessageIndex];

    const conversationHistory = messages
      .slice(0, userMessageIndex)
      .map(({ sender, text }) => ({
        sender,
        text,
      }));

    const messagesBeforeResponse =
      messages.slice(0, novaMessageIndex);

    const targetChatId = activeChatId;

    setChatMessages(
      targetChatId,
      messagesBeforeResponse
    );

    setEditingMessageId(null);
    setMessage("");
    setIsLoading(true);

    try {
      const novaReply = await requestNovaReply(
        userMessage.text,
        conversationHistory
      );

      appendChatMessage(targetChatId, {
        id: createId(),
        sender: "nova",
        text: novaReply,
        time: getCurrentTime(),
      });
    } catch (error) {
      console.error(
        "Nova AI regenerate error:",
        error
      );

      appendChatMessage(
        targetChatId,
        createErrorMessage(error)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    const cleanMessage = message.trim();

    if (!cleanMessage || isLoading) {
      return;
    }

    if (editingMessageId) {
      await submitEditedMessage(cleanMessage);
      return;
    }

    const conversationHistory =
      messages.map(({ sender, text }) => ({
        sender,
        text,
      }));

    const userMessage = {
      id: createId(),
      sender: "user",
      text: cleanMessage,
      time: getCurrentTime(),
    };

    let targetChatId = activeChatId;

    if (!targetChatId) {
      targetChatId = createId();

      const now = new Date().toISOString();

      const newChat = {
        id: targetChatId,
        title: createChatTitle(cleanMessage),
        messages: [userMessage],
        createdAt: now,
        updatedAt: now,
      };

      setChats((currentChats) => [
        newChat,
        ...currentChats,
      ]);

      setActiveChatId(targetChatId);
    } else {
      appendChatMessage(
        targetChatId,
        userMessage
      );
    }

    setMessage("");
    setIsLoading(true);

    try {
      const novaReply = await requestNovaReply(
        cleanMessage,
        conversationHistory
      );

      appendChatMessage(targetChatId, {
        id: createId(),
        sender: "nova",
        text: novaReply,
        time: getCurrentTime(),
      });
    } catch (error) {
      console.error(
        "Nova AI frontend error:",
        error
      );

      appendChatMessage(
        targetChatId,
        createErrorMessage(error)
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };

  return (
    <main
      className={`nova-page ${
        hasMessages
          ? "conversation-active"
          : "empty-chat"
      }`}
    >
      <button
        type="button"
        className="mobile-menu-button"
        onClick={() =>
          setSidebarOpen(true)
        }
        aria-label="Open navigation"
      >
        <FiMenu />
      </button>

      <section className="nova-app">
        <aside
          className={`nova-sidebar ${
            sidebarOpen
              ? "sidebar-open"
              : ""
          }`}
        >
          <button
            type="button"
            className="sidebar-close"
            onClick={closeSidebar}
            aria-label="Close navigation"
          >
            <FiX />
          </button>

          <div className="nova-brand">
            <div className="brand-icon">
              <HiSparkles />
            </div>

            <div className="brand-copy">
              <h2>Nova AI</h2>

              <span>
                Intelligent assistant
              </span>
            </div>
          </div>

          <button
            type="button"
            className="new-chat-button"
            onClick={startNewChat}
          >
            <FiPlus />
            <span>New chat</span>
          </button>

          <nav
            className="nova-navigation"
            aria-label="Nova AI navigation"
          >
            <button
              type="button"
              className="nav-item active"
              onClick={closeSidebar}
            >
              <FiMessageCircle />
              <span>Chat</span>
            </button>

            <button
              type="button"
              className="nav-item"
            >
              <FiClock />
              <span>History</span>
            </button>

            <button
              type="button"
              className="nav-item"
            >
              <HiOutlineSparkles />
              <span>Prompts</span>
            </button>

            <button
              type="button"
              className="nav-item"
            >
              <FiSettings />
              <span>Settings</span>
            </button>

            <button
              type="button"
              className="nav-item"
              onClick={toggleTheme}
            >
              {isDarkMode ? (
                <FiSun />
              ) : (
                <FiMoon />
              )}

              <span>
                {isDarkMode
                  ? "Light mode"
                  : "Dark mode"}
              </span>
            </button>

            <button
              type="button"
              className="nav-item"
            >
              <FiInfo />
              <span>About</span>
            </button>
          </nav>

          <section className="chat-history">
            <div className="history-heading">
              <span>Recent chats</span>
              <strong>{chats.length}</strong>
            </div>

            <div className="history-search">
              <FiSearch />

              <input
                type="text"
                value={searchTerm}
                onChange={(event) =>
                  setSearchTerm(
                    event.target.value
                  )
                }
                placeholder="Search chats"
                aria-label="Search conversations"
              />

              {searchTerm && (
                <button
                  type="button"
                  className="clear-search-button"
                  onClick={() =>
                    setSearchTerm("")
                  }
                  aria-label="Clear search"
                >
                  <FiX />
                </button>
              )}
            </div>

            <div className="history-list">
              {filteredChats.length === 0 ? (
                <p className="history-empty">
                  {searchTerm.trim()
                    ? "No matching chats"
                    : "No conversations yet"}
                </p>
              ) : (
                filteredChats.map((chat) => {
                  const isEditing =
                    editingChatId === chat.id;

                  return (
                    <div
                      key={chat.id}
                      className={`history-item ${
                        chat.id === activeChatId
                          ? "active"
                          : ""
                      } ${
                        isEditing
                          ? "editing"
                          : ""
                      }`}
                      onClick={() => {
                        if (!isEditing) {
                          openChat(chat.id);
                        }
                      }}
                    >
                      <FiMessageCircle />

                      {isEditing ? (
                        <input
                          type="text"
                          className="rename-chat-input"
                          value={editingTitle}
                          onChange={(event) =>
                            setEditingTitle(
                              event.target.value
                            )
                          }
                          onClick={(event) =>
                            event.stopPropagation()
                          }
                          onBlur={() =>
                            saveRenamedChat(
                              chat.id
                            )
                          }
                          onKeyDown={(event) => {
                            if (
                              event.key ===
                              "Enter"
                            ) {
                              event.preventDefault();
                              event.currentTarget.blur();
                            }

                            if (
                              event.key ===
                              "Escape"
                            ) {
                              event.preventDefault();
                              cancelRenameChat();
                            }
                          }}
                          maxLength={60}
                          autoFocus
                        />
                      ) : (
                        <span className="history-title">
                          {chat.title}
                        </span>
                      )}

                      {!isEditing && (
                        <>
                          <button
                            type="button"
                            className="rename-chat-button"
                            onClick={(event) =>
                              beginRenameChat(
                                event,
                                chat
                              )
                            }
                            aria-label={`Rename ${chat.title}`}
                          >
                            <FiEdit2 />
                          </button>

                          <button
                            type="button"
                            className="delete-chat-button"
                            onClick={(event) =>
                              deleteChat(
                                event,
                                chat.id
                              )
                            }
                            aria-label={`Delete ${chat.title}`}
                          >
                            <FiTrash2 />
                          </button>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <div className="sidebar-profile">
            <div className="profile-avatar">
              M
            </div>

            <div className="profile-details">
              <strong>Muhammed</strong>

              <span>
                Developer
                <i aria-hidden="true"></i>
              </span>
            </div>
          </div>
        </aside>

        {sidebarOpen && (
          <button
            type="button"
            className="sidebar-overlay"
            onClick={closeSidebar}
            aria-label="Close sidebar"
          ></button>
        )}

        <section className="nova-main">
          {hasMessages && (
            <header className="conversation-header">
              <div className="conversation-brand">
                <div className="conversation-logo">
                  <HiSparkles />
                </div>

                <div>
                  <strong>
                    {activeChat?.title ||
                      "Nova AI"}
                  </strong>

                  <span>
                    Nova AI is online
                  </span>
                </div>
              </div>

              <button
                type="button"
                className="header-new-chat"
                onClick={startNewChat}
              >
                <FiPlus />
                <span>New chat</span>
              </button>
            </header>
          )}

          <section className="nova-chat-panel">
            {hasMessages ? (
              <div className="messages-container">
                {messages.map(
                  (chatMessage) => (
                    <ChatMessage
                      key={chatMessage.id}
                      sender={
                        chatMessage.sender
                      }
                      text={
                        chatMessage.text
                      }
                      time={
                        chatMessage.time
                      }
                      onEdit={() =>
                        editMessage(
                          chatMessage.id
                        )
                      }
                      onRegenerate={() =>
                        regenerateMessage(
                          chatMessage.id
                        )
                      }
                    />
                  )
                )}

                {isLoading && (
                  <div className="nova-typing">
                    <div className="typing-logo">
                      <HiSparkles />
                    </div>

                    <div className="typing-content">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}

                <div
                  ref={messagesEndRef}
                  className="messages-end"
                  aria-hidden="true"
                ></div>
              </div>
            ) : (
              <div className="empty-chat-space">
                <div className="empty-chat-content">
                  <div className="empty-chat-logo">
                    <HiSparkles />
                  </div>

                  <h1>Nova AI</h1>

                  <p>
                    Think clearly. Create freely.
                  </p>

                  <div className="quick-prompts">
                    {quickPrompts.map(
                      (prompt) => (
                        <button
                          type="button"
                          className="quick-prompt-card"
                          key={prompt.id}
                          onClick={() =>
                            selectPrompt(
                              prompt.text
                            )
                          }
                        >
                          <span className="quick-prompt-icon">
                            {prompt.icon}
                          </span>

                          <span className="quick-prompt-copy">
                            <strong>
                              {prompt.title}
                            </strong>

                            <small>
                              {prompt.text}
                            </small>
                          </span>
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            <form
              className={`nova-input-wrapper ${
                isEditingMessage
                  ? "editing-message"
                  : ""
              }`}
              onSubmit={handleSubmit}
            >
              <button
                type="button"
                className="attach-button"
                aria-label="Attach file"
              >
                <FiPaperclip />
              </button>

              <input
                ref={inputRef}
                type="text"
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value
                  )
                }
                placeholder={
                  isEditingMessage
                    ? "Edit your message"
                    : "Message Nova AI"
                }
                disabled={isLoading}
                autoComplete="off"
              />

              {isEditingMessage && (
                <button
                  type="button"
                  className="cancel-message-edit"
                  onClick={cancelEditMessage}
                  aria-label="Cancel message edit"
                  title="Cancel edit"
                >
                  <FiX />
                </button>
              )}

              <button
                type="submit"
                className="send-button"
                disabled={
                  !message.trim() ||
                  isLoading
                }
                aria-label={
                  isLoading
                    ? "Nova AI is thinking"
                    : isEditingMessage
                      ? "Save edited message"
                      : "Send message"
                }
              >
                <FiSend />
              </button>
            </form>
          </section>

          <footer className="nova-security">
            <FiLock />

            <span>
              Nova AI can make mistakes.
              Check important information.
            </span>
          </footer>
        </section>
      </section>
    </main>
  );
}

export default Playground;
