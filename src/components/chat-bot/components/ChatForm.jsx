import { useState, useRef } from "react";

const ChatForm = ({ chatHistory, setChatHistory, generateBotResponse }) => {
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const inputRef = useRef();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userMessage = message.trim();
    if (!userMessage || isProcessing) return; // Prevent multiple submissions

    // Update chat history with the user's message
    const newMessage = { role: "user", text: userMessage };
    setChatHistory((prev) => [...prev, newMessage]);
    setMessage("");
    setIsProcessing(true);

    // Delay 600 ms before generating response
    setTimeout(() => {
      try {
        // Call the function to generate the bot's response
        // Only prepend the context message if there was a previous error
        const messageToSend = hasError 
          ? [...chatHistory, { role: "user", text: `Using the details provided above, please address this query: ${userMessage}` }]
          : [...chatHistory, { role: "user", text: userMessage }];
          
        generateBotResponse(messageToSend)
          .finally(() => {
            setIsProcessing(false);
            setHasError(false); // Reset error state on completion
          });
      } catch (error) {
        console.error("Error generating response:", error);
        setHasError(true);
        setIsProcessing(false);
      }
    }, 600);
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        ref={inputRef}
        placeholder="Type your message..."
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:border-primary"
        required
        disabled={isProcessing}
      />
      <button
        type="submit"
        className={`px-4 py-2 rounded-lg transition-colors ${
          isProcessing 
            ? "bg-gray-400 text-white cursor-not-allowed" 
            : "bg-primary text-white hover:bg-primary/90"
        }`}
        disabled={isProcessing}
      >
        {isProcessing ? "Sending..." : "Send"}
      </button>
    </form>
  );
};

export default ChatForm;