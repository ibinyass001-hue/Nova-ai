const CHATS_KEY = "nova-chats";
const ACTIVE_CHAT_KEY = "nova-active-chat";

export const loadChats = () => {
  try {
    const savedChats = localStorage.getItem(CHATS_KEY);

    return savedChats ? JSON.parse(savedChats) : [];
  } catch (error) {
    console.error("Could not load Nova chats:", error);
    return [];
  }
};

export const saveChats = (chats) => {
  try {
    localStorage.setItem(
      CHATS_KEY,
      JSON.stringify(chats)
    );
  } catch (error) {
    console.error("Could not save Nova chats:", error);
  }
};

export const loadActiveChatId = () => {
  return localStorage.getItem(ACTIVE_CHAT_KEY);
};

export const saveActiveChatId = (chatId) => {
  if (!chatId) {
    localStorage.removeItem(ACTIVE_CHAT_KEY);
    return;
  }

  localStorage.setItem(ACTIVE_CHAT_KEY, chatId);
};

export const createChatTitle = (message) => {
  const cleanMessage = message.trim();

  if (!cleanMessage) {
    return "New chat";
  }

  return cleanMessage.length > 32
    ? `${cleanMessage.slice(0, 32)}...`
    : cleanMessage;
};