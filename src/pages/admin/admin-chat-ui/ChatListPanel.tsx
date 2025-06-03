// src/pages/admin/admin-chat-ui/ChatListPanel.tsx
import React from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search } from 'lucide-react';
import ConversationListItem from './ConversationListItem'; // Local import from the same folder

import { ChatConversation } from '@/types/chat'; // Import from centralized types

interface ChatListPanelProps {
  conversations: ChatConversation[];
  selectedChatId: string | null;
  onSelectChat: (chatId: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  filterStatus: 'all' | 'active' | 'pending' | 'resolved' | 'assigned';
  onFilterStatusChange: (status: 'all' | 'active' | 'pending' | 'resolved' | 'assigned') => void;
}

const ChatListPanel: React.FC<ChatListPanelProps> = ({
  conversations,
  selectedChatId,
  onSelectChat,
  searchTerm,
  onSearchChange,
  filterStatus,
  onFilterStatusChange,
}) => {
  const pendingChatsCount = conversations.filter(c => c.status === 'pending').length;

  return (
    <Card className="w-80 flex-shrink-0 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">Conversations</h2>
        {pendingChatsCount > 0 && (
          <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
            {pendingChatsCount} New
          </span>
        )}
      </div>
      <div className="p-4 border-b">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search chats..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Select value={filterStatus} onValueChange={onFilterStatusChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Conversations</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="assigned">Assigned to Me</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <ScrollArea className="flex-1 overflow-y-auto">
        {conversations.length > 0 ? (
          <div className="p-2">
            {conversations.map((chat) => (
              <ConversationListItem
                key={chat.id}
                chat={chat}
                isSelected={selectedChatId === chat.id}
                onClick={onSelectChat}
              />
            ))}
          </div>
        ) : (
          <p className="p-4 text-gray-500 text-center">No conversations found.</p>
        )}
      </ScrollArea>
    </Card>
  );
};

export default ChatListPanel;