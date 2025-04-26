import { useState } from 'react';
import { Calendar, Download, Filter, Search } from 'lucide-react';
import Button from '../../components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import PaymentHistoryTable from './components/PaymentHistoryTable';
import PaymentCalendar from './components/PaymentCalendar';

// Mock payment data - in a real app, this would come from an API
const mockPayments = [
  { id: '1', date: '2025-06-15', amount: 1200.00, status: 'Completed' as const },
  { id: '2', date: '2025-05-15', amount: 1200.00, status: 'Completed' as const },
  { id: '3', date: '2025-04-15', amount: 1200.00, status: 'Completed' as const },
  { id: '4', date: '2025-03-15', amount: 1200.00, status: 'Completed' as const },
  { id: '5', date: '2025-02-15', amount: 1200.00, status: 'Completed' as const },
  { id: '6', date: '2025-01-15', amount: 1200.00, status: 'Completed' as const },
  { id: '7', date: '2024-12-15', amount: 1200.00, status: 'Completed' as const },
  { id: '8', date: '2024-11-15', amount: 1200.00, status: 'Completed' as const },
  { id: '9', date: '2024-10-15', amount: 1200.00, status: 'Completed' as const },
  { id: '10', date: '2024-09-15', amount: 1200.00, status: 'Completed' as const },
];

const PaymentHistory = () => {
  const [view, setView] = useState<'list' | 'calendar'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  
  const filteredPayments = mockPayments.filter(payment => {
    const matchesSearch = payment.date.includes(searchTerm) || 
      payment.amount.toString().includes(searchTerm) ||
      payment.status.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = statusFilter === 'all' || payment.status.toLowerCase() === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  const totalAmount = filteredPayments.reduce((sum, payment) => sum + payment.amount, 0);
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Payment History</h1>
        <div className="flex space-x-2">
          <Button
            variant={view === 'list' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setView('list')}
          >
            List View
          </Button>
          <Button
            variant={view === 'calendar' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setView('calendar')}
          >
            Calendar View
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Payment Records</CardTitle>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={16} />}
              onClick={() => {/* Handle export */}}
            >
              Export Records
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters and Search */}
          <div className="mb-6 flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
          </div>
          
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="text-sm text-primary-600 mb-1">Total Payments</div>
              <div className="text-2xl font-bold text-primary-900">{filteredPayments.length}</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="text-sm text-green-600 mb-1">Total Amount</div>
              <div className="text-2xl font-bold text-green-900">
                ${totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="text-sm text-blue-600 mb-1">Average Payment</div>
              <div className="text-2xl font-bold text-blue-900">
                ${(totalAmount / filteredPayments.length || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          
          {/* Payment View */}
          {view === 'list' ? (
            <PaymentHistoryTable payments={filteredPayments} />
          ) : (
            <PaymentCalendar />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentHistory;