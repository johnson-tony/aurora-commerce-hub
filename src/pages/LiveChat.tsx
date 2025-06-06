// D:\aurora-commerce-hub\src\pages\LiveChat.tsx

import React, { useState, useRef, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation";
import { io, Socket } from "socket.io-client";
import { useAuth } from "../context/AuthContext"; // Path should be relative from src/pages/ to src/context/

// --- Helper Functions ---

// Helper function to parse a date string into a Date object
// This is now more robust for ISO 8601 strings received from backend.
const parseDateTimeString = (dtString: string): Date | null => {
  if (!dtString || typeof dtString !== "string") {
    return null; // Handle null, undefined, or non-string inputs gracefully
  }

  // Attempt to parse using Date constructor.
  // It natively handles ISO 8601 strings (like "2024-06-06T09:41:03.945Z")
  // and can also handle 'YYYY-MM-DD HH:MM:SS' in most environments,
  // though ISO is preferred for consistency.
  const dateObject = new Date(dtString);

  if (!isNaN(dateObject.getTime())) {
    return dateObject;
  } else {
    // If native parsing fails, log a warning
    console.warn("Could not parse date string:", dtString);
    return null; // Return null if parsing fails
  }
};

// Helper function to format a Date object into "HH:MM"
const formatTime = (date: Date | null): string => {
  if (!date || isNaN(date.getTime())) {
    return "N/A"; // Or an empty string, or 'Invalid Time'
  }
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// --- Message Interface ---
interface ChatMessage {
  id: number | string;
  text: string;
  sender: "user" | "agent";
  timestamp: string; // This will now store the formatted string
  read?: boolean;
}

// User type from AuthContext
// This interface should ideally be imported from AuthContext.tsx or a shared types file.
// For now, let's keep it here, but consider moving it.
interface AuthUser {
  id: number; // MUST be integer to match backend users.id
  name: string;
  email: string;
  // phone?: string | null; // Removed as requested
}

const LiveChat: React.FC = () => {
  const { user, loadingAuth, isAuthenticated } = useAuth();

  // --- TOP-LEVEL HOOK CALLS ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  // Using a ref for conversationId to ensure `handleIncomingMessage` always has the latest without re-creating
  const conversationIdRef = useRef<string | null>(null);
  const [isChatInitialized, setIsChatInitialized] = useState(false); // Prevents multiple chat initiations

  // This useEffect updates the ref whenever conversationId state changes
  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle incoming messages - use useCallback with correct dependencies
  const handleIncomingMessage = useCallback(
    (data: any) => {
      console.log("RECEIVED new_message DATA (Frontend):", data); // Added for debugging
      console.log("Sender in received data:", data.sender);
      console.log("Content in received data:", data.content);
      console.log("Raw timestamp for incoming message:", data.timestamp);

      setMessages((prev) => {
        const newId = data.id ? data.id.toString() : Date.now().toString();

        let formattedTimestamp: string = "N/A";
        const dateObject = parseDateTimeString(data.timestamp); // Use the robust parser

        if (dateObject) {
          formattedTimestamp = formatTime(dateObject);
        } else {
          console.warn(
            "Failed to parse incoming message timestamp (after parsing attempt):",
            data.timestamp
          );
        }

        const newMessage: ChatMessage = {
          id: newId,
          text: data.content,
          sender: data.sender === "customer" ? "user" : "agent",
          timestamp: formattedTimestamp,
          read: data.read_by_customer, // Use the read_by_customer status directly
        };

        // If the incoming message is from the agent and we are on the customer side,
        // mark it as read by the customer immediately and emit to backend.
        // This is done here to ensure the UI updates reflect the read status immediately.
        if (
          newMessage.sender === "agent" &&
          conversationIdRef.current &&
          socketRef.current?.connected
        ) {
          socketRef.current.emit("mark_messages_read", {
            conversationId: conversationIdRef.current,
            readerType: "customer",
            messageIds: [Number(newMessage.id)], // Ensure ID is number for backend
          });
          // Optimistically mark as read in UI
          newMessage.read = true; // Mark as read by customer
        }

        return [...prev, newMessage];
      });
    },
    [] // Empty dependency array, as dependencies are accessed via refs or are stable
  );

  // Main useEffect for Socket.IO connection and event handling
  useEffect(() => {
    console.log("Socket useEffect running or re-running...");

    if (loadingAuth) {
      console.log("Waiting for user authentication to complete...");
      return; // Wait until auth loading is complete
    }

    // Handle logout scenario or unauthenticated state
    if (!user) {
      console.log("User not logged in, ensuring socket is disconnected.");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setMessages([]); // Clear messages on logout
      setConversationId(null);
      setIsChatInitialized(false);
      return;
    }

    // Prevent multiple socket connections/chat initiations if already running for the current user
    if (isChatInitialized && socketRef.current?.connected) {
      console.log(
        "Chat already initialized and socket connected. Skipping full setup."
      );
      return;
    }

    console.log("Initializing chat/socket for user:", user.id);

    const socket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
      // Add a timeout for connection if needed
      // timeout: 5000,
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket.IO connected:", socket.id);

      // Only attempt to start/rejoin chat if it hasn't been initialized yet for this session
      // or if conversationId is null (meaning a fresh start needed)
      if (!isChatInitialized || !conversationId) {
        fetch("http://localhost:5000/api/chat/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            customerName: user.name,
            customerEmail: user.email,
          }),
        })
          .then((res) => {
            if (!res.ok) {
              return res.text().then((text) => {
                console.error(
                  "API /api/chat/start responded with non-OK status:",
                  res.status,
                  text
                );
                throw new Error(
                  `HTTP error! status: ${res.status} - ${text.substring(
                    0,
                    100
                  )}...`
                );
              });
            }
            return res.json();
          })
          .then((data) => {
            console.log("Chat started/rejoined response:", data);
            setConversationId(data.conversationId);
            setIsChatInitialized(true); // Mark as initialized upon successful conversation ID

            const fetchedMessages = data.initialMessages
              ? data.initialMessages.map((msg: any) => {
                  console.log(
                    "Raw timestamp for initial message:",
                    msg.timestamp
                  );
                  const dateObject = parseDateTimeString(msg.timestamp);
                  const formattedTimestamp = dateObject
                    ? formatTime(dateObject)
                    : "N/A";

                  return {
                    id: msg.id.toString(),
                    text: msg.content,
                    sender: msg.sender === "customer" ? "user" : "agent",
                    timestamp: formattedTimestamp,
                    read: msg.read_by_customer, // Use the boolean directly
                  };
                })
              : [];
            setMessages(fetchedMessages);

            // Join the conversation room via socket
            socket.emit("join_chat", {
              conversationId: data.conversationId,
              isAdmin: false,
            });

            // Mark unread admin messages as read upon joining/fetching if there are any
            const unreadAdminMessageIds = fetchedMessages
              .filter((msg: ChatMessage) => msg.sender === "agent" && !msg.read)
              .map((msg: ChatMessage) => Number(msg.id)); // Ensure ID is number

            if (unreadAdminMessageIds.length > 0) {
              socket.emit("mark_messages_read", {
                conversationId: data.conversationId,
                readerType: "customer",
                messageIds: unreadAdminMessageIds,
              });
              // Optimistically update UI
              setMessages((prev) =>
                prev.map((msg) =>
                  unreadAdminMessageIds.includes(Number(msg.id))
                    ? { ...msg, read: true }
                    : msg
                )
              );
            }
          })
          .catch((err) => {
            console.error("Failed to start/rejoin chat via API:", err);
            setIsChatInitialized(false); // Allow retry on failure
            socket.disconnect(); // Disconnect socket if API failed
          });
      } else {
        // If already initialized and reconnected, just rejoin the room
        if (conversationIdRef.current) {
          socket.emit("join_chat", {
            conversationId: conversationIdRef.current,
            isAdmin: false,
          });
          console.log(
            "Socket reconnected, rejoining chat room:",
            conversationIdRef.current
          );
        }
      }
    });

    // Socket.IO event listeners
    socket.on("new_message", handleIncomingMessage);
    socket.on(
      "user_typing",
      (data: { conversationId: string; sender: string }) => {
        if (
          data.sender === "admin" &&
          data.conversationId === conversationIdRef.current
        ) {
          setIsAgentTyping(true);
        }
      }
    );
    socket.on(
      "user_stopped_typing",
      (data: { conversationId: string; sender: string }) => {
        if (
          data.sender === "admin" &&
          data.conversationId === conversationIdRef.current
        ) {
          setIsAgentTyping(false);
        }
      }
    );
    // Event when admin marks customer messages as read
    socket.on(
      "messages_read_by_admin",
      (data: { conversationId: string; messageIds?: number[] }) => {
        if (data.conversationId === conversationIdRef.current) {
          setMessages((prev) =>
            prev.map((msg) => {
              // If messageIds are provided, only mark those. Otherwise, mark all user messages.
              const shouldMark = data.messageIds
                ? data.messageIds.includes(Number(msg.id))
                : msg.sender === "user";
              return shouldMark && msg.sender === "user"
                ? { ...msg, read: true }
                : msg;
            })
          );
        }
      }
    );
    socket.on(
      "chat_status_update",
      (data: { conversationId: string; newStatus: string }) => {
        if (
          data.conversationId === conversationIdRef.current &&
          data.newStatus === "resolved"
        ) {
          alert(
            `The support agent has resolved this chat. Thank you for contacting support!`
          );
          setMessages([]);
          setConversationId(null);
          setIsChatInitialized(false); // Allow re-initiation
          socketRef.current?.disconnect();
          socketRef.current = null; // Clear ref on full resolution
        }
      }
    );

    socket.on("disconnect", () => console.log("Socket.IO disconnected"));
    socket.on("connect_error", (err) =>
      console.error("Socket.IO connection error:", err)
    );

    // Cleanup function: disconnect socket when component unmounts or effect re-runs
    return () => {
      if (socketRef.current) {
        console.log("Socket useEffect cleanup: Disconnecting socket.");
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, loadingAuth, handleIncomingMessage, conversationId]); // Add conversationId to dependencies for rejoining on reconnect

  const handleSendMessage = () => {
    if (inputText.trim() === "" || !conversationIdRef.current || !user) {
      console.warn(
        "Message not sent: Input is empty, conversationId is missing, or user not loaded."
      );
      return;
    }

    const now = new Date();
    const formattedNow = formatTime(now);

    const newMessage: ChatMessage = {
      id: Date.now(), // Temp ID for optimistic update, will be replaced by backend ID
      text: inputText.trim(),
      sender: "user", // For frontend display
      timestamp: formattedNow,
      read: true, // User's own message, read by them immediately
    };

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("send_message", {
        conversationId: conversationIdRef.current,
        content: newMessage.text,
        sender: "customer", // Send as 'customer' to backend
        userId: user.id,
        customerName: user.name,
        customerEmail: user.email,
      });
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputText("");

      // Ensure stop_typing is sent after message
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
      socketRef.current.emit("stop_typing", {
        conversationId: conversationIdRef.current,
        sender: "customer",
      });
    } else {
      console.error("Socket.IO not connected. Cannot send message.");
    }
  };

  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInputText(value);

    if (
      !conversationIdRef.current ||
      !socketRef.current ||
      !socketRef.current.connected ||
      !user
    )
      return;

    // Only emit 'typing' if it's the first character or after a timeout
    if (!typingTimeoutRef.current) {
      socketRef.current.emit("typing", {
        conversationId: conversationIdRef.current,
        sender: "customer",
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", {
        conversationId: conversationIdRef.current,
        sender: "customer",
      });
      typingTimeoutRef.current = null; // Clear timeout ref once stopped
    }, 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleEndChat = () => {
    if (window.confirm("Are you sure you want to end this chat?")) {
      if (conversationIdRef.current && user) {
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit("chat_resolved_by_customer", {
            conversationId: conversationIdRef.current,
            resolvedBy: user.id,
          });
          // Optimistically update UI
          alert("Chat ended. Thank you for contacting support!");
          setMessages([]);
          setConversationId(null);
          setIsChatInitialized(false);
          if (socketRef.current) {
            socketRef.current.disconnect();
            socketRef.current = null;
          }
        } else {
          console.error(
            "Socket not connected, attempting to resolve chat via API."
          );
          // Fallback to API if socket is not connected
          fetch(
            `http://localhost:5000/api/chat/${conversationIdRef.current}/resolve`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ resolvedBy: user.id }),
            }
          )
            .then((res) => {
              if (res.ok) {
                alert("Chat ended. Thank you for contacting support!");
                setMessages([]);
                setConversationId(null);
                setIsChatInitialized(false);
                if (socketRef.current) socketRef.current.disconnect();
              } else {
                alert("Failed to end chat. Please try again.");
              }
            })
            .catch((err) => console.error("Error ending chat via API:", err));
        }
      } else {
        alert("No active chat or user not loaded to end.");
        setMessages([]); // Clear messages anyway
      }
    }
  };

  // Render nothing or a loading state if user is null
  if (loadingAuth) {
    return (
      <div className="min-h-screen bg-soft-ivory flex flex-col items-center justify-center">
        <Navigation />
        <p className="text-gray-700">Loading user authentication...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-soft-ivory flex flex-col items-center justify-center">
        <Navigation />
        <p className="text-red-700">
          You must be logged in to access the chat.
        </p>
        {/* Optional: Add a login button/link here */}
      </div>
    );
  }

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
                  src="/agent-avatar.png" // Assuming it's in your public folder
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
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`flex flex-col max-w-[75%] ${
                    msg.sender === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div
                    className={`rounded-xl px-4 py-2 shadow-sm relative ${
                      msg.sender === "user"
                        ? "bg-indigo-500 text-white rounded-br-none"
                        : "bg-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                  >
                    <p className="text-sm">{msg.text}</p>
                  </div>
                  <span className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    {msg.timestamp}{" "}
                    {/* Display the already formatted timestamp */}
                    {msg.sender === "user" && (
                      <span className="ml-1 text-blue-300">
                        ✓{msg.read ? "✓" : ""}
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
              onChange={handleInputTextChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 p-3 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-700"
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputText.trim() || !conversationIdRef.current}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-full p-3 transition-colors duration-200 shadow-md flex items-center justify-center text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                className="w-5 h-5 transform rotate-90"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                ></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveChat;
