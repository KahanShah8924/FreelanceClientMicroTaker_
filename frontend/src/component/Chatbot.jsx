import React, { useState, useEffect, useRef } from 'react';
import './ChatbotNotification.css';
import apiList from "../lib/apiList";

const Chatbot = () => {
  const chatKey = 'fcm_react_chat';
  const roleKey = 'fcm_react_role';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputStr, setInputStr] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([]);
  
  const endOfMessagesRef = useRef(null);

  // Initialize Chat (Load from storage or Intro)
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(chatKey)) || [];
    if (stored.length === 0) {
      setTimeout(() => {
        addMessage('bot', "Hello! Welcome to FCM Support. Are you a Freelancer or a Client?");
        updateQuickReplies(null);
      }, 500);
    } else {
      setMessages(stored.slice(-5)); // Ensure memory caps at 5
      updateQuickReplies(localStorage.getItem(roleKey));
    }
  }, []);

  // Sync to LocalStorage (cap at 5 messages memory limit)
  useEffect(() => {
    if (messages.length > 0) {
      const last5 = messages.slice(-5);
      localStorage.setItem(chatKey, JSON.stringify(last5));
    }
  }, [messages]);

  // Auto-scroll to newest message
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping, isOpen]);

  const updateQuickReplies = (role) => {
    if (!role) setQuickReplies(["I'm a Freelancer", "I'm a Client"]);
    else if (role === 'freelancer') setQuickReplies(["Find Tasks", "Track Status", "Apply Help"]);
    else setQuickReplies(["Post a Job", "Pricing Info", "Attract Tips"]);
  };

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, { sender, text, timestamp: Date.now() }]);
  };

  const updateLastBotMessage = (text) => {
    setMessages((prev) => {
      if (prev.length === 0) return prev;
      const next = [...prev];
      const last = next[next.length - 1];
      if (last.sender !== "bot") return prev;
      next[next.length - 1] = { ...last, text };
      return next;
    });
  };

  const handleSend = (text) => {
    const rawText = text.trim();
    if (!rawText) return;

    addMessage('user', rawText);
    setInputStr('');
    setIsTyping(true);

    const input = rawText.toLowerCase();
    const existingRole = localStorage.getItem(roleKey);

    // Only handle role onboarding locally. Everything else uses Gemini.
    if (!existingRole) {
      if (input.includes("freelancer")) {
        localStorage.setItem(roleKey, "freelancer");
        updateQuickReplies("freelancer");
        setIsTyping(false);
        addMessage(
          "bot",
          "Great! As a freelancer, I can help you find tasks, track your application status, or show you trending jobs. What do you need?"
        );
        return;
      }
      if (input.includes("client")) {
        localStorage.setItem(roleKey, "client");
        updateQuickReplies("client");
        setIsTyping(false);
        addMessage(
          "bot",
          "Awesome! As a client, I can help you post a job, explain pricing, or provide tips to attract top freelancers. How can I assist today?"
        );
        return;
      }
    }

    const historyToSend = [
      ...messages,
      { sender: "user", text: rawText, timestamp: Date.now() },
    ].slice(-10);

    const streamGeminiResponse = async () => {
      try {
        const response = await fetch(apiList.chatbotStream, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: rawText,
            role: localStorage.getItem(roleKey),
            history: historyToSend,
          }),
        });

        if (!response.ok || !response.body) {
          throw new Error("Streaming endpoint unavailable");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");
        let buffer = "";
        let streamedReply = "";

        addMessage("bot", "");
        setIsTyping(false);

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split("\n\n");
          buffer = events.pop() || "";

          events.forEach((evt) => {
            const line = evt
              .split("\n")
              .find((part) => part.startsWith("data: "));
            if (!line) return;

            try {
              const payload = JSON.parse(line.replace("data: ", ""));
              if (payload?.token) {
                streamedReply += payload.token;
                updateLastBotMessage(streamedReply);
              } else if (payload?.error) {
                streamedReply =
                  "I'm not sure, but I can guide you to the right section.";
                updateLastBotMessage(streamedReply);
              }
            } catch (_err) {
              // Ignore malformed chunks and continue.
            }
          });
        }

        if (!streamedReply.trim()) {
          updateLastBotMessage("Sorry, I couldn't generate a response right now.");
        }
      } catch (_err) {
        setIsTyping(false);
        addMessage(
          "bot",
          "I'm not sure, but I can guide you to the right section."
        );
      } finally {
        setIsTyping(false);
      }
    };

    streamGeminiResponse();
  };

  return (
    <>
      <div className="fcm-chat-toggle" onClick={() => setIsOpen(true)}>💬</div>
      
      <div className={`fcm-chat-container ${isOpen ? 'active' : ''}`}>
        <div className="fcm-chat-header">
          <h4>Support Assistant</h4>
          <span className="close-btn" onClick={() => setIsOpen(false)}>✖</span>
        </div>
        
        <div className="fcm-chat-body">
          {messages.map((msg, idx) => (
            <div key={idx} className={`fcm-chat-msg msg-${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          
          {isTyping && (
            <div className="fcm-typing-indicator">
              <span></span><span></span><span></span>
            </div>
          )}
          <div ref={endOfMessagesRef} /> {/* Invisible div to scroll to */}
        </div>
        
        <div className="fcm-chat-input-area">
          <div className="fcm-quick-replies">
            {quickReplies.map((reply, i) => (
              <button key={i} className="fcm-quick-btn" onClick={() => handleSend(reply)}>
                {reply}
              </button>
            ))}
          </div>
          <div className="fcm-input-wrapper">
            <input 
              type="text" 
              value={inputStr}
              onChange={(e) => setInputStr(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputStr)}
              placeholder="Type your message..." 
            />
            <button id="fcm-chatSend" onClick={() => handleSend(inputStr)}>➤</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Chatbot;
