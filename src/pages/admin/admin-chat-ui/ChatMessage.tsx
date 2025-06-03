// src/pages/admin/admin-chat-ui/ChatMessage.tsx
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Message } from '@/types/chat'; // Import from centralized types

interface ChatMessageProps {
  message: Message;
  isAdminView: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isAdminView }) => {
  const isCustomer = message.sender === 'customer';
  const messageAlignmentClass = isCustomer ? 'justify-start' : 'justify-end';
  const bubbleColorClass = isCustomer
    ? 'bg-gray-200 text-gray-800'
    : 'bg-deep-indigo text-white'; // Assuming 'deep-indigo' is a color defined in your tailwind config

  const bubbleBorderRadius = isCustomer
    ? 'rounded-br-lg rounded-tl-lg rounded-tr-lg'
    : 'rounded-bl-lg rounded-tl-lg rounded-tr-lg';

  const senderName = isCustomer ? 'Customer' : 'You';

  return (
    <div className={`flex ${messageAlignmentClass} mb-4`}>
      {isCustomer && (
        <Avatar className="h-8 w-8 mr-2 flex-shrink-0">
          {/* Using a placeholder image service for initials */}
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.sender}`} alt={senderName} />
          <AvatarFallback>CU</AvatarFallback>
        </Avatar>
      )}

      <div className={`flex flex-col max-w-[70%] ${isCustomer ? 'items-start' : 'items-end'}`}>
        <div className="flex items-center mb-1">
          <span className="text-xs text-gray-500">{senderName}</span>
          <span className="text-xs text-gray-400 ml-2">
            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        <div className={`p-3 text-sm shadow-sm ${bubbleColorClass} ${bubbleBorderRadius}`}>
          {message.content}
        </div>
      </div>

      {!isCustomer && (
        <Avatar className="h-8 w-8 ml-2 flex-shrink-0">
          {/* Using a placeholder image service for initials */}
          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${message.sender}`} alt={senderName} />
          <AvatarFallback>AD</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
};

export default ChatMessage;