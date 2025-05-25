import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Clock, CheckCircle, XCircle, AlertTriangle,
  Search, Eye, ArrowRight, BarChart2, Users,
  Calendar, DollarSign
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../services/db';
import { toast } from 'react-hot-toast';

interface ApplicationType {
  id: string;
  user_id: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  monthly_rent: number;
  deposit_amount: number;
  interest_amount: number;
  total_initial_payment: number;
  landlord_name: string;
  landlord_phone: string;
  property_address: string;
  lease_start_date: string;
  lease_end_date: string;
  submitted_at: string;
  created_at: string;
  updated_at: string;
  review_notes?: string;
  review_date?: string;
  reviewed_by?: string;
}

// Mock data for demonstration
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
  const navigate = useNavigate();
  const location = useLocation();
  const [applications, setApplications] = useState<ApplicationType[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    assignee: 'all',
    sla: 'all'
  });

  useEffect(() => {
    // Check if there's a filter in the location state
    const locationState = location.state as { filter?: string } | null;
    if (locationState?.filter) {
      setFilters(prev => ({ ...prev, status: locationState.filter }));
    }
    
    fetchApplications(locationState?.filter);
    setupRealtimeSubscription();
  }, [location.state]);

  const fetchApplications = async (statusFilter?: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      let query = supabase.from('applications').select('*');
      
      // Apply status filter if provided
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      console.error('Error fetching applications:', error);
      toast.error('Failed to fetch applications');
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('applications_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setApplications(prev => [payload.new as Application, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setApplications(prev =>
              prev.map(app =>
                app.id === payload.new.id ? { ...app, ...payload.new } : app
              )
            );
            if (selectedApplication?.id === payload.new.id) {
              setSelectedApplication(prev => prev ? { ...prev, ...payload.new } : prev);
            }
          } else if (payload.eventType === 'DELETE') {
            setApplications(prev =>
              prev.filter(app => app.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  };

  const handleApplicationAction = async (application: ApplicationType, status: 'approved' | 'rejected') => {
    try {
      setIsProcessing(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('applications')
        .update({
          status,
          review_notes: reviewNotes,
          review_date: new Date().toISOString(),
          reviewed_by: user.id
        })
        .eq('id', application.id);

      if (error) throw error;

      toast.success(`Application ${status} successfully`);
      setSelectedApplication(null);
      setReviewNotes('');
    } catch (error) {
      console.error('Error processing application:', error);
      toast.error('Failed to process application');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
      in_review: { icon: FileText, className: 'bg-blue-100 text-blue-800' },
      approved: { icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      rejected: { icon: XCircle, className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { icon: Clock, className: 'bg-gray-100 text-gray-800' };
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
            onClick={() => navigate('/admin/analytics')}
          >
            View Analytics
          </Button>
          <Button 
            leftIcon={<Users size={18} />}
            onClick={() => navigate('/admin/users')}
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
                  <option value="pending">Pending</option>
                  <option value="in_review">In Review</option>
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
                {applications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <FileText className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{application.id.substring(0, 8)}</div>
                          <div className="text-sm text-gray-500">{application.user_id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(application.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getRiskIndicator(75)} {/* Default value */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-primary-600 rounded-full"
                            style={{ width: '80%' }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">
                          80%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getSlaIndicator('within_limit')} {/* Default value */}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedApplication(application)}
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Application Review</h2>
                  <p className="text-gray-600">
                    Application ID: {selectedApplication.id.substring(0, 8)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedApplication(null)}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <XCircle size={24} />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Applicant Information</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><span className="font-medium">User ID:</span> {selectedApplication.user_id}</p>
                      <p><span className="font-medium">Landlord:</span> {selectedApplication.landlord_name}</p>
                      <p><span className="font-medium">Landlord Phone:</span> {selectedApplication.landlord_phone}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Application Details</h3>
                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                      <p><span className="font-medium">Monthly Rent:</span> GH₵ {selectedApplication.monthly_rent.toLocaleString()}</p>
                      <p><span className="font-medium">Deposit Amount:</span> GH₵ {selectedApplication.deposit_amount.toLocaleString()}</p>
                      <p><span className="font-medium">Total Initial Payment:</span> GH₵ {selectedApplication.total_initial_payment.toLocaleString()}</p>
                      <p><span className="font-medium">Submitted:</span> {new Date(selectedApplication.submitted_at || selectedApplication.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Property Information</h3>
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <p><span className="font-medium">Property Address:</span> {selectedApplication.property_address}</p>
                    <p><span className="font-medium">Lease Period:</span> {new Date(selectedApplication.lease_start_date).toLocaleDateString()} to {new Date(selectedApplication.lease_end_date).toLocaleDateString()}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Review Notes</h3>
                  <textarea
                    value={reviewNotes || selectedApplication.review_notes || ''}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add your review notes here..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 h-32"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setSelectedApplication(null)}
                >
                  Close
                </Button>
                <Button
                  variant="outline"
                  className="border-red-600 text-red-600 hover:bg-red-50"
                  onClick={() => handleApplicationAction(selectedApplication, 'rejected')}
                  isLoading={isProcessing}
                  disabled={selectedApplication.status !== 'pending' && selectedApplication.status !== 'in_review'}
                >
                  Reject Application
                </Button>
                <Button
                  variant="primary"
                  onClick={() => handleApplicationAction(selectedApplication, 'approved')}
                  isLoading={isProcessing}
                  disabled={selectedApplication.status !== 'pending' && selectedApplication.status !== 'in_review'}
                >
                  Approve Application
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