import { useState, useEffect } from 'react';
import { FileText, Download, Eye, Upload, AlertCircle, CheckCircle, Trash2, Clock, XCircle } from 'lucide-react';
import Button from '../../../components/ui/Button';
import { useAuth } from '../../../contexts/AuthContext';
import { documentService } from '../../../services/documentService';
import DocumentViewer from '../../../components/document/DocumentViewer';
import { toast } from 'react-hot-toast';

interface DocumentsListProps {
  applicationId?: string;
  isAdmin?: boolean;
}

const DocumentsList = ({ applicationId, isAdmin = false }: DocumentsListProps) => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<any | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, applicationId]);
  
  const fetchDocuments = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let docs;
      if (isAdmin) {
        // Admin can see all documents
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        docs = data;
      } else if (applicationId) {
        docs = await documentService.getApplicationDocuments(applicationId);
      } else {
        docs = await documentService.getUserDocuments(user.id);
      }
      setDocuments(docs || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };
  
  const getStatusIcon = (status: string) => {
    if (status === 'verified') {
      return <CheckCircle size={16} className="text-green-500" />;
    } else if (status === 'pending') {
      return <Clock size={16} className="text-orange-500" />;
    } else if (status === 'rejected') {
      return <XCircle size={16} className="text-red-500" />;
    }
    return null;
  };
  
  const getStatusClass = (status: string) => {
    if (status === 'verified') {
      return 'bg-green-100 text-green-800';
    } else if (status === 'pending') {
      return 'bg-orange-100 text-orange-800';
    } else if (status === 'rejected') {
      return 'bg-red-100 text-red-800';
    }
    return '';
  };
  
  const handleDocumentStatusChange = (documentId: string, status: 'verified' | 'rejected') => {
    setDocuments(prev => 
      prev.map(doc => 
        doc.id === documentId ? { ...doc, status } : doc
      )
    );
  };
  
  const handleDocumentDelete = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId));
  };
  
  return (
    <div>
      {loading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading documents...</p>
        </div>
      ) : documents.length > 0 ? (
        <div className="overflow-x-auto border rounded-lg">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Upload Date</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {documents.map((doc) => (
                <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText size={18} className="text-gray-400 mr-2" />
                      <span className="text-sm font-medium text-gray-900">{doc.file_name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {doc.document_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                    {new Date(doc.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusClass(doc.status)}`}>
                      {getStatusIcon(doc.status)}
                      <span className="ml-1">{doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}</span>
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      <button 
                        className="text-gray-500 hover:text-primary-800 transition-colors" 
                        title="View"
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        className="text-gray-500 hover:text-primary-800 transition-colors" 
                        title="Download"
                        onClick={() => window.open(doc.file_path, '_blank')}
                      >
                        <Download size={18} />
                      </button>
                      {(!isAdmin && doc.user_id === user?.id && doc.status === 'pending') || isAdmin && (
                        <button 
                          className="text-gray-500 hover:text-red-500 transition-colors" 
                          title="Delete"
                          onClick={async () => {
                            if (window.confirm('Are you sure you want to delete this document?')) {
                              try {
                                await documentService.deleteDocument(doc.id);
                                setDocuments(prev => prev.filter(d => d.id !== doc.id));
                                toast.success('Document deleted successfully');
                              } catch (error) {
                                console.error('Error deleting document:', error);
                                toast.error('Failed to delete document');
                              }
                            }
                          }}
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <FileText size={48} className="mx-auto text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900">No Documents</h3>
          <p className="mt-1 text-sm text-gray-500">
            {isAdmin ? 'No documents have been uploaded yet.' : 'You haven\'t uploaded any documents yet.'}
          </p>
        </div>
      )}
      
      {selectedDocument && (
        <DocumentViewer
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onStatusChange={handleDocumentStatusChange}
          onDelete={handleDocumentDelete}
          isAdmin={isAdmin}
        />
      )}
    </div>
  );
};

export default DocumentsList;