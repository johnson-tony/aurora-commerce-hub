// src/pages/admin/admin-chat-ui/ConversationListItem.tsx
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, User, Clock, CheckCircle } from 'lucide-react';
import { ChatConversation } from '@/types/chat'; // Import from centralized types

interface ConversationListItemProps {
  chat: ChatConversation;
  isSelected: boolean;
  onClick: (chatId: string) => void;
}

const ConversationListItem: React.FC<ConversationListItemProps> = ({ chat, isSelected, onClick }) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const statusBadge = () => {
    let text = '';
    let bgColor = '';
    let textColor = '';
    let Icon = null;

    switch (chat.status) {
      case 'pending':
        text = 'Pending';
        bgColor = 'bg-orange-100';
        textColor = 'text-orange-800';
        Icon = Clock;
        break;
      case 'active':
        text = 'Active';
        bgColor = 'bg-green-100';
        textColor = 'text-green-800';
        Icon = MessageSquare;
        break;
      case 'assigned':
        text = `Assigned (${chat.assignedTo || 'Me'})`;
        bgColor = 'bg-purple-100';
        textColor = 'text-purple-800';
        Icon = User;
        break;
      case 'resolved':
        text = 'Resolved';
        bgColor = 'bg-gray-100';
        textColor = 'text-gray-600';
        Icon = CheckCircle;
        break;
      default:
        return null;
    }

    return (
      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex items-center ${bgColor} ${textColor} mr-2`}>
        {Icon && <Icon className="w-3 h-3 mr-1" />}
        {text}
      </span>
    );
  };

  const lastMessageContent = chat.messages.length > 0
    ? chat.messages[chat.messages.length - 1].content
    : 'No messages yet.';

  return (
    <div
      className={`flex items-center p-3 mb-2 rounded-lg cursor-pointer transition-colors duration-200
        ${isSelected ? 'bg-blue-100 border border-blue-300' : 'hover:bg-gray-50 border border-transparent'}
      `}
      onClick={() => onClick(chat.id)}
    >
      <div className="flex-shrink-0 mr-3">
        <Avatar className="h-10 w-10">
          {/* Using a placeholder image service for initials */}
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${chat.customerName}`} alt={chat.customerName} />
          <AvatarFallback>{chat.customerName.charAt(0).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 overflow-hidden">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-charcoal-gray truncate">{chat.customerName}</h3>
          <span className="text-xs text-gray-500 ml-2 flex-shrink-0">
            {formatTimestamp(chat.lastMessageTimestamp)}
          </span>
        </div>
        <p className="text-sm text-gray-600 truncate">{lastMessageContent}</p>
        <div className="flex items-center mt-1">
          {statusBadge()}
        </div>
      </div>
    </div>
  );
};

export default ConversationListItem;