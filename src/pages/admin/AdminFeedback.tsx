import React, { useState, useEffect, useRef, useCallback } from "react";
import { io, Socket } from "socket.io-client"; // Import io and Socket type

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import ChatListPanel from "./admin-chat-ui/ChatListPanel";
import ActiveChatWindow from "./admin-chat-ui/ActiveChatWindow";
import CustomerDetailsPanel from "./admin-chat-ui/CustomerDetailsPanel";
import {
  ChatConversation,
  Message,
  CustomerDetails,
  InternalNote,
} from "@/types/chat";
interface NewChatInitiatedData {
  conversationId: string;
  customerId: string;
  customerName: string;
  customerEmail?: string; // Backend might send this as optional
  customerPhone?: string;
  timestamp: string;
  totalOrders?: number; // Backend might send this as optional
  lastOrderDate?: string;
  // Any other properties the backend sends for new_chat_initiated
}
const AdminFeedback: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "active" | "pending" | "resolved" | "assigned"
  >("all");
  const socketRef = useRef<Socket | null>(null); // Change from wsRef to socketRef and type to Socket

  // State to track typing status for each conversation
  const [typingStatus, setTypingStatus] = useState<Record<string, boolean>>({});

  // Helper to update typing status for a specific conversation
  const updateTypingStatus = useCallback(
    (convId: string, isTyping: boolean) => {
      setTypingStatus((prev) => ({ ...prev, [convId]: isTyping }));
    },
    []
  );

  // --- Utility Function to update a single conversation in state ---
  const updateConversationInState = useCallback(
    (
      conversationIdToUpdate: string,
      updater: (chat: ChatConversation) => ChatConversation
    ) => {
      setConversations((prev) => {
        const updated = prev.map((chat) =>
          chat.id === conversationIdToUpdate ? updater(chat) : chat
        );
        // Sort by last message timestamp to keep recent chats at the top
        return updated.sort(
          (a, b) =>
            new Date(b.lastMessageTimestamp).getTime() -
            new Date(a.lastMessageTimestamp).getTime()
        );
      });
    },
    []
  );

  // --- Event Handlers for Socket.IO messages ---
  const handleNewMessage = useCallback(
    (data: {
      conversationId: string;
      id: number | string;
      sender: "customer" | "admin";
      content: string;
      timestamp: string;
    }) => {
      updateConversationInState(data.conversationId, (chat) => {
        const newMessage: Message = {
          id: data.id.toString(), // Ensure ID is string as per your Message interface
          sender: data.sender,
          content: data.content,
          timestamp: data.timestamp,
          read: data.sender === "customer" ? false : true, // Admin messages are read by admin
        };

        // If this message is for the currently selected chat, mark customer message as read
        if (
          data.conversationId === selectedChatId &&
          data.sender === "customer" &&
          socketRef.current
        ) {
          // We'll mark this specific message as read by admin
          socketRef.current.emit("mark_messages_read", {
            conversationId: data.conversationId,
            readerType: "admin",
            messageIds: [data.id], // Mark only the newly received message as read
          });
        }

        return {
          ...chat,
          messages: [...chat.messages, newMessage],
          lastMessageTimestamp: data.timestamp,
          // If customer sends a message and chat was pending, mark as active
          status:
            data.sender === "customer" && chat.status === "pending"
              ? "active"
              : chat.status,
        };
      });
      // Also update chat list panel to show new customer message notification if not selected
      if (
        data.sender === "customer" &&
        data.conversationId !== selectedChatId
      ) {
        // This is handled by the sorting which brings it to the top.
        // You might want a separate visual indicator like a "new message" dot
        // that gets cleared when the chat is selected.
      }
    },
    [selectedChatId, updateConversationInState]
  );

  const handleNewChatInitiated = useCallback((data: NewChatInitiatedData) => {
    // Use the new type
    // Add new chat to the list if it doesn't already exist
    setConversations((prev) => {
      if (!prev.some((chat) => chat.id === data.conversationId)) {
        return [
          {
            id: data.conversationId,
            customerId: data.customerId,
            customerName: data.customerName,
            customerEmail: data.customerEmail || "", // Provide default empty string if email can be missing
            customerPhone: data.customerPhone,
            status: "pending", // New chats are pending
            assignedTo: undefined,
            messages: [],
            lastMessageTimestamp: data.timestamp,
            totalOrders: data.totalOrders ?? 0, // Provide default 0 if totalOrders can be missing
            lastOrderDate: data.lastOrderDate,
            internalNotes: [],
          } as ChatConversation, // Explicitly cast to ChatConversation if absolutely necessary after providing defaults
          ...prev,
        ].sort(
          (a, b) =>
            new Date(b.lastMessageTimestamp).getTime() -
            new Date(a.lastMessageTimestamp).getTime()
        );
      }
      return prev;
    });
  }, []);

  const handleChatStatusUpdate = useCallback(
    (data: {
      conversationId: string;
      newStatus: string;
      assignedTo?: string;
    }) => {
      updateConversationInState(data.conversationId, (chat) => ({
        ...chat,
        status: data.newStatus as
          | "active"
          | "pending"
          | "resolved"
          | "assigned",
        assignedTo: data.assignedTo,
      }));
    },
    [updateConversationInState]
  );

  const handleCustomerTyping = useCallback(
    (data: { conversationId: string; sender: string }) => {
      if (data.sender === "customer") {
        updateTypingStatus(data.conversationId, true);
      }
    },
    [updateTypingStatus]
  );

  const handleCustomerStoppedTyping = useCallback(
    (data: { conversationId: string; sender: string }) => {
      if (data.sender === "customer") {
        updateTypingStatus(data.conversationId, false);
      }
    },
    [updateTypingStatus]
  );

  const handleMessagesReadByCustomer = useCallback(
    (data: { conversationId: string; messageIds: number[] }) => {
      console.log("Messages marked read by customer:", data.messageIds);
      updateConversationInState(data.conversationId, (chat) => ({
        ...chat,
        messages: chat.messages.map((msg) =>
          data.messageIds.includes(Number(msg.id)) && msg.sender === "admin"
            ? { ...msg, read: true } // Mark as read by customer
            : msg
        ),
      }));
    },
    [updateConversationInState]
  );

  // --- useEffect for Socket.IO connection and listeners ---
  useEffect(() => {
    // 1. Establish Socket.IO connection
    const socket = io("http://localhost:5000", {
      // Connect to your Node.js server's address and port
      transports: ["websocket", "polling"], // Ensure WebSocket is preferred
    });
    socketRef.current = socket;

    socket.on("connect", () => {
      console.log("Admin Socket.IO connected:", socket.id);
      // After connection, join the 'admin_room' or similar for global admin updates
      // (e.g., new customer chats, updates to other chats)
      socket.emit("join_admin_panel", { adminId: "your_admin_id" }); // Replace with actual admin ID
    });

    // Register all event listeners
    socket.on("new_message", handleNewMessage);
    socket.on("new_customer_message_for_admin_list", handleNewMessage); // Backend emits this for list updates
    socket.on("new_chat_initiated", handleNewChatInitiated); // If backend explicitly emits new chat initiation
    socket.on("chat_status_update", handleChatStatusUpdate);
    socket.on("user_typing", handleCustomerTyping); // Customer side emits 'typing', admin listens to 'user_typing'
    socket.on("user_stopped_typing", handleCustomerStoppedTyping); // Customer side emits 'stop_typing', admin listens to 'user_stopped_typing'
    socket.on("messages_read_by_customer", handleMessagesReadByCustomer); // Listen for customer read receipts

    socket.on("disconnect", () => console.log("Admin Socket.IO disconnected"));
    socket.on("connect_error", (err) =>
      console.error("Admin Socket.IO connection error:", err)
    );

    // Clean up Socket.IO connection on component unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [
    handleNewMessage,
    handleNewChatInitiated,
    handleChatStatusUpdate,
    handleCustomerTyping,
    handleCustomerStoppedTyping,
    handleMessagesReadByCustomer,
  ]);

  // --- useEffect to join/leave specific conversation rooms ---
  useEffect(() => {
    if (socketRef.current && selectedChatId) {
      // When a chat is selected, join its room (if not already in it)
      socketRef.current.emit("join_chat", {
        conversationId: selectedChatId,
        isAdmin: true, // This is an admin client
      });

      // Also, when an admin joins a chat, mark customer messages as read by admin
      // This is a proactive read receipt for past unread messages
      const selectedChat = conversations.find((c) => c.id === selectedChatId);
      if (selectedChat) {
        const unreadCustomerMessageIds = selectedChat.messages
          .filter((msg) => msg.sender === "customer" && !msg.read) // Assuming 'read' field on message for admin side
          .map((msg) => Number(msg.id)); // Convert to number if backend expects numbers

        if (unreadCustomerMessageIds.length > 0) {
          socketRef.current.emit("mark_messages_read", {
            conversationId: selectedChatId,
            readerType: "admin",
            messageIds: unreadCustomerMessageIds,
          });
        }
      }
    }
    // Cleanup function for when selectedChatId changes or component unmounts
    // Leave the previous room if a new one is selected or if component unmounts
    return () => {
      if (socketRef.current && selectedChatId) {
        // Note: Socket.IO doesn't have a direct 'leave' event for rooms.
        // The server manages disconnections or can have a custom 'leave_chat' event.
        // For now, simply changing selectedChatId handles the implicit room change for the admin.
      }
    };
  }, [selectedChatId, conversations]); // Added conversations to dependencies for `find`

  // --- Fetch initial conversations on mount (once) ---
  useEffect(() => {
    fetch("http://localhost:5000/api/chat/conversations")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        // Ensure messages have a 'read' status for the admin view
        const formattedConversations = data.map((conv: any) => ({
          ...conv,
          messages: conv.messages.map((msg: any) => ({
            id: msg.id,
            sender: msg.sender,
            content: msg.content,
            timestamp: msg.timestamp,
            read: msg.sender === "customer" ? msg.read_by_admin : true, // Customer messages are read_by_admin for admin view
          })),
        }));
        setConversations(formattedConversations);
      })
      .catch((err) =>
        console.error("Failed to fetch initial conversations:", err)
      );
  }, []); // Empty dependency array means this runs only once on mount

  // --- Message Input Handling ---
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMessageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessageInput(value);

    if (!selectedChatId || !socketRef.current || !socketRef.current.connected)
      return;

    // Emit typing event
    socketRef.current.emit("typing", {
      conversationId: selectedChatId,
      sender: "admin",
    });

    // Clear previous timeout and set a new one
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      socketRef.current?.emit("stop_typing", {
        conversationId: selectedChatId,
        sender: "admin",
      });
    }, 3000); // Stop typing after 3 seconds of no input
  };

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedChatId) {
      const selectedChat = conversations.find(
        (chat) => chat.id === selectedChatId
      );
      if (!selectedChat || selectedChat.status === "resolved") {
        console.warn(
          "Cannot send message: Chat not selected or already resolved."
        );
        return;
      }

      const newMessage: Message = {
        id: `temp_${Date.now()}`, // Temp ID, backend will assign final
        sender: "admin",
        content: messageInput.trim(),
        timestamp: new Date().toISOString(),
        read: true, // Admin messages are always read by admin immediately
      };

      // Send message via WebSocket
      if (socketRef.current && socketRef.current.connected) {
        socketRef.current.emit("send_message", {
          conversationId: selectedChatId,
          content: newMessage.content,
          sender: "admin",
          // Potentially include admin ID/name from authenticated user
          adminId: "admin_user_1", // Replace with actual admin ID
        });

        // Optimistic update
        setConversations((prevConversations) =>
          prevConversations
            .map((chat) =>
              chat.id === selectedChatId
                ? {
                    ...chat,
                    messages: [...chat.messages, newMessage],
                    lastMessageTimestamp: newMessage.timestamp,
                    status: chat.status === "pending" ? "active" : chat.status,
                    assignedTo: chat.assignedTo || "admin_user_1", // Auto-assign if not assigned
                  }
                : chat
            )
            .sort(
              (a, b) =>
                new Date(b.lastMessageTimestamp).getTime() -
                new Date(a.lastMessageTimestamp).getTime()
            )
        );
        setMessageInput("");

        // Clear typing timeout and send stop typing immediately
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = null;
        }
        socketRef.current.emit("stop_typing", {
          conversationId: selectedChatId,
          sender: "admin",
        });
      } else {
        console.error("Admin Socket.IO not connected. Cannot send message.");
        // Potentially show an error to the user
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleAddNote = (noteContent: string) => {
    if (selectedChatId && noteContent.trim()) {
      fetch(`/api/chat/${selectedChatId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: noteContent,
          adminId: "current_admin_id",
          adminName: "Current Admin",
        }),
      })
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((newNote) => {
          updateConversationInState(selectedChatId, (chat) => ({
            ...chat,
            internalNotes: [...chat.internalNotes, newNote],
          }));
        })
        .catch((err) => console.error("Failed to add note:", err));
    }
  };

  const handleAssignChat = (chatId: string) => {
    // You'll need to send the actual admin ID/name here
    const adminId = "your_admin_id"; // Replace with the actual authenticated admin's ID
    const adminName = "Current Admin"; // Replace with the actual authenticated admin's name

    fetch(`/api/chat/${chatId}/assign`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ assignedTo: adminId }), // Send admin ID
    })
      .then((res) => {
        if (res.ok) {
          updateConversationInState(chatId, (chat) => ({
            ...chat,
            assignedTo: adminId,
            status: "assigned",
          }));
          alert(`Chat ${chatId} assigned to ${adminName}.`);
        } else {
          alert("Failed to assign chat.");
        }
      })
      .catch((err) => console.error("Error assigning chat:", err));
  };

  const handleResolveChat = (chatId: string) => {
    if (window.confirm(`Are you sure you want to resolve chat ${chatId}?`)) {
      fetch(`/api/chat/${chatId}/resolve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      })
        .then((res) => {
          if (res.ok) {
            updateConversationInState(chatId, (chat) => ({
              ...chat,
              status: "resolved",
              assignedTo: undefined, // Clear assignment on resolve
            }));
            setSelectedChatId(null); // Deselect the chat
            alert(`Chat ${chatId} marked as resolved.`);
          } else {
            alert("Failed to resolve chat.");
          }
        })
        .catch((err) => console.error("Error resolving chat:", err));
    }
  };

  const filteredConversations = conversations
    .filter((chat) => {
      const matchesSearch =
        searchTerm === "" ||
        chat.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        chat.messages.some((msg) =>
          msg.content.toLowerCase().includes(searchTerm.toLowerCase())
        );

      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "assigned"
          ? chat.assignedTo === "your_admin_id"
          : chat.status === filterStatus); // Match with actual admin ID

      return matchesSearch && matchesStatus;
    })
    .sort(
      (a, b) =>
        new Date(b.lastMessageTimestamp).getTime() -
        new Date(a.lastMessageTimestamp).getTime()
    );

    const customerDetailsForPanel: CustomerDetails | null = selectedChatId
      ? (() => {
          // Use an IIFE (Immediately Invoked Function Expression) or a helper variable
          const foundChat = conversations.find((c) => c.id === selectedChatId);
          if (foundChat) {
            // Map relevant properties to the CustomerDetails interface
            return {
              id: foundChat.customerId, // Use customerId for CustomerDetails ID if it matches
              name: foundChat.customerName,
              email: foundChat.customerEmail,
              phone: foundChat.customerPhone,
              totalOrders: foundChat.totalOrders,
              lastOrderDate: foundChat.lastOrderDate,
            };
          }
          return null; // Return null if chat is not found
        })()
      : null;

    return (
      <div className="p-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Chat Management
        </h2>
        <div className="flex h-[calc(100vh-200px)] p-4 space-x-4 bg-gray-100 rounded-lg shadow-inner">
          <ChatListPanel
            conversations={filteredConversations}
            selectedChatId={selectedChatId}
            onSelectChat={(chatId) => {
              setSelectedChatId(chatId);
              // Mark messages as read when selecting a chat
              // This is handled in the useEffect that watches selectedChatId
            }}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
            typingStatus={typingStatus} // Pass typing status
          />

          <ActiveChatWindow
            selectedChat={
              selectedChatId
                ? conversations.find((c) => c.id === selectedChatId)
                : null
            }
            messageInput={messageInput}
            onMessageInputChange={handleMessageInputChange} // Use new handler
            onSendMessage={handleSendMessage}
            onAssignChat={handleAssignChat}
            onResolveChat={handleResolveChat}
            isCustomerTyping={
              selectedChatId ? typingStatus[selectedChatId] || false : false
            } // Pass typing status
          />

          <CustomerDetailsPanel
            customer={customerDetailsForPanel} // <--- Pass it directly here!
            internalNotes={
              selectedChatId
                ? conversations.find((c) => c.id === selectedChatId)
                    ?.internalNotes || []
                : []
            }
            onAddNote={handleAddNote}
          />
        </div>
      </div>
    );
};

export default AdminFeedback;
