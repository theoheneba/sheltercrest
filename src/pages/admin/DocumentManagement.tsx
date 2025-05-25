import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Search, Filter, Download, Upload, Eye,
  CheckCircle, AlertTriangle, Clock, Trash2, Edit2, X,
  ZoomIn, RotateCw, MessageSquare, Flag, Lock
} from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { supabase } from '../../services/db';
import { toast } from 'react-hot-toast';
import { useLocation } from 'react-router-dom';
import DocumentUploader from '../../components/document/DocumentUploader';
import DocumentViewer from '../../components/document/DocumentViewer';
import { documentService } from '../../services/documentService';

interface DocumentType {
  id: string;
  user_id: string;
  application_id: string;
  document_type: string;
  file_name: string;
  file_path: string;
  preview_url?: string;
  status: 'pending' | 'verified' | 'rejected';
  verified_at?: string;
  verified_by?: string;
  review_notes?: string;
  review_date?: string;
  created_at: string;
}

const DocumentManagement = () => {
  const location = useLocation();
  const [documents, setDocuments] = useState<DocumentType[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<DocumentType | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [showUploader, setShowUploader] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all'
  });

  useEffect(() => {
    // Check if there's a filter in the location state
    const locationState = location.state as { filter?: string } | null;
    if (locationState?.filter) {
      setFilters(prev => ({ ...prev, status: locationState.filter }));
    }
    
    fetchDocuments(locationState?.filter);
    setupRealtimeSubscription();
    
    return () => {
      const subscription = supabase.channel('documents_changes');
      subscription.unsubscribe();
    };
  }, [location.state]);

  const fetchDocuments = async (statusFilter?: string) => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');
      
      let query = supabase.from('documents').select('*');
      
      // Apply status filter if provided
      if (statusFilter) {
        query = query.eq('status', statusFilter);
      } else if (filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      
      // Apply document type filter if provided
      if (filters.type !== 'all') {
        query = query.eq('document_type', filters.type);
      }
      
      // Apply search term if provided
      if (searchTerm) {
        query = query.or(`file_name.ilike.%${searchTerm}%,document_type.ilike.%${searchTerm}%`);
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeSubscription = () => {
    const subscription = supabase
      .channel('documents_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'documents' },
        (payload) => {
          console.log('Document change:', payload);
          if (payload.eventType === 'INSERT') {
            setDocuments(prev => [payload.new as DocumentType, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setDocuments(prev =>
              prev.map(doc =>
                doc.id === payload.new.id ? { ...doc, ...payload.new } : doc
              )
            );
            if (selectedDocument?.id === payload.new.id) {
              setSelectedDocument(prev => prev ? { ...prev, ...payload.new } : prev);
            }
          } else if (payload.eventType === 'DELETE') {
            setDocuments(prev =>
              prev.filter(doc => doc.id !== payload.old.id)
            );
            if (selectedDocument?.id === payload.old.id) {
              setSelectedDocument(null);
            }
          }
        }
      )
      .subscribe();

    return subscription;
  };

  const handleVerifyDocument = async (document: DocumentType, status: 'verified' | 'rejected', notes?: string) => {
    try {
      setIsVerifying(true);
      await documentService.updateDocumentStatus(document.id, status, notes);
      
      // Update the document in the local state
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === document.id ? { ...doc, status, review_notes: notes } : doc
        )
      );
      
      toast.success(`Document ${status === 'verified' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error verifying document:', error);
      toast.error('Failed to update document status');
    } finally {
      setIsVerifying(false);
      setSelectedDocument(null);
    }
  };

  const handleExportReport = () => {
    try {
      // Create CSV content
      const headers = ['ID', 'User ID', 'Document Type', 'File Name', 'Status', 'Created At'];
      const csvContent = [
        headers.join(','),
        ...documents.map(doc => [
          doc.id,
          doc.user_id,
          doc.document_type,
          doc.file_name,
          doc.status,
          new Date(doc.created_at).toLocaleDateString()
        ].join(','))
      ].join('\n');
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `documents_report_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success('Report exported successfully');
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Failed to export report');
    }
  };

  const handleUploadComplete = () => {
    setShowUploader(false);
    fetchDocuments();
    toast.success('Document uploaded successfully');
  };

  const handleDeleteDocument = async (id: string) => {
    try {
      await documentService.deleteDocument(id);
      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      verified: { icon: CheckCircle, className: 'bg-green-100 text-green-800' },
      pending: { icon: Clock, className: 'bg-yellow-100 text-yellow-800' },
      rejected: { icon: AlertTriangle, className: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { icon: Clock, className: 'bg-gray-100 text-gray-800' };
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        <Icon size={12} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const filteredDocuments = documents.filter(doc => {
    // Apply type filter
    if (filters.type !== 'all' && doc.document_type !== filters.type) {
      return false;
    }
    
    // Apply status filter
    if (filters.status !== 'all' && doc.status !== filters.status) {
      return false;
    }
    
    // Apply search term
    if (searchTerm && 
        !doc.file_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !doc.document_type.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Document Management</h1>
        <div className="flex space-x-3">
          {!showUploader ? (
            <>
              <Button
                variant="outline"
                onClick={handleExportReport}
                leftIcon={<Download size={18} />}
              >
                Export Report
              </Button>
              <Button
                onClick={() => setShowUploader(true)}
                leftIcon={<Upload size={18} />}
              >
                Upload Documents
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowUploader(false)}
            >
              Cancel Upload
            </Button>
          )}
        </div>
      </div>

      {/* Document Statistics */}
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
                  <p className="text-sm font-medium text-blue-600">Total Documents</p>
                  <h3 className="text-2xl font-bold text-blue-900 mt-1">{documents.length}</h3>
                  <p className="text-sm text-blue-600 mt-1">All documents</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-700" />
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
                  <p className="text-sm font-medium text-green-600">Verified</p>
                  <h3 className="text-2xl font-bold text-green-900 mt-1">
                    {documents.filter(doc => doc.status === 'verified').length}
                  </h3>
                  <p className="text-sm text-green-600 mt-1">Approved documents</p>
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
                  <p className="text-sm font-medium text-yellow-600">Pending Review</p>
                  <h3 className="text-2xl font-bold text-yellow-900 mt-1">
                    {documents.filter(doc => doc.status === 'pending').length}
                  </h3>
                  <p className="text-sm text-yellow-600 mt-1">Awaiting verification</p>
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
                  <p className="text-sm font-medium text-red-600">Rejected</p>
                  <h3 className="text-2xl font-bold text-red-900 mt-1">
                    {documents.filter(doc => doc.status === 'rejected').length}
                  </h3>
                  <p className="text-sm text-red-600 mt-1">Failed verification</p>
                </div>
                <div className="p-3 bg-red-200 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-red-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Document Queue */}
      {showUploader ? (
        <Card>
          <CardHeader>
            <CardTitle>Upload Document</CardTitle>
          </CardHeader>
          <CardContent>
            <DocumentUploader onUploadComplete={handleUploadComplete} />
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <CardTitle>Document Queue</CardTitle>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search documents..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div className="flex gap-2">
                  <select
                    value={filters.type}
                    onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Types</option>
                    <option value="ghana_card">Ghana Card</option>
                    <option value="employee_id">Employee ID</option>
                    <option value="offer_letter">Offer Letter</option>
                    <option value="payslip">Payslip</option>
                    <option value="bank_statement">Bank Statement</option>
                    <option value="identification">Identification</option>
                    <option value="income">Income Proof</option>
                    <option value="employment">Employment Proof</option>
                    <option value="lease">Lease Agreement</option>
                  </select>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading documents...</p>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900">No Documents Found</h3>
                <p className="mt-1 text-sm text-gray-500">There are no documents matching your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDocuments.map((doc) => (
                      <tr key={doc.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                                <FileText className="h-5 w-5 text-primary-600" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{doc.file_name}</div>
                              <div className="text-sm text-gray-500">{doc.id.substring(0, 8)}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.user_id.substring(0, 8)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doc.document_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(doc.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(doc.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              className="text-primary-600 hover:text-primary-900"
                              onClick={() => setSelectedDocument(doc)}
                              title="View Document"
                            >
                              <Eye size={18} />
                            </button>
                            <button 
                              className="text-gray-600 hover:text-gray-900"
                              onClick={() => window.open(doc.file_path, '_blank')}
                              title="Download Document"
                            >
                              <Download size={18} />
                            </button>
                            <button 
                              className="text-red-600 hover:text-red-900"
                              onClick={() => handleDeleteDocument(doc.id)}
                              title="Delete Document"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {filteredDocuments.length > 0 && (
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
            )}
          </CardContent>
        </Card>
      )}

      {/* Document Viewer Modal */}
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onStatusChange={(id, status) => {
            setDocuments(prev => 
              prev.map(doc => 
                doc.id === id ? { ...doc, status } : doc
              )
            );
          }}
          onDelete={(id) => {
            setDocuments(prev => prev.filter(doc => doc.id !== id));
          }}
          isAdmin={true}
        />
      )}
    </div>
  );
};

export default DocumentManagement;