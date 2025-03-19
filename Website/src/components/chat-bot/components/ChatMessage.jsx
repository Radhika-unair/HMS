const ChatMessage = ({ chat }) => {
  const isUser = chat.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] p-3 rounded-lg ${
          isUser
            ? "bg-primary text-white rounded-br-none"
            : "bg-primary/10 text-gray-800 rounded-bl-none"
        }`}
      >
        <p className="text-sm">{chat.text}</p>
      </div>
    </div>
  );
};

export default ChatMessage;