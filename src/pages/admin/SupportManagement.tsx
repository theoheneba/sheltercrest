import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  MessageSquare, Users, Clock, CheckCircle, AlertTriangle,
  Search, Filter, Eye, MessageCircle, Phone, Mail, Flag,
  ArrowUpRight, ArrowDownRight, FileText, BarChart2,
  UserCheck, Star, RefreshCw, Inbox, Globe
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// Mock ticket data
const mockTickets = [
  {
    id: 'TKT001',
    subject: 'Payment Processing Issue',
    user: {
      name: 'John Doe',
      email: 'john@example.com',
      applicationId: 'APP001'
    },
    priority: 'high',
    status: 'open',
    category: 'payment',
    assignedTo: 'Sarah Wilson',
    createdAt: '2025-04-15T10:30:00Z',
    lastUpdated: '2025-04-15T14:45:00Z',
    source: 'email',
    sla: {
      deadline: '2025-04-16T10:30:00Z',
      status: 'within_limit'
    }
  },
  {
    id: 'TKT002',
    subject: 'Document Verification Query',
    user: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      applicationId: 'APP002'
    },
    priority: 'medium',
    status: 'in_progress',
    category: 'documentation',
    assignedTo: 'Mike Johnson',
    createdAt: '2025-04-15T09:15:00Z',
    lastUpdated: '2025-04-15T13:20:00Z',
    source: 'portal',
    sla: {
      deadline: '2025-04-16T09:15:00Z',
      status: 'warning'
    }
  },
  {
    id: 'TKT003',
    subject: 'Application Status Update',
    user: {
      name: 'Robert Brown',
      email: 'robert@example.com',
      applicationId: 'APP003'
    },
    priority: 'low',
    status: 'resolved',
    category: 'application',
    assignedTo: 'Emily Davis',
    createdAt: '2025-04-14T16:45:00Z',
    lastUpdated: '2025-04-15T11:30:00Z',
    source: 'chat',
    sla: {
      deadline: '2025-04-15T16:45:00Z',
      status: 'completed'
    }
  }
];

// Mock knowledge base articles
const mockArticles = [
  {
    id: 'KB001',
    title: 'Common Payment Issues',
    category: 'payment',
    views: 1245,
    helpfulRating: 92
  },
  {
    id: 'KB002',
    title: 'Document Upload Guidelines',
    category: 'documentation',
    views: 987,
    helpfulRating: 88
  },
  {
    id: 'KB003',
    title: 'Application Process Overview',
    category: 'application',
    views: 2341,
    helpfulRating: 95
  }
];

const SupportManagement = () => {
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    category: 'all'
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { icon: Inbox, className: 'bg-blue-100 text-blue-800' },
      in_progress: { icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
      resolved: { icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      closed: { icon: AlertTriangle, className: 'bg-gray-100 text-gray-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        <Icon size={12} className="mr-1" />
        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </span>
    );
  };

  const getPriorityIndicator = (priority: string) => {
    const colors = {
      high: 'text-red-500',
      medium: 'text-yellow-500',
      low: 'text-green-500'
    };

    return (
      <div className="flex items-center">
        <div className={`w-2 h-2 rounded-full ${colors[priority as keyof typeof colors].replace('text', 'bg')} mr-2`}></div>
        <span className={`text-sm ${colors[priority as keyof typeof colors]}`}>
          {priority.charAt(0).toUpperCase() + priority.slice(1)}
        </span>
      </div>
    );
  };

  const getSourceIcon = (source: string) => {
    switch (source) {
      case 'email':
        return <Mail size={16} />;
      case 'chat':
        return <MessageCircle size={16} />;
      case 'phone':
        return <Phone size={16} />;
      case 'portal':
        return <Globe size={16} />;
      default:
        return <MessageSquare size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Support Management</h1>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            leftIcon={<FileText size={18} />}
          >
            Export Report
          </Button>
          <Button
            leftIcon={<MessageSquare size={18} />}
          >
            New Ticket
          </Button>
        </div>
      </div>

      {/* Support Statistics */}
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
                  <p className="text-sm font-medium text-blue-600">Open Tickets</p>
                  <h3 className="text-2xl font-bold text-blue-900 mt-1">156</h3>
                  <div className="flex items-center mt-1 text-sm text-red-600">
                    <ArrowUpRight size={16} className="mr-1" />
                    <span>12% from yesterday</span>
                  </div>
                </div>
                <div className="p-3 bg-blue-200 rounded-lg">
                  <Inbox className="h-6 w-6 text-blue-700" />
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
                  <p className="text-sm font-medium text-green-600">Resolution Rate</p>
                  <h3 className="text-2xl font-bold text-green-900 mt-1">92%</h3>
                  <div className="flex items-center mt-1 text-sm text-green-600">
                    <ArrowUpRight size={16} className="mr-1" />
                    <span>3% improvement</span>
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
                  <p className="text-sm font-medium text-yellow-600">Avg Response Time</p>
                  <h3 className="text-2xl font-bold text-yellow-900 mt-1">2.5h</h3>
                  <div className="flex items-center mt-1 text-sm text-yellow-600">
                    <Clock size={16} className="mr-1" />
                    <span>Within SLA</span>
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
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">CSAT Score</p>
                  <h3 className="text-2xl font-bold text-purple-900 mt-1">4.8</h3>
                  <div className="flex items-center mt-1 text-sm text-purple-600">
                    <Star size={16} className="mr-1" />
                    <span>96% satisfaction</span>
                  </div>
                </div>
                <div className="p-3 bg-purple-200 rounded-lg">
                  <Star className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Ticket Management */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Support Tickets</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search tickets..."
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
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                <select
                  value={filters.priority}
                  onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SLA</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockTickets.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            {getSourceIcon(ticket.source)}
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{ticket.id}</div>
                          <div className="text-sm text-gray-500">{ticket.subject}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{ticket.user.name}</div>
                      <div className="text-sm text-gray-500">{ticket.user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {ticket.category.charAt(0).toUpperCase() + ticket.category.slice(1)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getPriorityIndicator(ticket.priority)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(ticket.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm ${
                        ticket.sla.status === 'within_limit'
                          ? 'text-green-600'
                          : ticket.sla.status === 'warning'
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}>
                        {new Date(ticket.sla.deadline).toLocaleString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedTicket(ticket.id)}
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

      {/* Knowledge Base */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Popular Knowledge Base Articles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockArticles.map((article) => (
                  <div
                    key={article.id}
                    className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{article.title}</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Category: {article.category.charAt(0).toUpperCase() + article.category.slice(1)}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-500">{article.views} views</div>
                        <div className="flex items-center mt-1">
                          <Star size={16} className="text-yellow-400" />
                          <span className="ml-1 text-sm text-gray-600">{article.helpfulRating}% helpful</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Button
                variant="outline"
                fullWidth
                leftIcon={<MessageSquare size={18} />}
              >
                Create New Ticket
              </Button>
              <Button
                variant="outline"
                fullWidth
                leftIcon={<FileText size={18} />}
              >
                Add KB Article
              </Button>
              <Button
                variant="outline"
                fullWidth
                leftIcon={<BarChart2 size={18} />}
              >
                View Reports
              </Button>
              <Button
                variant="outline"
                fullWidth
                leftIcon={<UserCheck size={18} />}
              >
                Manage Assignments
              </Button>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Quick Stats</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Average Handle Time</span>
                  <span className="font-medium">18 minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">First Response Time</span>
                  <span className="font-medium">5 minutes</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Resolution Rate</span>
                  <span className="font-medium">92%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ticket Details Modal */}
      {selectedTicket && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl h-[90vh] flex flex-col">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Ticket Details</h2>
              <button
                onClick={() => setSelectedTicket(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6">
              {/* Ticket details would go here */}
            </div>
            
            <div className="p-6 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <Button variant="outline">Close Ticket</Button>
                <Button>Update Status</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SupportManagement;