import { useEffect, useRef, useState } from "react";
import ChatForm from "./chat-bot/components/ChatForm";
import ChatMessage from "./chat-bot/components/ChatMessage";
import ChatbotIcon from "./chat-bot/components/ChatbotIcon";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const chatBodyRef = useRef(null);

  const generateBotResponse = async (history) => {
    // Helper function to update chat history
    const updateHistory = (text, isError = false) => {
      setChatHistory((prev) => [...prev.filter((msg) => msg.text !== "Thinking..."), { role: "model", text, isError }]);
    };

    // Add a "Thinking..." message
    setChatHistory((prev) => [...prev, { role: "model", text: "Thinking..." }]);

    // Format chat history for API request
    const formattedHistory = history.map(({ role, text }) => ({ role, parts: [{ text }] }));
    const requestOptions = {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: formattedHistory }),
      mode: "no-cors",
    };

    try {
      // Make the API call to get the bot's response
      const response = await fetch(import.meta.env.VITE_API_URL, requestOptions);
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error?.message || "Something went wrong!");

      // Clean and update chat history with bot's response
      const apiResponseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
      updateHistory(apiResponseText);
    } catch (error) {
      // Update chat history with the error message
      updateHistory(error.message, true);
    }
  };

  // Auto-scroll to bottom whenever chat history updates
  useEffect(() => {
    if (chatBodyRef.current) {
      chatBodyRef.current.scrollTo({ top: chatBodyRef.current.scrollHeight, behavior: "smooth" });
    }
  }, [chatHistory]);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
          aria-label="Open chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 1024 1024"
            fill="currentColor"
          >
            <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5z" />
          </svg>
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-xl w-[420px] h-[600px] flex flex-col">
          {/* Chatbot Header */}
          <div className="bg-primary p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <ChatbotIcon />
              <h2 className="text-white font-semibold">Hospital Assistant</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-white/80"
              aria-label="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* Chatbot Body */}
          <div ref={chatBodyRef} className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-sm">Hello! I'm your hospital assistant. How can I help you today?</p>
                </div>
              </div>
              {/* Render the chat history dynamically */}
              {chatHistory.map((chat, index) => (
                <ChatMessage key={index} chat={chat} />
              ))}
            </div>
          </div>

          {/* Chatbot Footer */}
          <div className="p-4 border-t">
            <ChatForm
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
              generateBotResponse={generateBotResponse}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatBot;