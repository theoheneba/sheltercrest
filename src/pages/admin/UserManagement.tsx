import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Search, Filter, MoreVertical, Edit2, Trash2, UserPlus,
  Mail, Phone, Building, DollarSign, Calendar, Shield, AlertTriangle,
  CheckCircle, XCircle, Clock, Download
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// Mock user data
const mockUsers = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+233 55 123 4567',
    status: 'active',
    verificationStatus: 'verified',
    applicationStatus: 'approved',
    employmentStatus: 'full-time',
    monthlyIncome: 5000,
    riskScore: 85,
    lastLogin: '2025-04-10T14:30:00Z',
    location: 'Accra',
    joinDate: '2025-01-15',
    paymentStatus: 'good_standing',
    documents: {
      total: 8,
      verified: 6,
      pending: 2
    }
  },
  {
    id: '2',
    firstName: 'Jane',
    lastName: 'Smith',
    email: 'jane@example.com',
    phone: '+233 55 987 6543',
    status: 'pending',
    verificationStatus: 'pending',
    applicationStatus: 'pending',
    employmentStatus: 'contract',
    monthlyIncome: 4200,
    riskScore: 72,
    lastLogin: '2025-04-09T16:45:00Z',
    location: 'Kumasi',
    joinDate: '2025-02-20',
    paymentStatus: 'late_payment',
    documents: {
      total: 6,
      verified: 3,
      pending: 3
    }
  }
];

const UserManagement = () => {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    verificationStatus: 'all',
    applicationStatus: 'all',
    paymentStatus: 'all',
    location: 'all'
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      pending: { icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
      suspended: { icon: AlertTriangle, className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        <Icon size={12} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRiskIndicator = (score: number) => {
    let color = 'text-red-500';
    if (score >= 80) color = 'text-green-500';
    else if (score >= 60) color = 'text-yellow-500';

    return (
      <div className="flex items-center">
        <div className={`w-2 h-2 rounded-full ${color.replace('text', 'bg')} mr-2`}></div>
        <span className={`text-sm ${color}`}>{score}</span>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            leftIcon={<Download size={18} />}
          >
            Export Users
          </Button>
          <Button
            leftIcon={<UserPlus size={18} />}
          >
            Add New User
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
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
                  <p className="text-sm font-medium text-blue-600">Total Users</p>
                  <h3 className="text-2xl font-bold text-blue-900 mt-1">1,234</h3>
                  <p className="text-sm text-blue-600 mt-1">+12% from last month</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-lg">
                  <Users className="h-6 w-6 text-blue-700" />
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
                  <p className="text-sm font-medium text-green-600">Verified Users</p>
                  <h3 className="text-2xl font-bold text-green-900 mt-1">856</h3>
                  <p className="text-sm text-green-600 mt-1">69% of total</p>
                </div>
                <div className="p-3 bg-green-200 rounded-lg">
                  <Shield className="h-6 w-6 text-green-700" />
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
                  <p className="text-sm font-medium text-yellow-600">Pending Verification</p>
                  <h3 className="text-2xl font-bold text-yellow-900 mt-1">245</h3>
                  <p className="text-sm text-yellow-600 mt-1">Requires review</p>
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
                  <p className="text-sm font-medium text-red-600">High Risk Users</p>
                  <h3 className="text-2xl font-bold text-red-900 mt-1">42</h3>
                  <p className="text-sm text-red-600 mt-1">Needs attention</p>
                </div>
                <div className="p-3 bg-red-200 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>User Management</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="suspended">Suspended</option>
                </select>
                <select
                  value={filters.verificationStatus}
                  onChange={(e) => setFilters({ ...filters, verificationStatus: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Verification</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-primary-800 font-medium">
                              {user.firstName[0]}{user.lastName[0]}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.location}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRiskIndicator(user.riskScore)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.lastLogin).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button 
                          className="text-primary-600 hover:text-primary-900"
                          onClick={() => setSelectedUser(user.id)}
                        >
                          <Edit2 size={18} />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 size={18} />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                          <MoreVertical size={18} />
                        </button>
                      </div>
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

      {/* User Details Modal would go here */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-full max-w-2xl mx-4">
            <CardHeader>
              <CardTitle>User Details</CardTitle>
            </CardHeader>
            <CardContent>
              {/* User details form would go here */}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default UserManagement;