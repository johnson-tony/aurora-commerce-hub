// src/pages/LiveChat.tsx
import React, { useState, useRef, useEffect } from 'react';
import Navigation from '@/components/Navigation';

// Helper function to format timestamp
const formatTime = (date: Date) => {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
};

// --- Message Interface ---
interface ChatMessage {
    id: number;
    text: string;
    sender: 'user' | 'agent';
    timestamp: string;
    read?: boolean;
}

// --- Mock Initial Messages ---
const initialMessages: ChatMessage[] = [
    {
        id: 1,
        text: "Hi there! How can I help you today?",
        sender: 'agent',
        timestamp: formatTime(new Date(Date.now() - 30000)), // 30 seconds ago
        read: true,
    },
    {
        id: 2,
        text: "I'm having trouble with my recent order, ORD-98765. It shows as 'Shipped' but hasn't arrived.",
        sender: 'user',
        timestamp: formatTime(new Date(Date.now() - 15000)), // 15 seconds ago
        read: true,
    },
    {
        id: 3,
        text: "Let me check that for you. Can you please confirm your full name and the email address associated with the order?",
        sender: 'agent',
        timestamp: formatTime(new Date()),
        read: false, // New message, not yet read by user in this simulation
    },
];

const LiveChat: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
    const [inputText, setInputText] = useState('');
    const [isAgentTyping, setIsAgentTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null); // Ref for auto-scrolling

    // Auto-scroll to the bottom of the chat window
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]); // Scroll whenever messages change

    // Simulate agent response after user sends message
    useEffect(() => {
        if (messages.length > initialMessages.length && messages[messages.length - 1].sender === 'user') {
            setIsAgentTyping(true);
            setTimeout(() => {
                setIsAgentTyping(false);
                const agentResponse = getSimulatedAgentResponse(messages[messages.length - 1].text);
                setMessages(prev => [
                    ...prev,
                    {
                        id: prev.length + 1,
                        text: agentResponse,
                        sender: 'agent',
                        timestamp: formatTime(new Date()),
                    },
                ]);
            }, 1500 + Math.random() * 1000); // Simulate typing delay (1.5s - 2.5s)
        }
    }, [messages]);


    const handleSendMessage = () => {
        if (inputText.trim() === '') return;

        const newMessage: ChatMessage = {
            id: messages.length + 1,
            text: inputText.trim(),
            sender: 'user',
            timestamp: formatTime(new Date()),
        };

        setMessages((prevMessages) => [...prevMessages, newMessage]);
        setInputText(''); // Clear input
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    const getSimulatedAgentResponse = (userMessage: string): string => {
        const lowerCaseMessage = userMessage.toLowerCase();
        if (lowerCaseMessage.includes('order') || lowerCaseMessage.includes('tracking')) {
            return "Okay, I'm looking into your order status now. Please hold for a moment.";
        } else if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
            return "Hello! How can I further assist you?";
        } else if (lowerCaseMessage.includes('thank you') || lowerCaseMessage.includes('thanks')) {
            return "You're most welcome! Is there anything else I can help with?";
        } else if (lowerCaseMessage.includes('help')) {
            return "I'm here to help! Could you please elaborate on your issue?";
        } else {
            return "I understand. Let me just confirm that for you.";
        }
    };

    const handleEndChat = () => {
        if (window.confirm("Are you sure you want to end this chat?")) {
            alert("Chat ended. Thank you for contacting support!");
            // In a real app, this would log the chat, redirect, etc.
            setMessages([]); // Clear messages for a fresh start or show an "ended" state
        }
    };

    return (
        <div className="min-h-screen bg-soft-ivory flex flex-col">
            <Navigation />
            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-xl h-[80vh] bg-white rounded-lg shadow-xl flex flex-col overflow-hidden border border-gray-200">
                    {/* Chat Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 flex items-center justify-between shadow-md">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img
                                    src="https://via.placeholder.com/40/0000FF/FFFFFF?text=A"
                                    alt="Agent Avatar"
                                    className="w-10 h-10 rounded-full border-2 border-white"
                                />
                                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></span>
                            </div>
                            <div>
                                <h2 className="font-semibold text-lg">Support Agent</h2>
                                <p className="text-sm text-indigo-100">Online</p>
                            </div>
                        </div>
                        <button
                            onClick={handleEndChat}
                            className="bg-indigo-700 hover:bg-indigo-800 text-white text-sm py-1.5 px-4 rounded-full transition-colors duration-200 shadow-sm"
                        >
                            End Chat
                        </button>
                    </div>

                    {/* Chat Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div className={`flex flex-col max-w-[75%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div
                                        className={`rounded-xl px-4 py-2 shadow-sm relative ${
                                            msg.sender === 'user'
                                                ? 'bg-indigo-500 text-white rounded-br-none'
                                                : 'bg-gray-200 text-gray-800 rounded-bl-none'
                                        }`}
                                    >
                                        <p className="text-sm">{msg.text}</p>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                        {msg.timestamp}
                                        {msg.sender === 'user' && (
                                            <span className="ml-1 text-blue-300">
                                                {/* Simple Read Status (can be improved with SVG icons) */}
                                                ✓{msg.read ? '✓' : ''}
                                            </span>
                                        )}
                                    </span>
                                </div>
                            </div>
                        ))}

                        {isAgentTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-200 text-gray-800 rounded-xl rounded-bl-none px-4 py-2 shadow-sm max-w-[75%]">
                                    <div className="typing-indicator flex space-x-1">
                                        <span className="dot dot-1"></span>
                                        <span className="dot dot-2"></span>
                                        <span className="dot dot-3"></span>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} /> {/* For auto-scrolling */}
                    </div>

                    {/* Chat Input */}
                    <div className="bg-gray-100 p-4 border-t border-gray-200 flex items-center gap-3">
                        {/* Emoji Button (Non-functional) */}
                        <button className="text-gray-500 hover:text-indigo-600 transition-colors text-xl p-1">
                            😊
                        </button>
                        {/* File Upload Button (Non-functional) */}
                        <button className="text-gray-500 hover:text-indigo-600 transition-colors text-xl p-1">
                            📎
                        </button>
                        <input
                            type="text"
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your message..."
                            className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700"
                        />
                        <button
                            onClick={handleSendMessage}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 transition-colors duration-200 shadow-md flex items-center justify-center text-lg"
                        >
                            <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
            {/* Typing Indicator CSS */}
           
        </div>
    );
};

export default LiveChat;