import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, FileText, DollarSign, TrendingUp, AlertCircle, 
  CheckCircle, Calendar, ArrowUpRight, Search,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useEffect } from 'react';
import { supabase } from '../../services/db';
import { toast } from 'react-hot-toast';

interface ApplicationType {
  id: string;
  user_id: string;
  status: string;
  monthly_rent: number;
  created_at: string;
}

interface ProfileType {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dateRange, setDateRange] = useState<string>('7d');
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingReview: 0,
    approvedToday: 0,
    totalDisbursed: 0,
    recentApplications: [] as Array<{
      id: string;
      name: string;
      amount: number;
      status: string;
      date: string;
    }>,
    performanceMetrics: {
      approvalRate: 85,
      avgProcessingTime: 2.3,
      defaultRate: 3.2
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    setupRealtimeSubscription();

    return () => {
      const subscription = supabase.channel('dashboard_changes');
      subscription.unsubscribe();
    };
  }, [dateRange]);

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('dashboard_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'applications' },
        () => {
          fetchDashboardData();
        }
      )
      .subscribe();

    return subscription;
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch applications
      const { data: applications, error: applicationsError } = await supabase
        .from('applications')
        .select('*')
        .order('created_at', { ascending: false });

      if (applicationsError) throw applicationsError;

      // Fetch profiles for user names
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email');

      if (profilesError) throw profilesError;

      // Calculate stats
      const totalApplications = applications?.length || 0;
      const pendingReview = applications?.filter(app => app.status === 'pending').length || 0;
      
      // Get today's date in ISO format (YYYY-MM-DD)
      const today = new Date().toISOString().split('T')[0];
      const approvedToday = applications?.filter(
        app => app.status === 'approved' && 
        app.review_date?.startsWith(today)
      ).length || 0;

      // Calculate total disbursed amount
      const totalDisbursed = applications
        ?.filter(app => app.status === 'approved')
        .reduce((sum, app) => sum + (app.total_initial_payment || 0), 0) || 0;

      // Map recent applications with user names
      const recentApplications = applications
        ?.slice(0, 3)
        .map(app => {
          const profile = profiles?.find(p => p.id === app.user_id) as ProfileType;
          return {
            id: app.id,
            name: profile ? `${profile.first_name} ${profile.last_name}` : 'Unknown User',
            amount: app.monthly_rent,
            status: app.status,
            date: app.created_at
          };
        }) || [];

      setStats({
        totalApplications,
        pendingReview,
        approvedToday,
        totalDisbursed,
        recentApplications,
        performanceMetrics: {
          approvalRate: 85, // These could be calculated from actual data
          avgProcessingTime: 2.3,
          defaultRate: 3.2
        }
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllApplications = () => {
    navigate('/admin/applications');
  };

  const handleReviewApplications = () => {
    navigate('/admin/applications', { state: { filter: 'pending' } });
  };

  const handleVerifyDocuments = () => {
    navigate('/admin/documents', { state: { filter: 'pending' } });
  };

  const handleProcessPayments = () => {
    navigate('/admin/payments', { state: { filter: 'pending' } });
  };

  return (
    <div className="space-y-6">
      {/* Header with Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-gradient-to-br from-primary-50 to-primary-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-primary-600">Total Applications</p>
                  <h3 className="text-2xl font-bold text-primary-800 mt-2">{stats.totalApplications}</h3>
                  <p className="text-sm text-primary-600 mt-1">+12% from last month</p>
                </div>
                <div className="p-3 bg-primary-200 rounded-xl shadow-sm">
                  <FileText className="h-6 w-6 text-primary-700" />
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
          <Card className="bg-gradient-to-br from-warning-50 to-warning-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-warning-600">Pending Review</p>
                  <h3 className="text-2xl font-bold text-warning-800 mt-2">{stats.pendingReview}</h3>
                  <p className="text-sm text-warning-600 mt-1">Requires attention</p>
                </div>
                <div className="p-3 bg-warning-200 rounded-xl shadow-sm">
                  <AlertCircle className="h-6 w-6 text-warning-700" />
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
          <Card className="bg-gradient-to-br from-success-50 to-success-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-success-600">Approved Today</p>
                  <h3 className="text-2xl font-bold text-success-800 mt-2">{stats.approvedToday}</h3>
                  <p className="text-sm text-success-600 mt-1">+3 since yesterday</p>
                </div>
                <div className="p-3 bg-success-200 rounded-xl shadow-sm">
                  <CheckCircle className="h-6 w-6 text-success-700" />
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
          <Card className="bg-gradient-to-br from-accent-50 to-accent-100 shadow-lg">
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-accent-600">Total Disbursed</p>
                  <h3 className="text-2xl font-bold text-accent-800 mt-2">
                    GH₵ {stats.totalDisbursed.toLocaleString()}
                  </h3>
                  <p className="text-sm text-accent-600 mt-1">+8.2% from last month</p>
                </div>
                <div className="p-3 bg-accent-200 rounded-xl shadow-sm">
                  <DollarSign className="h-6 w-6 text-accent-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Applications */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
                <div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleViewAllApplications}
                >
                  View All
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentApplications.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-primary-600" />
                        </div>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{app.name}</p>
                        <p className="text-sm text-gray-500">{app.id}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">GH₵ {app.amount}</p>
                      <p className="text-sm text-gray-500">{new Date(app.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Performance Metrics */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Recent Applications</CardTitle>
                <CardTitle>Performance Metrics</CardTitle>
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm"
                >
                  <option value="7d">Last 7 days</option>
                  <option value="30d">Last 30 days</option>
                  <option value="90d">Last 90 days</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-green-600">Approval Rate</p>
                      <h4 className="text-2xl font-bold text-green-900">{stats.performanceMetrics.approvalRate}%</h4>
                    </div>
                    <div className="p-2 bg-green-100 rounded-full">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-blue-600">Avg. Processing Time</p>
                      <h4 className="text-2xl font-bold text-blue-900">{stats.performanceMetrics.avgProcessingTime} days</h4>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Calendar className="h-5 w-5 text-blue-600" />
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-medium text-red-600">Default Rate</p>
                      <h4 className="text-2xl font-bold text-red-900">{stats.performanceMetrics.defaultRate}%</h4>
                    </div>
                    <div className="p-2 bg-red-100 rounded-full">
                      <AlertCircle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Action Items */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Required Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-yellow-900">Pending Reviews</p>
                    <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.pendingReview}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-yellow-500 text-yellow-700"
                    onClick={handleReviewApplications}
                  >
                    Review Now
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-purple-900">Document Verifications</p>
                    <p className="text-2xl font-bold text-purple-700 mt-1">8</p> {/* This could be fetched from documents table */}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-purple-500 text-purple-700"
                    onClick={handleVerifyDocuments}
                  >
                    Verify
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-blue-900">Payment Approvals</p>
                    <p className="text-2xl font-bold text-blue-700 mt-1">5</p> {/* This could be fetched from payments table */}
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="border-blue-500 text-blue-700"
                    onClick={handleProcessPayments}
                  >
                    Process
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default AdminDashboard;