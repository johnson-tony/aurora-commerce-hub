// src/pages/admin/admin-chat-ui/ConversationListItem.tsx
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
// Import only necessary icons. 'MessageSquare', 'User', 'Clock', 'CheckCircle' are used in statusBadge
import { MessageSquare, User, Clock, CheckCircle, Check } from "lucide-react";
import { ChatConversation } from "@/types/chat"; // Import from centralized types

interface ConversationListItemProps {
  chat: ChatConversation;
  isSelected: boolean;
  onClick: (chatId: string) => void;
  // Prop to indicate if the customer in this chat is currently typing
  isCustomerTyping?: boolean; // Make it optional if not all parent components will provide it
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({
  chat,
  isSelected,
  onClick,
  isCustomerTyping = false, // Default to false if not provided
}) => {
  // --- Helper to format timestamps more gracefully ---
  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "Just now"; // Less than 1 minute
    if (diffSeconds < 3600) return `${Math.floor(diffSeconds / 60)}m ago`; // Less than 1 hour
    if (diffSeconds < 86400) return `${Math.floor(diffSeconds / 3600)}h ago`; // Less than 24 hours
    if (diffSeconds < 86400 * 7)
      return `${Math.floor(diffSeconds / 86400)}d ago`; // Less than 7 days

    // For older messages, show a simple date
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  // --- Determine status badge details ---
  const StatusBadge: React.FC = () => {
    let text = "";
    let bgColor = "";
    let textColor = "";
    let Icon: React.ElementType | null = null; // Use React.ElementType for component type

    switch (chat.status) {
      case "pending":
        text = "Pending";
        bgColor = "bg-orange-100";
        textColor = "text-orange-800";
        Icon = Clock;
        break;
      case "active":
        text = "Active";
        bgColor = "bg-green-100";
        textColor = "text-green-800";
        Icon = MessageSquare;
        break;
      case "assigned":
        // Display admin name if available, otherwise just 'Assigned'
        text = `Assigned${chat.assignedTo ? ` (${chat.assignedTo})` : ""}`;
        bgColor = "bg-purple-100";
        textColor = "text-purple-800";
        Icon = User;
        break;
      case "resolved":
        text = "Resolved";
        bgColor = "bg-gray-100";
        textColor = "text-gray-600";
        Icon = CheckCircle;
        break;
      default:
        return null; // Don't render a badge if status is unknown or not handled
    }

    return (
      <span
        className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center ${bgColor} ${textColor} mr-2`}
      >
        {Icon && <Icon className="w-3 h-3 mr-1" />}
        {text}
      </span>
    );
  };

  const lastMessage = chat.messages[chat.messages.length - 1];
  const lastMessageContent = lastMessage
    ? lastMessage.content
    : "No messages yet.";

  // Calculate unread customer messages (messages sent by customer that admin hasn't read)
  const unreadCustomerMessagesCount = chat.messages.filter(
    (msg) => msg.sender === "customer" && !msg.read
  ).length;

  // Determine if the last message sent by admin has been read by the customer
  const lastAdminMessageReadByCustomer =
    lastMessage && lastMessage.sender === "admin" && lastMessage.read;

  return (
    <div
      className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition-colors duration-200
        ${
          isSelected
            ? "bg-blue-100 border border-blue-300"
            : "hover:bg-gray-50 border border-transparent"
        }
      `}
      onClick={() => onClick(chat.id)}
    >
      <div className="flex-shrink-0 mr-3">
        <Avatar className="h-10 w-10">
          <AvatarImage
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${chat.customerName}`}
            alt={chat.customerName}
          />
          <AvatarFallback>
            {chat.customerName.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center mb-0.5">
          <h3 className="font-semibold text-charcoal-gray truncate">
            {chat.customerName}
          </h3>
          {chat.lastMessageTimestamp && ( // Only show timestamp if there's a last message
            <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
              {formatTimestamp(chat.lastMessageTimestamp)}
            </span>
          )}
        </div>

        {/* Display typing indicator or last message */}
        {isCustomerTyping ? (
          <p className="text-sm text-blue-600 font-medium italic">Typing...</p>
        ) : (
          <p className="text-sm text-gray-600 truncate">{lastMessageContent}</p>
        )}

        <div className="flex items-center mt-1">
          <StatusBadge />
          {unreadCustomerMessagesCount > 0 &&
            !isSelected && ( // Show unread count only if not selected and there are unread messages
              <span className="ml-auto bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {unreadCustomerMessagesCount}
              </span>
            )}
          {lastAdminMessageReadByCustomer && ( // Show read receipt for admin's last message
            <Check
              className="w-4 h-4 text-blue-500 ml-auto"
             
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationListItem;
