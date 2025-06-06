// D:\aurora-commerce-hub\src\types\chat.d.ts

export interface Message {
  id: string;
  sender: "customer" | "admin";
  content: string;
  timestamp: string; // ISO string
  read: boolean;
}

export interface InternalNote {
  id: string;
  content: string;
  timestamp: string; // ISO string
  adminId?: string;
  adminName?: string;
}

export interface CustomerDetails {
  id: string;
  name: string;
  email?: string; // Make optional
  phone?: string;
  totalOrders?: number; // Make optional
  lastOrderDate?: string; // ISO string or 'YYYY-MM-DD'
}

export interface ChatConversation {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail?: string; // Make optional
  customerPhone?: string;
  status: "active" | "pending" | "resolved" | "assigned";
  assignedTo?: string; // Admin ID or Name
  messages: Message[];
  lastMessageTimestamp: string; // ISO string
  totalOrders?: number; // Make optional
  lastOrderDate?: string;
  internalNotes: InternalNote[];
}
