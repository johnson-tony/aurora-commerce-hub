import React, { useState, useRef, useEffect, useCallback } from "react";
import Navigation from "@/components/Navigation"; // Assuming this is your navigation component
import { io, Socket } from "socket.io-client";

// Helper function to format timestamp
const formatTime = (date: Date) => {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
};

// --- Message Interface ---
interface ChatMessage {
  id: number | string;
  text: string;
  sender: "user" | "agent";
  timestamp: string;
  read?: boolean;
}

// Assume you have a User type, perhaps from your auth context
interface CurrentUser {
  id: number; // MUST be integer to match backend users.id
  name: string;
  email: string;
  phone?: string; // Optional phone number
}

const LiveChat: React.FC = () => {
  // --- User State ---
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true); // New loading state for user data

  useEffect(() => {
    // This now simulates fetching user data from an API
    const fetchUserData = async () => {
      try {
        console.log("Attempting to fetch user data...");
        const response = await fetch("http://localhost:5000/api/users");
        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("HTTP Error:", response.status, errorText);
          throw new Error(
            `HTTP error! status: ${response.status} - ${errorText}`
          );
        }

        const usersData = await response.json(); // Renamed to usersData as it's an array
        console.log("Fetched users data:", usersData);

        // Assuming you want the first user from the array as the current user
        if (usersData && usersData.length > 0) {
          const firstUser = usersData[0]; // Or find by a specific ID if you have one
          setCurrentUser({
            id: firstUser.id,
            name: firstUser.name,
            email: firstUser.email,
            phone: firstUser.phone || null,
          });
          console.log("currentUser state set:", firstUser);
        } else {
          console.warn("No user data found in the response from /api/users.");
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setCurrentUser(null);
        alert("Failed to fetch user data. Please try again.");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchUserData();
  }, []); // Empty dependency array means this runs once on component mount

  // ... rest of your LiveChat component remains the same .../ Empty dependency array means this runs once on component mount

  // --- TOP-LEVEL HOOK CALLS ---
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState("");
  const [isAgentTyping, setIsAgentTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const socketRef = useRef<Socket | null>(null);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const conversationIdRef = useRef<string | null>(null);
  const [isChatInitialized, setIsChatInitialized] = useState(false); // New state to prevent multiple initiations

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
    console.log("Raw timestamp for incoming message:", data.timestamp); // <-- ADD THIS LINE

    setMessages((prev) => {
      const newId = data.id ? data.id.toString() : Date.now().toString();

      // IMPORTANT: Add a check for valid date before formatting
      let formattedTimestamp = 'N/A'; // Default value if date is invalid
      const dateObject = new Date(data.timestamp);
      if (!isNaN(dateObject.getTime())) { // Check if the date object is valid
        formattedTimestamp = formatTime(dateObject);
      } else {
        console.warn("Invalid timestamp received for incoming message:", data.timestamp);
      }

      return [
        ...prev,
        {
          id: newId,
          text: data.content,
          sender: data.sender === "customer" ? "user" : "agent",
          timestamp: formattedTimestamp, // Use the checked and formatted timestamp
          read: data.read_by_customer,
        },
      ];
    });

    const currentConvId = conversationIdRef.current;
    if (
      data.sender === "admin" &&
      currentConvId &&
      socketRef.current &&
      socketRef.current.connected
    ) {
      socketRef.current.emit("mark_messages_read", {
        conversationId: currentConvId,
        readerType: "customer",
        messageIds: [data.id],
      });
      setMessages((prev) =>
        prev.map((msg) => (msg.id === data.id ? { ...msg, read: true } : msg))
      );
    }
  },
  [] // Empty dependency array.
);

  // Main useEffect for Socket.IO connection and event handling
  // Main useEffect for Socket.IO connection and event handling
  useEffect(() => {
    console.log("Socket useEffect running or re-running...");

    // Condition to prevent unnecessary socket connections:
    // 1. If currentUser is not yet loaded, wait.
    // 2. If chat is already initialized AND a socket connection already exists and is active, do nothing.
    if (!currentUser) {
      console.log("Waiting for user data to connect socket...");
      return;
    }

    // If currentUser IS available AND chat has already been initialized,
    // we assume the socket is already set up and we don't need to re-run the setup logic.
    // This is the key to preventing the disconnect/reconnect loop.
    if (isChatInitialized && socketRef.current?.connected) {
      console.log(
        "Chat already initialized and socket connected. Skipping full setup."
      );
      return;
    }

    // If we reach here, it means:
    // 1. currentUser is available.
    // 2. Either the chat is NOT initialized, or the socket is not connected/active.
    //    So, we proceed with initialization.

    console.log(
      "Proceeding to initialize chat/socket for user:",
      currentUser.id
    );

    const socket = io("http://localhost:5000", {
      transports: ["websocket", "polling"],
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Socket.IO connected:", socket.id);

      // Only attempt to start/rejoin chat if it hasn't been initialized yet for this user session
      // This is important because the 'connect' event might fire on re-connection attempts too.
      if (!isChatInitialized) {
        // Check state here inside 'connect' listener
        fetch("http://localhost:5000/api/chat/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: currentUser.id,
            customerName: currentUser.name,
            customerEmail: currentUser.email,
            customerPhone: currentUser.phone || null,
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
            // Set isChatInitialized to true ONLY AFTER a successful conversation ID is obtained
            setIsChatInitialized(true);

            const fetchedMessages = data.initialMessages
              ? data.initialMessages.map((msg: any) => {
                  console.log(
                    "Raw timestamp for initial message:",
                    msg.timestamp
                  ); // <-- ADD THIS LINE

                  // IMPORTANT: Add a check for valid date before formatting
                  let formattedTimestamp = "N/A"; // Default value if date is invalid
                  const dateObject = new Date(msg.timestamp);
                  if (!isNaN(dateObject.getTime())) {
                    // Check if the date object is valid
                    formattedTimestamp = formatTime(dateObject);
                  } else {
                    console.warn(
                      "Invalid timestamp received for initial message:",
                      msg.timestamp
                    );
                  }

                  return {
                    id: msg.id.toString(),
                    text: msg.content,
                    sender: msg.sender === "customer" ? "user" : "agent",
                    timestamp: formattedTimestamp, // Use the checked and formatted timestamp
                    read: msg.read_by_customer,
                  };
                })
              : [];
            setMessages(fetchedMessages);

            socket.emit("join_chat", {
              conversationId: data.conversationId,
              isAdmin: false,
            });

            // Mark unread admin messages as read upon joining/fetching
            const unreadAdminMessageIds = fetchedMessages
              .filter((msg: ChatMessage) => msg.sender === "agent" && !msg.read)
              .map((msg: ChatMessage) => Number(msg.id));

            if (unreadAdminMessageIds.length > 0) {
              socket.emit("mark_messages_read", {
                conversationId: data.conversationId,
                readerType: "customer",
                messageIds: unreadAdminMessageIds,
              });
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
            // If starting chat failed, ensure isChatInitialized is false so it can retry
            setIsChatInitialized(false);
            // Also disconnect socket if chat start failed
            socket.disconnect();
          });
      } else {
        // If already initialized but `connect` event fired (e.g. re-connection),
        // ensure we rejoin the chat room if we have a conversationId
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
    socket.on(
      "messages_read_by_admin",
      (data: { conversationId: string; messageIds: number[] }) => {
        if (data.conversationId === conversationIdRef.current) {
          setMessages((prev) =>
            prev.map((msg) =>
              data.messageIds.includes(Number(msg.id)) && msg.sender === "user"
                ? { ...msg, read: true }
                : msg
            )
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

    return () => {
      // This cleanup runs when the component unmounts OR when dependencies change AND
      // React is about to re-run the effect.
      if (socketRef.current) {
        console.log("Socket useEffect cleanup: Disconnecting socket.");
        socketRef.current.disconnect();
        socketRef.current = null; // Ensure the ref is cleared
      }
      // Note: Do NOT set isChatInitialized to false here if you want it to remain true
      // when the component is simply re-rendering for other reasons (e.g., input text changes).
      // Only set to false on full chat resolution (handleEndChat, chat_status_update resolved).
    };
    // Dependencies: currentUser is vital. handleIncomingMessage is a useCallback.
    // conversationId is also a dependency if you want the effect to react to it
    // directly for the `join_chat` or `mark_messages_read` emits, though current logic
    // handles these based on state/ref inside event listeners.
    // The key is NOT to put isChatInitialized as a dependency if its change within the effect
    // causes unwanted re-executions. We manage it with the `if (!isChatInitialized)` guard.
  }, [currentUser, handleIncomingMessage]); // Removed isChatInitialized from dependencies// Add isChatInitialized to dependencies

  const handleSendMessage = () => {
    if (inputText.trim() === "" || !conversationIdRef.current || !currentUser) {
      console.warn(
        "Message not sent: Input is empty, conversationId is missing, or user not loaded."
      );
      return;
    }

    const newMessage: ChatMessage = {
      id: Date.now(), // Temp ID for optimistic update
      text: inputText.trim(),
      sender: "user", // For frontend display
      timestamp: new Date().toISOString(), // Use ISO string for consistency
      read: true, // User's own message, so it's "read" by them immediately
    };

    if (socketRef.current && socketRef.current.connected) {
      socketRef.current.emit("send_message", {
        conversationId: conversationIdRef.current,
        content: newMessage.text,
        sender: "customer", // Send as 'customer' to backend
        userId: currentUser.id, // Pass actual user ID
        customerName: currentUser.name, // Pass actual customer name
      });
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputText("");

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
      !currentUser
    )
      return;

    socketRef.current.emit("typing", {
      conversationId: conversationIdRef.current,
      sender: "customer",
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", {
        conversationId: conversationIdRef.current,
        sender: "customer",
      });
    }, 3000);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  const handleEndChat = () => {
    if (window.confirm("Are you sure you want to end this chat?")) {
      if (conversationIdRef.current && currentUser) {
        if (socketRef.current && socketRef.current.connected) {
          socketRef.current.emit("chat_resolved_by_customer", {
            conversationId: conversationIdRef.current,
            resolvedBy: currentUser.id, // Send actual user ID
          });
          alert("Chat ended. Thank you for contacting support!");
          setMessages([]);
          setConversationId(null);
          setIsChatInitialized(false); // Allow re-initiation
          if (socketRef.current) socketRef.current.disconnect();
        } else {
          console.error(
            "Socket not connected, attempting to resolve chat via API."
          );
          fetch(
            `http://localhost:5000/api/chat/${conversationIdRef.current}/resolve`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ resolvedBy: currentUser.id }), // Send actual user ID
            }
          )
            .then((res) => {
              if (res.ok) {
                alert("Chat ended. Thank you for contacting support!");
                setMessages([]);
                setConversationId(null);
                setIsChatInitialized(false); // Allow re-initiation
                if (socketRef.current) socketRef.current.disconnect();
              } else {
                alert("Failed to end chat. Please try again.");
              }
            })
            .catch((err) => console.error("Error ending chat via API:", err));
        }
      } else {
        alert("No active chat or user not loaded to end.");
        setMessages([]);
      }
    }
  };

  // Render nothing or a loading state if currentUser is null
  if (loadingUser) {
    return (
      <div className="min-h-screen bg-soft-ivory flex flex-col items-center justify-center">
        <Navigation />
        <p className="text-gray-700">Loading user data...</p>
      </div>
    );
  }

  if (!currentUser && !loadingUser) {
    return (
      <div className="min-h-screen bg-soft-ivory flex flex-col items-center justify-center">
        <Navigation />
        <p className="text-red-700">
          Error: User data could not be loaded. Please log in.
        </p>
        {/* Optional: Add a login button here */}
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
                  // OR import it: import agentAvatar from '@/assets/agent-avatar.png'; then src={agentAvatar}
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
                    {formatTime(new Date(msg.timestamp))}{" "}
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
