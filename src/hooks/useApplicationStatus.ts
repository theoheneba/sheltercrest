import { useState, useEffect } from 'react';

// Mock application data - would come from an API in a real application
const mockApplicationData = {
  id: 'APP-12345',
  status: 'in-review',
  submittedAt: '2025-04-10T14:30:00Z',
  rentAmount: 1200,
  assistanceAmount: null, // Null until approved
  landlordName: 'Skyline Properties',
  landlordEmail: 'payments@skylineproperties.com',
  landlordPhone: '(555) 123-4567',
  propertyAddress: '123 Main Street, Apt 4B, Anytown, CA 90210',
  leaseStartDate: '2025-01-01',
  leaseEndDate: '2025-12-31',
};

export type ApplicationStatus = 'pending' | 'in-review' | 'approved' | 'rejected';

export const useApplicationStatus = () => {
  const [status, setStatus] = useState<ApplicationStatus>('in-review');
  const [applicationData, setApplicationData] = useState<typeof mockApplicationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    // In a real app, this would fetch from an API
    const fetchApplicationStatus = async () => {
      try {
        // Simulate API call
        setTimeout(() => {
          setStatus(mockApplicationData.status as ApplicationStatus);
          setApplicationData(mockApplicationData);
          setLoading(false);
        }, 500);
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchApplicationStatus();
  }, []);

  return {
    status,
    applicationData,
    loading,
    error,
  };
};