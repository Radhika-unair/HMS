import ChatbotIcon from "./ChatbotIcon";

const ChatMessage = ({ chat }) => {
  const isUser = chat.role === "user";

  // Hide the message if `hideInChat` is true
  if (chat.hideInChat) return null;

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isUser
            ? "bg-primary text-white rounded-br-none"
            : "bg-primary/10 text-gray-800 rounded-bl-none"
        } ${chat.isError ? "border border-red-500" : ""}`}
      >
        {/* Show ChatbotIcon for bot messages */}
        {!isUser}
        <p className="text-sm">{chat.text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;