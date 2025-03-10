import { useState } from "react";

const ChatForm = ({ ChatHistory, setChatHistory, generateBotResponse }) => {
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMessage = { role: "user", text: message };
    setChatHistory(prev => [...prev, newMessage, { role: "model", text: "Thinking..." }]);
    setMessage("");
    await generateBotResponse([...ChatHistory, newMessage]);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message..."
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
      />
      <button
        type="submit"
        className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
      >
        Send
      </button>
    </form>
  );
};

export default ChatForm; 