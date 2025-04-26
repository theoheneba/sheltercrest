import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Clock, CheckCircle, XCircle, AlertTriangle,
  Search, Filter, Eye, ArrowRight, BarChart2, Users,
  Calendar, DollarSign
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// Mock data
const mockApplications = [
  {
    id: 'APP001',
    applicant: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+233 55 123 4567'
    },
    amount: 1200,
    status: 'pending_review',
    submittedDate: '2025-04-08',
    assignedTo: 'Sarah Wilson',
    priority: 'high',
    riskScore: 85,
    completeness: 95,
    documents: {
      total: 6,
      verified: 4,
      pending: 2
    },
    employmentVerified: true,
    incomeVerified: false,
    landlordVerified: true,
    slaStatus: 'within_limit', // within_limit, warning, overdue
    processingTime: 2.5 // days
  },
  {
    id: 'APP002',
    applicant: {
      name: 'Jane Smith',
      email: 'jane@example.com',
      phone: '+233 55 987 6543'
    },
    amount: 1500,
    status: 'document_verification',
    submittedDate: '2025-04-09',
    assignedTo: 'Mike Johnson',
    priority: 'medium',
    riskScore: 72,
    completeness: 85,
    documents: {
      total: 6,
      verified: 2,
      pending: 4
    },
    employmentVerified: true,
    incomeVerified: true,
    landlordVerified: false,
    slaStatus: 'warning',
    processingTime: 3.2
  }
];

const ApplicationProcessing = () => {
  const [selectedApplication, setSelectedApplication] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    sla: 'all'
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_review: { icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
      document_verification: { icon: FileText, className: 'bg-blue-100 text-blue-800' },
      approved: { icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      rejected: { icon: XCircle, className: 'bg-red-100 text-red-800' }
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

  const getSlaIndicator = (status: string) => {
    const config = {
      within_limit: { color: 'text-green-500', bg: 'bg-green-100' },
      warning: { color: 'text-yellow-500', bg: 'bg-yellow-100' },
      overdue: { color: 'text-red-500', bg: 'bg-red-100' }
    };

    const style = config[status as keyof typeof config];

    return (
      <div className={`px-2 py-1 rounded-full ${style.bg} ${style.color} text-xs font-medium`}>
        {status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Application Processing</h1>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            leftIcon={<BarChart2 size={18} />}
          >
            View Analytics
          </Button>
          <Button
            leftIcon={<Users size={18} />}
          >
            Manage Team
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
                  <p className="text-sm font-medium text-blue-600">Pending Review</p>
                  <h3 className="text-2xl font-bold text-blue-900 mt-1">24</h3>
                  <p className="text-sm text-blue-600 mt-1">5 high priority</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-lg">
                  <Clock className="h-6 w-6 text-blue-700" />
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
          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-600">Processing Time</p>
                  <h3 className="text-2xl font-bold text-yellow-900 mt-1">2.3</h3>
                  <p className="text-sm text-yellow-600 mt-1">Avg. days</p>
                </div>
                <div className="p-3 bg-yellow-200 rounded-lg">
                  <Calendar className="h-6 w-6 text-yellow-700" />
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
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-600">Approval Rate</p>
                  <h3 className="text-2xl font-bold text-green-900 mt-1">85%</h3>
                  <p className="text-sm text-green-600 mt-1">Last 30 days</p>
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
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Value</p>
                  <h3 className="text-2xl font-bold text-purple-900 mt-1">GH₵ 245K</h3>
                  <p className="text-sm text-purple-600 mt-1">Pending approval</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Applications Queue</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search applications..."
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
                  <option value="pending_review">Pending Review</option>
                  <option value="document_verification">Document Verification</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Application</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Risk Score</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completeness</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SLA Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{application.id}</div>
                          <div className="text-sm text-gray-500">{application.applicant.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRiskIndicator(application.riskScore)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-600 rounded-full"
                            style={{ width: `${application.completeness}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          {application.completeness}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSlaIndicator(application.slaStatus)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedApplication(application.id)}
                        rightIcon={<ArrowRight size={16} />}
                      >
                        Review
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

      {/* Application Review Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Application Review</h2>
                  <p className="text-gray-600">Review and process application {selectedApplication}</p>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle size={24} />
                </button>
              </div>

              {/* Application details would go here */}
              <div className="space-y-6">
                {/* Add detailed application review interface */}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedApplication(null)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  leftIcon={<CheckCircle size={18} />}
                >
                  Approve
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApplicationProcessing;