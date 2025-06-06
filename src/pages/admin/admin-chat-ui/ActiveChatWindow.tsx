// src/pages/admin/admin-chat-ui/ActiveChatWindow.tsx
import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { User, Send, XCircle, MessageSquare } from "lucide-react";
import ChatMessage from "./ChatMessage"; // Local import from the same folder

import { ChatConversation } from "@/types/chat"; // Import from centralized types

interface ActiveChatWindowProps {
  selectedChat: ChatConversation | null;
  messageInput: string;
  // CHANGE THIS LINE: Now expects a React.ChangeEvent<HTMLInputElement>
  onMessageInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSendMessage: () => void;
  onAssignChat: (chatId: string) => void;
  onResolveChat: (chatId: string) => void;
  isCustomerTyping: boolean; // Add this prop back if it was removed in previous steps.
  // It was defined in the parent (AdminFeedback) and used in ConversationListItem
  // But was missing in ActiveChatWindowProps
}

const ActiveChatWindow: React.FC<ActiveChatWindowProps> = ({
  selectedChat,
  messageInput,
  onMessageInputChange, // Now accepts the event
  onSendMessage,
  onAssignChat,
  onResolveChat,
  isCustomerTyping, // Destructure the new prop
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [selectedChat?.id, selectedChat?.messages.length]);

  const chatIsResolved = selectedChat?.status === "resolved";

  if (!selectedChat) {
    return (
      <Card className="flex-1 flex flex-col items-center justify-center h-full text-gray-500">
        <MessageSquare className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg">Select a conversation to start chatting.</p>
      </Card>
    );
  }

  return (
    <Card className="flex-1 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between flex-shrink-0">
        <h2 className="text-xl font-semibold text-gray-800">
          {selectedChat.customerName}
        </h2>
        <div className="flex space-x-2">
          {(selectedChat.status === "pending" || !selectedChat.assignedTo) && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onAssignChat(selectedChat.id)}
              disabled={chatIsResolved}
            >
              <User className="w-4 h-4 mr-2" /> Assign to Me
            </Button>
          )}
          {!chatIsResolved && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onResolveChat(selectedChat.id)}
            >
              <XCircle className="w-4 h-4 mr-2" /> Resolve Chat
            </Button>
          )}
          {chatIsResolved && (
            <span className="text-sm text-gray-500 flex items-center">
              <XCircle className="w-4 h-4 mr-1" /> Chat Resolved
            </span>
          )}
        </div>
      </div>
      <ScrollArea className="flex-1 p-4 overflow-y-auto">
        <div className="flex flex-col">
          {selectedChat.messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              isAdminView={true}
            />
          ))}
          {/* Display typing indicator here */}
          {isCustomerTyping && (
            <p className="text-sm text-blue-600 font-medium italic mt-2 animate-pulse">
              Customer is typing...
            </p>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>
      <div className="p-4 border-t flex items-center space-x-2 flex-shrink-0">
        <Input
          placeholder={
            chatIsResolved
              ? "Chat is resolved. Cannot send messages."
              : "Type your message..."
          }
          className="flex-1"
          value={messageInput}
          onChange={onMessageInputChange} // This is now correct!
          onKeyPress={(e) => e.key === "Enter" && onSendMessage()}
          disabled={chatIsResolved}
        />
        <Button
          onClick={onSendMessage}
          disabled={chatIsResolved || messageInput.trim() === ""}
        >
          {" "}
          {/* Disable send if empty */}
          <Send className="w-5 h-5" />
          <span className="sr-only">Send message</span>
        </Button>
      </div>
    </Card>
  );
};

export default ActiveChatWindow;
