import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  DollarSign, TrendingUp, Calendar, CreditCard, Building,
  AlertTriangle, CheckCircle, Clock, Download, Filter,
  Search, ArrowUpRight, ArrowDownRight, FileText, Users,
  RefreshCw
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, AreaChart, Area
} from 'recharts';

// Mock data for charts
const paymentTrends = [
  { date: '2025-01', volume: 125000, success: 118750, failure: 6250 },
  { date: '2025-02', volume: 142000, success: 135000, failure: 7000 },
  { date: '2025-03', volume: 158000, success: 150000, failure: 8000 },
  { date: '2025-04', volume: 175000, success: 166250, failure: 8750 },
];

// Mock payment data
const mockPayments = [
  {
    id: 'PAY001',
    tenant: 'John Doe',
    landlord: 'Skyline Properties',
    amount: 1200,
    status: 'completed',
    date: '2025-04-15',
    processingFee: 35,
    paymentMethod: 'bank_transfer'
  },
  {
    id: 'PAY002',
    tenant: 'Jane Smith',
    landlord: 'Urban Housing Ltd',
    amount: 1500,
    status: 'pending',
    date: '2025-04-16',
    processingFee: 42,
    paymentMethod: 'card'
  },
  {
    id: 'PAY003',
    tenant: 'Mike Johnson',
    landlord: 'Metro Rentals',
    amount: 950,
    status: 'failed',
    date: '2025-04-14',
    processingFee: 28,
    paymentMethod: 'bank_transfer'
  }
];

const PaymentManagement = () => {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [dateRange, setDateRange] = useState('30d');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const getStatusBadge = (status: string) => {
    const config = {
      completed: { icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      pending: { icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
      failed: { icon: AlertTriangle, className: 'bg-red-100 text-red-800' }
    };

    const statusInfo = config[status as keyof typeof config];
    const Icon = statusInfo.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.className}`}>
        <Icon size={12} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            leftIcon={<Download size={18} />}
          >
            Export Report
          </Button>
          <Button
            leftIcon={<RefreshCw size={18} />}
          >
            Reconcile
          </Button>
        </div>
      </div>

      {/* Financial Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-600">Total Volume</p>
                  <h3 className="text-2xl font-bold text-blue-900 mt-1">GH₵ 1.2M</h3>
                  <div className="flex items-center mt-1 text-sm text-green-600">
                    <ArrowUpRight size={16} className="mr-1" />
                    <span>12.5% from last month</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-200 rounded-lg">
                  <DollarSign className="h-6 w-6 text-blue-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Success Rate</p>
                  <h3 className="text-2xl font-bold text-green-900 mt-1">95.2%</h3>
                  <div className="flex items-center mt-1 text-sm text-green-600">
                    <ArrowUpRight size={16} className="mr-1" />
                    <span>2.1% improvement</span>
                  </div>
                </div>
                <div className="p-3 bg-green-200 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-green-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Pending</p>
                  <h3 className="text-2xl font-bold text-yellow-900 mt-1">156</h3>
                  <div className="flex items-center mt-1 text-sm text-yellow-600">
                    <Clock size={16} className="mr-1" />
                    <span>Processing</span>
                  </div>
                </div>
                <div className="p-3 bg-yellow-200 rounded-lg">
                  <Clock className="h-6 w-6 text-yellow-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-600">Failed</p>
                  <h3 className="text-2xl font-bold text-red-900 mt-1">23</h3>
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <ArrowDownRight size={16} className="mr-1" />
                    <span>Needs attention</span>
                  </div>
                </div>
                <div className="p-3 bg-red-200 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payment Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Payment Volume Trends</CardTitle>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={paymentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke="#3B82F6"
                    fill="#93C5FD"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success vs Failure Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={paymentTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="success" fill="#10B981" />
                  <Bar dataKey="failure" fill="#EF4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment List */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Recent Payments</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search payments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Landlord</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {payment.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.tenant}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {payment.landlord}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      GH₵ {payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="sm"
                        variant="outline"
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center">
              <select
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="10">10 per page</option>
                <option value="25">25 per page</option>
                <option value="50">50 per page</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">Previous</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentManagement;