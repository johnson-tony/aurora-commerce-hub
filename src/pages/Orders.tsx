import React, { useState } from 'react';
import Navigation from '@/components/Navigation';
import { useNavigate } from 'react-router-dom';

// Placeholder for useToast (replace with your actual Shadcn useToast import and implementation)
const useToast = () => {
    return {
        toast: ({ title, description, variant }: { title: string; description: string; variant: "default" | "success" | "destructive" }) => {
            console.log(`Toast: ${title} - ${description} (Variant: ${variant})`);
            // In a real app, you'd use shadcnToast({ title, description, variant }) here.
        }
    };
};

// --- Mock Data Structures (moved up to be accessible by both components) ---
interface OrderItem {
    productId: string;
    name: string;
    quantity: number;
    price: number;
    imageUrl: string;
}

type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled' | 'Refunded';

interface Order {
    id: string;
    date: string; // e.g., "YYYY-MM-DD"
    total: number;
    status: OrderStatus;
    items: OrderItem[];
    shippingAddress: string; // Simplified for mock
    paymentMethod: string; // Simplified for mock
}

// --- Helper to get status badge styling (can be defined once for both) ---
const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
        case 'Delivered': return 'bg-green-100 text-green-800';
        case 'Shipped': return 'bg-blue-100 text-blue-800';
        case 'Processing': return 'bg-yellow-100 text-yellow-800';
        case 'Pending': return 'bg-gray-100 text-gray-800';
        case 'Cancelled': return 'bg-red-100 text-red-800';
        case 'Refunded': return 'bg-purple-100 text-purple-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// --- Internal OrderDetailsModal Component ---
interface OrderDetailsModalProps {
    order: Order;
    onClose: () => void;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
    // Note: getStatusBadge is accessible here because it's defined at the same scope or higher
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 relative m-4 md:m-0">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                    &times;
                </button>

                <h2 className="text-2xl font-bold text-charcoal-gray mb-4">Order Details: {order.id}</h2>

                <div className="mb-4 flex justify-between items-center border-b pb-3">
                    <div>
                        <p className="text-gray-600">Placed on: <span className="font-medium text-gray-800">{order.date}</span></p>
                        <p className="text-gray-600">Total: <span className="font-bold text-lg text-green-700">${order.total.toFixed(2)}</span></p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(order.status)}`}>
                        {order.status}
                    </span>
                </div>

                <div className="mb-4">
                    <h3 className="font-semibold text-lg text-gray-700 mb-2">Items</h3>
                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2"> {/* Scrollable for many items */}
                        {order.items.map(item => (
                            <div key={item.productId} className="flex items-center gap-4 bg-gray-50 p-3 rounded-md">
                                <img src={item.imageUrl} alt={item.name} className="w-16 h-16 object-cover rounded-md border border-gray-200" />
                                <div className="flex-1">
                                    <p className="font-medium text-gray-800 text-base">{item.name}</p>
                                    <p className="text-sm text-gray-600">Qty: {item.quantity} | Unit Price: ${item.price.toFixed(2)}</p>
                                </div>
                                <p className="font-semibold text-gray-900">${(item.quantity * item.price).toFixed(2)}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-4">
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Shipping Information</h3>
                        <p>{order.shippingAddress}</p>
                    </div>
                    <div>
                        <h3 className="font-semibold text-lg mb-2">Payment Method</h3>
                        <p>{order.paymentMethod}</p>
                    </div>
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={onClose}
                        className="bg-gray-200 text-gray-800 py-2 px-5 rounded-md hover:bg-gray-300 transition-colors font-medium"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- Mock Orders Data ---
const initialMockOrders: Order[] = [
    {
        id: 'ORD-001',
        date: '2024-05-28',
        total: 250.00,
        status: 'Delivered',
        items: [
            { productId: 'prod-A', name: 'Premium Coffee Beans (250g)', quantity: 2, price: 25.00, imageUrl: 'https://via.placeholder.com/150/FF5733/FFFFFF?text=Coffee' },
            { productId: 'prod-B', name: 'Espresso Machine', quantity: 1, price: 200.00, imageUrl: 'https://via.placeholder.com/150/33FF57/FFFFFF?text=Machine' },
            { productId: 'prod-X', name: 'Coffee Filters', quantity: 1, price: 10.00, imageUrl: 'https://via.placeholder.com/150/3357FF/FFFFFF?text=Filter' },
        ],
        shippingAddress: '123 Main St, Bengaluru',
        paymentMethod: 'Credit Card',
    },
    {
        id: 'ORD-002',
        date: '2024-06-01',
        total: 50.00,
        status: 'Processing',
        items: [
            { productId: 'prod-C', name: 'Ceramic Coffee Mug', quantity: 4, price: 12.50, imageUrl: 'https://via.placeholder.com/150/F0F0F0/000000?text=Mug' },
        ],
        shippingAddress: '456 Oak Ave, Mysuru',
        paymentMethod: 'UPI',
    },
    {
        id: 'ORD-003',
        date: '2024-06-03',
        total: 12.00,
        status: 'Pending',
        items: [
            { productId: 'prod-D', name: 'Milk Frother', quantity: 1, price: 12.00, imageUrl: 'https://via.placeholder.com/150/800080/FFFFFF?text=Frother' },
        ],
        shippingAddress: '789 Pine Ln, Chennai',
        paymentMethod: 'Net Banking',
    },
    {
        id: 'ORD-004',
        date: '2024-05-15',
        total: 80.00,
        status: 'Shipped',
        items: [
            { productId: 'prod-E', name: 'French Press (Medium)', quantity: 1, price: 40.00, imageUrl: 'https://via.placeholder.com/150/FFA500/FFFFFF?text=FrenchPress' },
            { productId: 'prod-F', name: 'Coffee Grinder', quantity: 1, price: 40.00, imageUrl: 'https://via.placeholder.com/150/00FFFF/000000?text=Grinder' },
        ],
        shippingAddress: '101 Cedar St, Hyderabad',
        paymentMethod: 'Credit Card',
    },
    {
        id: 'ORD-005',
        date: '2024-05-10',
        total: 30.00,
        status: 'Cancelled',
        items: [
            { productId: 'prod-G', name: 'Reusable Coffee Filter', quantity: 3, price: 10.00, imageUrl: 'https://via.placeholder.com/150/FF00FF/FFFFFF?text=Filter' },
        ],
        shippingAddress: '222 Birch St, Pune',
        paymentMethod: 'Debit Card',
    },
];

// --- Main Orders Component ---
const Orders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>(initialMockOrders);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { toast } = useToast();
    const navigate = useNavigate(); // Keep for "Start Shopping" button

    // --- View Details Functionality (Modal) ---
    const handleViewDetails = (order: Order) => {
        setSelectedOrder(order);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedOrder(null);
    };

    // --- Reorder Functionality ---
    const handleReorder = (order: Order) => {
        console.log(`Reordering items from Order ID: ${order.id}`);
        order.items.forEach(item => {
            console.log(`Adding ${item.quantity} x ${item.name} (Product ID: ${item.productId}) to cart.`);
            // In a real app: add to global cart state/context or call API
        });

        toast({
            title: "Reorder Successful!",
            description: `Items from Order #${order.id} have been added to your cart.`,
            variant: "success",
        });

        // Optionally navigate to cart or checkout
        // navigate('/cart');
    };

    // --- Cancel Order Functionality ---
    const handleCancelOrder = (orderId: string) => {
        if (window.confirm(`Are you sure you want to cancel Order ID: ${orderId}? This action cannot be undone.`)) {
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.id === orderId && ['Pending', 'Processing'].includes(order.status)
                        ? { ...order, status: 'Cancelled' }
                        : order
                )
            );
            toast({
                title: "Order Cancelled",
                description: `Order #${orderId} has been successfully cancelled.`,
                variant: "default",
            });
            console.log(`Order ID: ${orderId} cancelled.`);
        }
    };

    return (
        <div className="min-h-screen bg-soft-ivory">
            <Navigation />
            <div className="max-w-7xl mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold text-charcoal-gray mb-8">My Orders</h1>

                {orders.length === 0 ? (
                    <div className="p-6 bg-white rounded-lg shadow-sm text-center">
                        <p className="text-gray-600 text-lg mb-4">You haven't placed any orders yet.</p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-indigo-600 text-white py-2 px-5 rounded-md hover:bg-indigo-700 font-medium transition-colors"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white p-4 rounded-lg shadow-md border border-gray-200">
                                <div className="flex justify-between items-center mb-3">
                                    <div>
                                        <h2 className="text-lg font-semibold text-charcoal-gray">Order ID: {order.id}</h2>
                                        <p className="text-xs text-gray-600">Placed on: {order.date}</p>
                                    </div>
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                                        {order.status}
                                    </span>
                                </div>

                                <div className="text-gray-700 mb-3">
                                    <p className="font-medium">Total: <span className="text-base font-bold">${order.total.toFixed(2)}</span></p>
                                    <p className="text-sm text-gray-600">Items: {order.items.reduce((sum, item) => sum + item.quantity, 0)}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-100">
                                    <button
                                        onClick={() => handleViewDetails(order)}
                                        className="bg-indigo-500 text-white py-1.5 px-3 rounded-md hover:bg-indigo-600 transition-colors font-medium text-xs"
                                    >
                                        View Details
                                    </button>

                                    {order.status === 'Delivered' && (
                                        <button
                                            onClick={() => handleReorder(order)}
                                            className="bg-purple-500 text-white py-1.5 px-3 rounded-md hover:bg-purple-600 transition-colors font-medium text-xs"
                                        >
                                            Reorder
                                        </button>
                                    )}

                                    {['Pending', 'Processing'].includes(order.status) && (
                                        <button
                                            onClick={() => handleCancelOrder(order.id)}
                                            className="bg-red-500 text-white py-1.5 px-3 rounded-md hover:bg-red-600 transition-colors font-medium text-xs"
                                        >
                                            Cancel
                                        </button>
                                    )}

                                    {['Shipped', 'Processing'].includes(order.status) && (
                                        <button
                                            className="border border-gray-300 text-gray-700 py-1.5 px-3 rounded-md hover:bg-gray-100 transition-colors font-medium text-xs"
                                        >
                                            Track
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Order Details Modal - Conditionally rendered */}
            {isModalOpen && selectedOrder && (
                <OrderDetailsModal order={selectedOrder} onClose={handleCloseModal} />
            )}
        </div>
    );
};

export default Orders;