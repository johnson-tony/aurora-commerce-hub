// src/pages/admin/AdminFeedback.tsx
import React, { useState, useEffect } from 'react';
import AdminLayout from '@/layouts/AdminLayout'; // Your existing admin layout
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'; // Example Shadcn UI components

// Import the new chat UI components from their new location
import ChatListPanel from './admin-chat-ui/ChatListPanel';
import ActiveChatWindow from './admin-chat-ui/ActiveChatWindow';
import CustomerDetailsPanel from './admin-chat-ui/CustomerDetailsPanel';

// Import types from the centralized types folder
import { ChatConversation, Message, CustomerDetails, InternalNote } from '@/types/chat';

// --- DUMMY DATA (for Chat Functionality) ---
// This data will live here since the chat state is now part of AdminFeedback.tsx
const DUMMY_CONVERSATIONS: ChatConversation[] = [
  {
    id: 'chat_001',
    customerId: 'cust_abc',
    customerName: 'Alice Smith',
    customerEmail: 'alice.s@example.com',
    customerPhone: '9876543210',
    status: 'pending',
    assignedTo: undefined,
    messages: [
      { id: 'msg1', sender: 'customer', content: 'Hi, I have a question about my recent order #XYZ789.', timestamp: new Date(Date.now() - 60000 * 5).toISOString() },
      { id: 'msg2', sender: 'customer', content: 'The tracking seems stuck. Can you check?', timestamp: new Date(Date.now() - 60000 * 4).toISOString() },
    ],
    lastMessageTimestamp: new Date(Date.now() - 60000 * 4).toISOString(),
    totalOrders: 3,
    lastOrderDate: '2025-05-20',
    internalNotes: [
      { id: 'note1', content: 'Customer seems anxious about delivery times.', timestamp: new Date(Date.now() - 60000 * 10).toISOString(), adminName: 'Dev Admin' },
    ],
  },
  {
    id: 'chat_002',
    customerId: 'cust_def',
    customerName: 'Bob Johnson',
    customerEmail: 'bob.j@example.com',
    customerPhone: '9988776655',
    status: 'active',
    assignedTo: 'Current Admin',
    messages: [
      { id: 'msg3', sender: 'customer', content: 'Hello, I want to change my shipping address for order #ABC123.', timestamp: new Date(Date.now() - 60000 * 30).toISOString() },
      { id: 'msg4', sender: 'admin', content: 'Sure, I can help with that. Could you please confirm the new address?', timestamp: new Date(Date.now() - 60000 * 28).toISOString() },
      { id: 'msg5', sender: 'customer', content: 'It should be 123 Main St, Anytown, 12345.', timestamp: new Date(Date.now() - 60000 * 25).toISOString() },
      { id: 'msg6', sender: 'admin', content: 'Got it. Please wait while I update this for you.', timestamp: new Date(Date.now() - 60000 * 20).toISOString() },
    ],
    lastMessageTimestamp: new Date(Date.now() - 60000 * 20).toISOString(),
    totalOrders: 1,
    lastOrderDate: '2025-06-01',
    internalNotes: [],
  },
  {
    id: 'chat_003',
    customerId: 'cust_ghi',
    customerName: 'Charlie Brown',
    customerEmail: 'charlie.b@example.com',
    status: 'resolved',
    assignedTo: 'Another Admin',
    messages: [
      { id: 'msg7', sender: 'customer', content: 'My coupon code is not working.', timestamp: new Date(Date.now() - 60000 * 120).toISOString() },
      { id: 'msg8', sender: 'admin', content: 'Please provide the code and I can check it for you.', timestamp: new Date(Date.now() - 60000 * 118).toISOString() },
      { id: 'msg9', sender: 'customer', content: 'It\'s DISCOUNT15.', timestamp: new Date(Date.now() - 60000 * 110).toISOString() },
      { id: 'msg10', sender: 'admin', content: 'Ah, that code has expired. I\'ve applied a new 10% discount for you instead!', timestamp: new Date(Date.now() - 60000 * 105).toISOString() },
    ],
    lastMessageTimestamp: new Date(Date.now() - 60000 * 105).toISOString(),
    totalOrders: 5,
    lastOrderDate: '2025-04-10',
    internalNotes: [
        { id: 'note2', content: 'Customer initially confused with similar coupon codes. Provided goodwill discount.', timestamp: new Date(Date.now() - 60000 * 90).toISOString(), adminName: 'Another Admin' }
    ],
  },
  {
    id: 'chat_004',
    customerId: 'cust_jkl',
    customerName: 'Diana Prince',
    customerEmail: 'diana.p@example.com',
    status: 'pending',
    assignedTo: undefined,
    messages: [
        { id: 'msg11', sender: 'customer', content: 'I need to return an item. What\'s the process?', timestamp: new Date(Date.now() - 60000 * 15).toISOString() },
    ],
    lastMessageTimestamp: new Date(Date.now() - 60000 * 15).toISOString(),
    totalOrders: 2,
    lastOrderDate: '2025-05-01',
    internalNotes: [],
  }
];

const AdminFeedback: React.FC = () => { // KEEP YOUR EXISTING COMPONENT NAME
  // --- EXISTING FEEDBACK PAGE STATE AND LOGIC HERE ---
  // For example:
  const [feedbackList, setFeedbackList] = useState<string[]>(['Great app!', 'Bug found in checkout.']);
  const [newFeedback, setNewFeedback] = useState('');

  const handleSubmitFeedback = () => {
    if (newFeedback.trim()) {
      setFeedbackList([...feedbackList, newFeedback.trim()]);
      setNewFeedback('');
      alert('Feedback submitted!');
    }
  };
  // ---------------------------------------------------


  // --- NEW CHAT FUNCTIONALITY STATE AND LOGIC ---
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'pending' | 'resolved' | 'assigned'>('all');

  // Simulate fetching chat data on component mount
  useEffect(() => {
    setConversations(DUMMY_CONVERSATIONS);
  }, []);

  const selectedChat = selectedChatId
    ? conversations.find((chat) => chat.id === selectedChatId)
    : null;

  const handleSendMessage = () => {
    if (messageInput.trim() && selectedChatId && selectedChat && selectedChat.status !== 'resolved') {
      const newMessage: Message = {
        id: `msg_${Date.now()}`,
        sender: 'admin',
        content: messageInput.trim(),
        timestamp: new Date().toISOString(),
      };

      setConversations((prevConversations) =>
        prevConversations.map((chat) =>
          chat.id === selectedChatId
            ? {
                ...chat,
                messages: [...chat.messages, newMessage],
                lastMessageTimestamp: newMessage.timestamp,
                status: chat.status === 'pending' ? 'active' : chat.status,
                assignedTo: chat.assignedTo || 'Current Admin',
              }
            : chat
        )
      );
      setMessageInput('');
      console.log('Simulating sending message:', newMessage);
    }
  };

  const handleAddNote = (noteContent: string) => {
    if (selectedChatId) {
      const newNote: InternalNote = {
        id: `note_${Date.now()}`,
        content: noteContent,
        timestamp: new Date().toISOString(),
        adminName: 'Current Admin',
      };
      setConversations((prevConversations) =>
        prevConversations.map((chat) =>
          chat.id === selectedChatId
            ? {
                ...chat,
                internalNotes: [...chat.internalNotes, newNote],
              }
            : chat
        )
      );
      console.log('Simulating adding internal note:', newNote);
    }
  };

  const handleAssignChat = (chatId: string) => {
    setConversations((prevConversations) =>
      prevConversations.map((chat) =>
        chat.id === chatId
          ? { ...chat, assignedTo: 'Current Admin', status: 'assigned' }
          : chat
      )
    );
    alert(`Chat ${chatId} assigned to Current Admin.`);
    console.log(`Simulating chat ${chatId} assigned to Current Admin.`);
  };

  const handleResolveChat = (chatId: string) => {
    setConversations((prevConversations) =>
      prevConversations.map((chat) =>
        chat.id === chatId
          ? { ...chat, status: 'resolved', assignedTo: undefined }
          : chat
      )
    );
    setSelectedChatId(null);
    alert(`Chat ${chatId} marked as resolved.`);
    console.log(`Simulating chat ${chatId} marked as resolved.`);
  };

  const filteredConversations = conversations.filter(chat => {
    const matchesSearch = searchTerm === '' ||
                          chat.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          chat.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          chat.messages.some(msg => msg.content.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = filterStatus === 'all' ||
                          (filterStatus === 'assigned' ? chat.assignedTo === 'Current Admin' : chat.status === filterStatus);

    return matchesSearch && matchesStatus;
  }).sort((a, b) => new Date(b.lastMessageTimestamp).getTime() - new Date(a.lastMessageTimestamp).getTime());

  const customerDetailsForPanel: CustomerDetails | null = selectedChat ? {
    id: selectedChat.customerId,
    name: selectedChat.customerName,
    email: selectedChat.customerEmail,
    phone: selectedChat.customerPhone,
    totalOrders: selectedChat.totalOrders,
    lastOrderDate: selectedChat.lastOrderDate,
  } : null;
  // ----------------------------------------------


  return (
   
      <div className="p-4">
       
        {/* NEW: Admin Chat Management Section */}
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Chat Management</h2>
        <div className="flex h-[calc(100vh-200px)] p-4 space-x-4 bg-gray-100 rounded-lg shadow-inner"> {/* Adjusted height to fit within the page */}
          <ChatListPanel
            conversations={filteredConversations}
            selectedChatId={selectedChatId}
            onSelectChat={setSelectedChatId}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filterStatus={filterStatus}
            onFilterStatusChange={setFilterStatus}
          />

          <ActiveChatWindow
            selectedChat={selectedChat}
            messageInput={messageInput}
            onMessageInputChange={setMessageInput}
            onSendMessage={handleSendMessage}
            onAssignChat={handleAssignChat}
            onResolveChat={handleResolveChat}
          />

          <CustomerDetailsPanel
            customer={customerDetailsForPanel}
            internalNotes={selectedChat ? selectedChat.internalNotes : []}
            onAddNote={handleAddNote}
          />
        </div>
      </div>

  );
};

export default AdminFeedback;