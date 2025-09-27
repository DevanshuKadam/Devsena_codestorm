import React, { createContext, useContext, useState, useEffect } from 'react';
import sessionManager from '../lib/sessionManager';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const [chatVisibility, setChatVisibility] = useState(false);
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [currentMessage, setCurrentMessage] = useState("");

  // Load chat state from sessionStorage on mount
  useEffect(() => {
    const savedChatVisibility = sessionManager.getItem('chatVisibility', false);
    const savedMessages = sessionManager.getItem('chatMessages', []);
    
    // Start with chat closed by default
    setChatVisibility(false);
    
    if (savedMessages && savedMessages.length > 0) {
      setMessages(savedMessages);
    } else {
      // Initialize with welcome message
      setMessages([{
        id: Date.now(),
        type: 'ai',
        content: "Hello! I'm your Personal Business Assistant. I can help you manage your business operations, create schedules, assign tasks, and navigate your dashboard. How may I assist you today?",
        timestamp: new Date().toISOString()
      }]);
    }
  }, []);

  // Save chat state to sessionStorage whenever it changes
  useEffect(() => {
    sessionManager.setItem('chatVisibility', chatVisibility);
    // Also update chatActive for backward compatibility
    sessionManager.setItem('chatActive', chatVisibility);
  }, [chatVisibility]);

  useEffect(() => {
    sessionManager.setItem('chatMessages', messages);
  }, [messages]);

  const addMessage = (type, content) => {
    const newMessage = {
      id: Date.now(),
      type: type, // 'user' or 'ai'
      content: content,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, newMessage]);
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      type: 'ai',
      content: "Hello! I'm your Personal Business Assistant. I can help you manage your business operations, create schedules, assign tasks, and navigate your dashboard. How may I assist you today?",
      timestamp: new Date().toISOString()
    }]);
  };

  const clearSession = () => {
    sessionManager.clearAll();
    setMessages([{
      id: Date.now(),
      type: 'ai',
      content: "Hello! I'm your Personal Business Assistant. I can help you manage your business operations, create schedules, assign tasks, and navigate your dashboard. How may I assist you today?",
      timestamp: new Date().toISOString()
    }]);
    setChatVisibility(false);
  };

  const toggleChat = () => {
    setChatVisibility(prev => !prev);
  };

  const value = {
    chatVisibility,
    setChatVisibility,
    messages,
    setMessages,
    addMessage,
    clearChat,
    clearSession,
    toggleChat,
    isTyping,
    setIsTyping,
    currentMessage,
    setCurrentMessage
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
