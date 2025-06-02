
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  ShoppingCart, 
  DollarSign, 
  Package, 
  TrendingUp, 
  TrendingDown,
  Eye,
  MoreVertical,
  Calendar,
  Download
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const AdminDashboard = () => {
  const [dateRange, setDateRange] = useState('7d');

  // Mock data for dashboard
  const stats = {
    totalUsers: { value: 12847, change: 12.5, trend: 'up' },
    totalSales: { value: 324750, change: 8.2, trend: 'up' },
    ordersToday: { value: 186, change: -3.1, trend: 'down' },
    activeProducts: { value: 2431, change: 5.7, trend: 'up' }
  };

  const recentOrders = [
    {
      id: '#ORD-001234',
      customer: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      items: 3,
      total: 289.99,
      status: 'shipped',
      date: '2025-01-15'
    },
    {
      id: '#ORD-001235',
      customer: 'Mike Chen',
      email: 'mike.chen@email.com',
      items: 1,
      total: 199.99,
      status: 'processing',
      date: '2025-01-15'
    },
    {
      id: '#ORD-001236',
      customer: 'Emily Davis',
      email: 'emily.d@email.com',
      items: 2,
      total: 129.98,
      status: 'delivered',
      date: '2025-01-14'
    },
    {
      id: '#ORD-001237',
      customer: 'James Wilson',
      email: 'james.w@email.com',
      items: 1,
      total: 79.99,
      status: 'pending',
      date: '2025-01-14'
    }
  ];

  const topProducts = [
    {
      id: 1,
      name: 'Premium Wireless Headphones',
      category: 'Electronics',
      sales: 234,
      revenue: 69966,
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 2,
      name: 'Designer Leather Jacket',
      category: 'Fashion',
      sales: 189,
      revenue: 37611,
      image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 3,
      name: 'Modern Table Lamp',
      category: 'Home Decor',
      sales: 156,
      revenue: 13884,
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'
    }
  ];

  const categoryStats = [
    { name: 'Fashion', sales: 45238, percentage: 35, color: 'bg-coral-pink' },
    { name: 'Electronics', sales: 38942, percentage: 30, color: 'bg-electric-aqua' },
    { name: 'Home Decor', sales: 24587, percentage: 19, color: 'bg-deep-indigo' },
    { name: 'Others', sales: 20983, percentage: 16, color: 'bg-gray-400' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const StatCard = ({ title, value, change, trend, icon: Icon, prefix = '', suffix = '' }: any) => (
    <Card className="p-6 bg-white">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-charcoal-gray mt-1">
            {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
          </p>
          <div className="flex items-center mt-2">
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span className="text-sm text-gray-500 ml-1">vs last period</span>
          </div>
        </div>
        <div className="p-3 bg-soft-ivory rounded-lg">
          <Icon className="w-6 h-6 text-deep-indigo" />
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-soft-ivory">
      {/* Admin Header */}
      <header className="bg-deep-indigo text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link to="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-coral-pink rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">E</span>
                </div>
                <span className="text-xl font-bold">EcomStore Admin</span>
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-6">
              <Link to="/admin/dashboard" className="text-electric-aqua font-medium">Dashboard</Link>
              <Link to="/admin/products" className="hover:text-electric-aqua transition-colors">Products</Link>
              <Link to="/admin/orders" className="hover:text-electric-aqua transition-colors">Orders</Link>
              <Link to="/admin/users" className="hover:text-electric-aqua transition-colors">Users</Link>
              <Link to="/admin/categories" className="hover:text-electric-aqua transition-colors">Categories</Link>
            </nav>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" className="border-white text-white hover:bg-white hover:text-deep-indigo">
                <Link to="/">View Store</Link>
              </Button>
              <div className="w-8 h-8 bg-coral-pink rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">A</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-charcoal-gray">Dashboard</h1>
            <p className="text-gray-600 mt-1">Welcome back! Here's what's happening with your store.</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-40">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Total Users"
            value={stats.totalUsers.value}
            change={stats.totalUsers.change}
            trend={stats.totalUsers.trend}
            icon={Users}
          />
          <StatCard
            title="Total Sales"
            value={stats.totalSales.value}
            change={stats.totalSales.change}
            trend={stats.totalSales.trend}
            icon={DollarSign}
            prefix="$"
          />
          <StatCard
            title="Orders Today"
            value={stats.ordersToday.value}
            change={stats.ordersToday.change}
            trend={stats.ordersToday.trend}
            icon={ShoppingCart}
          />
          <StatCard
            title="Active Products"
            value={stats.activeProducts.value}
            change={stats.activeProducts.change}
            trend={stats.activeProducts.trend}
            icon={Package}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <Card className="bg-white">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-charcoal-gray">Recent Orders</h2>
                  <Link to="/admin/orders">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-2" />
                      View All
                    </Button>
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 bg-soft-ivory rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium text-charcoal-gray">{order.id}</span>
                          <Badge className={getStatusColor(order.status)}>
                            {order.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{order.customer}</p>
                        <p className="text-xs text-gray-500">{order.email}</p>
                      </div>
                      
                      <div className="text-right ml-4">
                        <p className="font-semibold text-charcoal-gray">${order.total}</p>
                        <p className="text-sm text-gray-500">{order.items} items</p>
                        <p className="text-xs text-gray-400">{order.date}</p>
                      </div>
                      
                      <Button variant="ghost" size="sm" className="ml-2">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Top Products */}
            <Card className="bg-white">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-charcoal-gray">Top Products</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {topProducts.map((product) => (
                    <div key={product.id} className="flex items-center space-x-4">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal-gray truncate">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-500">{product.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-charcoal-gray">
                          ${product.revenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-500">{product.sales} sales</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* Category Performance */}
            <Card className="bg-white">
              <div className="p-6 border-b">
                <h2 className="text-xl font-semibold text-charcoal-gray">Category Performance</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {categoryStats.map((category) => (
                    <div key={category.name}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-charcoal-gray">{category.name}</span>
                        <span className="text-sm text-gray-600">{category.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${category.color}`}
                          style={{ width: `${category.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        ${category.sales.toLocaleString()} in sales
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
