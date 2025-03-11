import { useEffect, useRef, useState } from "react";
import ChatForm from "./chat-bot/components/ChatForm";
import ChatMessage from "./chat-bot/components/ChatMessage";

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ChatHistory, setChatHistory] = useState([]);
  const chatBotRef = useRef();

  const generateBotResponse = async (history) => {
    const updateHistory = (text) => {
      setChatHistory(prev => [...prev.filter(msg => msg.text !== "Thinking..."), {role: "model", text}]);
    }

    // Get the last user message
    const lastMessage = history[history.length - 1].text.toLowerCase();
    
    // Basic response logic
    let response = "I'm here to help! How can I assist you with your hospital-related queries?";
    
    if (lastMessage.includes("appointment") || lastMessage.includes("book")) {
      response = "To book an appointment, please visit our 'ALL DOCTORS' section, select your preferred doctor, and follow the booking process. You'll need to be logged in to make an appointment.";
    } else if (lastMessage.includes("doctor") || lastMessage.includes("specialist")) {
      response = "We have various specialists including General Physicians, Gynecologists, Dermatologists, Pediatricians, Neurologists, and Gastroenterologists. You can find them all in our 'ALL DOCTORS' section.";
    } else if (lastMessage.includes("contact") || lastMessage.includes("reach")) {
      response = "You can reach us through our 'CONTACT' page. We're available 24/7 for emergencies.";
    } else if (lastMessage.includes("login") || lastMessage.includes("sign up")) {
      response = "You can login or create an account using the 'Login/Sign Up' button in the navigation bar. We have separate login options for patients, doctors, and administrators.";
    } else if (lastMessage.includes("emergency") || lastMessage.includes("urgent")) {
      response = "For emergencies, please call our emergency helpline immediately. You can find the number on our 'CONTACT' page.";
    } else if (lastMessage.includes("cost") || lastMessage.includes("fee") || lastMessage.includes("price")) {
      response = "Consultation fees vary by doctor and specialty. You can see the fees listed on each doctor's profile in the 'ALL DOCTORS' section.";
    } else if (lastMessage.includes("thank") || lastMessage.includes("thanks")) {
      response = "You're welcome! Is there anything else I can help you with?";
    }

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    updateHistory(response);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-primary text-white p-4 rounded-full shadow-lg hover:bg-primary/90 transition-colors"
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
          <div className="bg-primary p-4 rounded-t-lg flex justify-between items-center">
            <div className="flex items-center gap-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 1024 1024"
                fill="white"
              >
                <path d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5z" />
              </svg>
              <h2 className="text-white font-semibold">Hospital Assistant</h2>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-white/80"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div className="flex items-start gap-2">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <p className="text-sm">Hello! I'm your hospital assistant. How can I help you today?</p>
                </div>
              </div>
              {ChatHistory.map((chat, index) => (
                <ChatMessage key={index} chat={chat} />
              ))}
            </div>
          </div>
          
          <div className="p-4 border-t">
            <ChatForm 
              ChatHistory={ChatHistory} 
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