// C:\xampp\htdocs\aurora-commerce-hub\src\pages\admin\AdminOrders.tsx

import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Eye, Trash2, ArrowUpDown, Calendar, Download } from 'lucide-react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import AdminLayout from '@/layouts/AdminLayout';

// Assuming these UI components exist in your project
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// --- Type Definitions (Keep these as they are) ---
interface OrderItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  email: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  orderDate: string;
}

// --- Mock Data for Orders (Keep these as they are) ---
const DUMMY_ORDERS: Order[] = [
  {
    id: '#ORD-001234',
    customer: 'Sarah Johnson',
    email: 'sarah.j@example.com',
    items: [
      { productId: 'prod1', name: 'Acoustic Guitar Pro', quantity: 1, price: 499.99 },
      { productId: 'prod5', name: 'Portable Mini Projector', quantity: 1, price: 189.99 },
    ],
    total: 689.98,
    status: 'shipped',
    orderDate: '2025-05-28T10:30:00Z',
  },
  {
    id: '#ORD-001235',
    customer: 'Mike Chen',
    email: 'mike.chen@example.com',
    items: [
      { productId: 'prod2', name: 'Vintage Leather Backpack', quantity: 1, price: 129.00 },
    ],
    total: 129.00,
    status: 'processing',
    orderDate: '2025-05-29T14:15:00Z',
  },
  {
    id: '#ORD-001236',
    customer: 'Emily Davis',
    email: 'emily.d@example.com',
    items: [
      { productId: 'prod3', name: 'Smart Home Speaker X2', quantity: 2, price: 79.99 },
    ],
    total: 159.98,
    status: 'delivered',
    orderDate: '2025-05-27T08:00:00Z',
  },
  {
    id: '#ORD-001237',
    customer: 'James Wilson',
    email: 'james.w@example.com',
    items: [
      { productId: 'prod4', name: 'Artisan Ceramic Mug Set', quantity: 1, price: 34.50 },
      { productId: 'prod6', name: 'Yoga Mat Eco-Friendly', quantity: 1, price: 39.99 },
    ],
    total: 74.49,
    status: 'pending',
    orderDate: '2025-05-26T17:45:00Z',
  },
  {
    id: '#ORD-001238',
    customer: 'Alice Brown',
    email: 'alice.b@example.com',
    items: [
      { productId: 'prod1', name: 'Acoustic Guitar Pro', quantity: 1, price: 499.99 },
    ],
    total: 499.99,
    status: 'processing',
    orderDate: '2025-05-29T11:00:00Z',
  },
  {
    id: '#ORD-001239',
    customer: 'Bob Green',
    email: 'bob.g@example.com',
    items: [
      { productId: 'prod5', name: 'Portable Mini Projector', quantity: 2, price: 189.99 },
    ],
    total: 379.98,
    status: 'shipped',
    orderDate: '2025-05-25T09:20:00Z',
  },
];

// --- Zod Schema for Order Form Validation (Keep these as they are) ---
const orderFormSchema = z.object({
  customer: z.string().min(1, { message: 'Customer name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  status: z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),
});

type OrderFormInputs = z.infer<typeof orderFormSchema>;

// --- AdminOrders Component ---
const AdminOrders = () => {
  const [orders, setOrders] = useState<Order[]>(DUMMY_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('orderDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // State for the inline order detail/edit panel
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  const [isEditingDetails, setIsEditingDetails] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // React Hook Form setup for the order details/edit form
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<OrderFormInputs>({
    resolver: zodResolver(orderFormSchema),
  });

  // Effect to update the form when a new order is selected for viewing
  useEffect(() => {
    if (selectedOrder) {
      reset({
        customer: selectedOrder.customer,
        email: selectedOrder.email,
        status: selectedOrder.status,
      });
      setIsEditingDetails(false); // Always start in view mode
    } else {
      reset(); // Clear form when no order is selected
    }
  }, [selectedOrder, reset]);

  // Utility function for status badge colors
  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Memoized filtered and sorted orders for performance
  const filteredAndSortedOrders = useMemo(() => {
    let currentOrders = [...orders];

    if (searchTerm) {
      currentOrders = currentOrders.filter(order =>
        order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterStatus !== 'all') {
      currentOrders = currentOrders.filter(order => order.status === filterStatus);
    }

    currentOrders.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'orderDate') {
        comparison = new Date(a.orderDate).getTime() - new Date(b.orderDate).getTime();
      } else if (sortBy === 'total') {
        comparison = a.total - b.total;
      }
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return currentOrders;
  }, [orders, searchTerm, filterStatus, sortBy, sortDirection]);

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortDirection('asc');
    }
  };

  const getSortIndicator = (column: string) => {
    if (sortBy === column) {
      return sortDirection === 'asc' ? ' ↑' : ' ↓';
    }
    return '';
  };

  // --- Handlers for Delete and Inline Detail Panel ---
  const handleViewOrderClick = (order: Order) => {
    setSelectedOrder(order);
    setIsViewingDetails(true);
    setIsEditingDetails(false); // Always start in view mode
  };

  const handleCloseDetails = () => {
    setIsViewingDetails(false);
    setSelectedOrder(null);
    setIsEditingDetails(false);
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm(`Are you sure you want to delete order ${orderId}? This action cannot be undone.`)) {
      setOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
      console.log(`Dummy Delete: Order with ID ${orderId} deleted.`);
      if (selectedOrder && selectedOrder.id === orderId) {
        handleCloseDetails(); // Close panel if the deleted order was being viewed
      }
    }
  };

  const onSubmitUpdate: SubmitHandler<OrderFormInputs> = (data) => {
    if (selectedOrder) {
      const updatedOrder: Order = {
        ...selectedOrder,
        customer: data.customer,
        email: data.email,
        status: data.status,
      };
      setOrders(prevOrders => prevOrders.map(o => (o.id === updatedOrder.id ? updatedOrder : o)));
      setSelectedOrder(updatedOrder); // Update selectedOrder to reflect changes in view mode
      console.log("Dummy Update Order (from panel):", updatedOrder);
      setIsEditingDetails(false); // Exit edit mode
    }
  };

  // --- New Handler for In-Table Status Change ---
  const handleStatusChangeInTable = (orderId: string, newStatus: Order['status']) => {
    setOrders(prevOrders => prevOrders.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ));
    // If the changed order is currently selected in the detail panel, update it there too
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
    console.log(`Order ${orderId} status changed to ${newStatus}`);
  };


  return (
    <div className="min-h-screen bg-soft-ivory font-poppins text-charcoal-gray relative">
      

      <div className={`max-w-7xl mx-auto px-4 py-8 ${isViewingDetails ? 'pr-md-80' : ''}`}>
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-4xl sm:text-5xl font-extrabold text-charcoal-gray">Order Management</h1>
            <p className="text-gray-600 mt-1">Manage and track all customer orders.</p>
          </div>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export Orders
          </Button>
        </div>

        {/* Search and Filter Bar */}
        <Card className="p-6 mb-6 bg-white flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full sm:max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Search orders by ID, customer, email..."
              className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300 focus:ring-deep-indigo focus:border-deep-indigo"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="relative w-full sm:max-w-[180px]">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full pl-10">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="shipped">Shipped</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Orders Table */}
        <Card className="bg-white p-0 overflow-hidden">
          {filteredAndSortedOrders.length === 0 ? (
            <p className="p-8 text-center text-gray-600">No orders found matching your criteria.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items Count
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-deep-indigo transition-colors"
                      onClick={() => handleSort('total')}
                    >
                      Total {getSortIndicator('total')}
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:text-deep-indigo transition-colors"
                      onClick={() => handleSort('orderDate')}
                    >
                      Date {getSortIndicator('orderDate')}
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAndSortedOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-charcoal-gray">
                        {order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-charcoal-gray">{order.customer}</div>
                        <div className="text-sm text-gray-500">{order.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                        {order.items.length}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-charcoal-gray">
                        ${order.total.toFixed(2)}
                      </td>
                      {/* --- MODIFIED: In-Table Status Dropdown --- */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Select
                          value={order.status}
                          onValueChange={(newStatus: Order['status']) =>
                            handleStatusChangeInTable(order.id, newStatus)
                          }
                        >
                          <SelectTrigger className={`w-[140px] h-9 ${getStatusColor(order.status)}`}>
                            <SelectValue>
                              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="processing">Processing</SelectItem>
                            <SelectItem value="shipped">Shipped</SelectItem>
                            <SelectItem value="delivered">Delivered</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </td>
                      {/* --- END MODIFIED --- */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(order.orderDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-deep-indigo hover:bg-deep-indigo/10"
                            onClick={() => handleViewOrderClick(order)}
                            title="View Order Details"
                          >
                            <Eye className="w-5 h-5" />
                            <span className="sr-only">View Order {order.id}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-coral-pink hover:bg-coral-pink/10"
                            onClick={() => handleDeleteOrder(order.id)}
                            title="Delete Order"
                          >
                            <Trash2 className="w-5 h-5" />
                            <span className="sr-only">Delete Order {order.id}</span>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {/* --- Order Detail/Edit Panel (Inline) --- */}
      {isViewingDetails && selectedOrder && (
        <div
          className={`fixed inset-y-0 right-0 z-40 w-full max-w-md bg-white shadow-lg flex flex-col transform transition-transform duration-300
            ${isViewingDetails ? 'translate-x-0' : 'translate-x-full'}`}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-2xl font-bold text-charcoal-gray">
              Order: {selectedOrder.id}
            </h2>
            <Button variant="ghost" size="icon" onClick={handleCloseDetails}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit(onSubmitUpdate)} className="space-y-6">
              {/* Customer Info */}
              <div className="space-y-2">
                <Label htmlFor="customer" className="flex items-center text-charcoal-gray">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user w-4 h-4 mr-2"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> Customer Name
                </Label>
                {isEditingDetails ? (
                  <>
                    <Input id="customer" {...register('customer')} />
                    {errors.customer && (
                      <p className="text-red-500 text-sm">{errors.customer.message}</p>
                    )}
                  </>
                ) : (
                  <p className="text-lg font-medium text-gray-800">{selectedOrder.customer}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center text-charcoal-gray">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-mail w-4 h-4 mr-2"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg> Customer Email
                </Label>
                {isEditingDetails ? (
                  <>
                    <Input id="email" {...register('email')} />
                    {errors.email && (
                      <p className="text-red-500 text-sm">{errors.email.message}</p>
                    )}
                  </>
                ) : (
                  <p className="text-lg font-medium text-gray-800">{selectedOrder.email}</p>
                )}
              </div>

              {/* Order Status (in detail panel) */}
              <div className="space-y-2">
                <Label htmlFor="status" className="flex items-center text-charcoal-gray">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-truck w-4 h-4 mr-2"><path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2"/><path d="M18 17h2a2 2 0 0 0 2-2v-4a2 2 0 0 0-2-2h-2"/><circle cx="7" cy="17" r="2"/><path d="M17 17h2"/><circle cx="17" cy="17" r="2"/></svg> Order Status
                </Label>
                {isEditingDetails ? (
                  <>
                    <Select onValueChange={(value: Order['status']) => setValue('status', value)}
                            defaultValue={selectedOrder.status}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.status && (
                      <p className="text-red-500 text-sm">{errors.status.message}</p>
                    )}
                  </>
                ) : (
                  <Badge className={getStatusColor(selectedOrder.status) + " text-lg px-3 py-1.5"}>
                    {selectedOrder.status.charAt(0).toUpperCase() + selectedOrder.status.slice(1)}
                  </Badge>
                )}
              </div>

              {/* Order Details (Read-only) */}
              <h3 className="text-xl font-semibold text-charcoal-gray mt-8 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-list w-5 h-5 mr-2"><path d="M16.4 8.4V4.6c0-.66-.44-1.2-1-1.2H9.6c-.56 0-1 .54-1 1.2v3.8"/><path d="M8 2h8a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2Z"/><path d="M12 11h4"/><path d="M8 15h4"/></svg> Order Summary
              </h3>
              <div className="space-y-4">
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-calendar w-5 h-5 mr-2 text-gray-600"><rect width="18" height="18" x="3" y="4" rx="2" ry="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg>
                  <span className="font-medium">Order Date:</span>
                  <span className="ml-auto text-gray-700">
                    {new Date(selectedOrder.orderDate).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-dollar-sign w-5 h-5 mr-2 text-gray-600"><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                  <span className="font-medium">Total Amount:</span>
                  <span className="ml-auto text-xl font-bold text-deep-indigo">
                    ${selectedOrder.total.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-list w-5 h-5 mr-2 text-gray-600"><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
                  <span className="font-medium">Total Items:</span>
                  <span className="ml-auto text-gray-700">{selectedOrder.items.length}</span>
                </div>
              </div>

              {/* Product Items in Order */}
              <h3 className="text-xl font-semibold text-charcoal-gray mt-8 mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-package w-5 h-5 mr-2"><path d="m7.5 4.27 9 5.16"/><path d="M2.5 8.65 12 3l9.5 5.65"/><path d="m17.5 19.73-9-5.16"/><path d="m2.5 15.35 9.5 5.65 9.5-5.65"/><path d="M12 3v18"/></svg> Products
              </h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-soft-ivory p-3 rounded-md">
                    <div className="flex-1">
                      <p className="font-medium text-charcoal-gray">{item.name}</p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-deep-indigo">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              {/* Actions for Edit Mode */}
              {isEditingDetails && (
                <div className="flex justify-end space-x-2 mt-8">
                  <Button variant="outline" type="button" onClick={() => { setIsEditingDetails(false); reset(); }}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-save w-4 h-4 mr-2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z"/><path d="M17 21v-8H7v8"/><path d="M7 3v4h4"/></svg> Save Changes
                  </Button>
                </div>
              )}
            </form>
          </div>

          {/* Footer actions (Edit button) */}
          {!isEditingDetails && selectedOrder && (
            <div className="p-6 border-t flex justify-end">
              <Button onClick={() => setIsEditingDetails(true)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-edit w-4 h-4 mr-2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.37 2.63a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/></svg> Edit Order
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminOrders;