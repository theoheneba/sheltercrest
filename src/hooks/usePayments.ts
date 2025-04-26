import { useState, useEffect } from 'react';

// Mock payment data - would come from an API in a real application
const mockRecentPayments = [
  { id: '1', date: '2025-06-15', amount: 1200.00, status: 'Completed' as const },
  { id: '2', date: '2025-05-15', amount: 1200.00, status: 'Completed' as const },
  { id: '3', date: '2025-04-15', amount: 1200.00, status: 'Completed' as const },
  { id: '4', date: '2025-03-15', amount: 1200.00, status: 'Completed' as const },
  { id: '5', date: '2025-02-15', amount: 1200.00, status: 'Completed' as const },
];

const mockUpcomingPayment = {
  id: '6',
  date: '2025-07-15',
  amount: 1200.00,
  status: 'Pending' as const,
  daysUntil: 15 // Calculated based on current date
};

export const usePayments = () => {
  const [recentPayments, setRecentPayments] = useState<typeof mockRecentPayments>([]);
  const [upcomingPayment, setUpcomingPayment] = useState<typeof mockUpcomingPayment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchPayments = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setRecentPayments(mockRecentPayments);
          setUpcomingPayment(mockUpcomingPayment);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  return {
    recentPayments,
    upcomingPayment,
    loading,
    error,
  };
};