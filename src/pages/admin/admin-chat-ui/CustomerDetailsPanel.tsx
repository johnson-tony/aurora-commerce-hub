
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { ExternalLink, User } from 'lucide-react';

import { CustomerDetails, InternalNote } from '@/types/chat'; // Import from centralized types

interface CustomerDetailsPanelProps {
  customer: CustomerDetails | null;
  internalNotes: InternalNote[];
  onAddNote: (noteContent: string) => void;
}

const CustomerDetailsPanel: React.FC<CustomerDetailsPanelProps> = ({ customer, internalNotes, onAddNote }) => {
  const [newNote, setNewNote] = useState('');

  const handleAddNoteClick = () => {
    if (newNote.trim() && customer) {
      onAddNote(newNote);
      setNewNote('');
    }
  };

  if (!customer) {
    return (
      <Card className="w-80 flex-shrink-0 flex flex-col items-center justify-center h-full text-gray-500 p-4">
        <User className="w-16 h-16 mb-4 text-gray-300" />
        <p className="text-lg text-center">Customer details will appear here once a chat is selected.</p>
      </Card>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="border-b p-4 flex-shrink-0">
        <CardTitle className="text-lg font-semibold text-gray-800">Customer Details</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 p-4 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="space-y-4 pr-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Name:</p>
              <p className="text-lg font-semibold text-gray-900">{customer.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Email:</p>
              <p className="text-md text-gray-700">{customer.email}</p>
            </div>
            {customer.phone && (
              <div>
                <p className="text-sm font-medium text-gray-600">Phone:</p>
                <p className="text-md text-gray-700">{customer.phone}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-gray-600">Total Orders:</p>
              <p className="text-md text-gray-700">{customer.totalOrders}</p>
            </div>
            {customer.lastOrderDate && (
              <div>
                <p className="text-sm font-medium text-gray-600">Last Order:</p>
                <p className="text-md text-gray-700">{customer.lastOrderDate}</p>
              </div>
            )}

            <div className="border-t pt-4">
              <h3 className="text-md font-semibold mb-2 flex items-center justify-between text-gray-800">
                Order History
                <Button variant="link" size="sm" className="text-deep-indigo hover:text-indigo-700" onClick={() => console.log('View full order history for', customer.id)}>
                    View All <ExternalLink className="w-4 h-4 ml-1" />
                </Button>
              </h3>
              {customer.totalOrders > 0 ? (
                <ul className="text-sm text-gray-700 space-y-1">
                  <li>#ORD12345 (2 items, ₹599) - Delivered</li>
                  <li>#ORD12344 (1 item, ₹1200) - Processing</li>
                  {/* ... more dummy orders or fetch actual data */}
                </ul>
              ) : (
                <p className="text-sm text-gray-500">No orders yet.</p>
              )}
            </div>

            <div className="border-t pt-4">
              <h3 className="text-md font-semibold mb-2 text-gray-800">Internal Notes</h3>
              <div className="space-y-2 mb-3">
                {internalNotes.length > 0 ? (
                  internalNotes.map((note) => (
                    <div key={note.id} className="bg-blue-50 p-2 rounded-md text-sm text-gray-700 border border-blue-100">
                      <p>{note.content}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(note.timestamp).toLocaleString()} {note.adminName && `by ${note.adminName}`}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No internal notes.</p>
                )}
              </div>
              <textarea
                className="w-full p-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-deep-indigo text-sm resize-y"
                rows={3}
                placeholder="Add a new internal note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                disabled={!customer} // Disable if no customer selected
              ></textarea>
              <Button onClick={handleAddNoteClick} className="mt-2 w-full" disabled={!customer || newNote.trim() === ''}>
                Add Note
              </Button>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CustomerDetailsPanel;