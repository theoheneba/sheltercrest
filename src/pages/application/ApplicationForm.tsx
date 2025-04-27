import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { calculateInitialPayment, formatCurrency } from '../../utils/paymentCalculations';
import { useConditionalEligibility } from '../../hooks/useConditionalEligibility';
import { useUserStore } from '../../store/userStore';
import { toast } from 'react-hot-toast';

const ApplicationForm = () => {
  const navigate = useNavigate();
  const { isEligible, isLoading, redirectToEligibilityCheck } = useConditionalEligibility();
  const { createApplication, loading } = useUserStore();
  
  const [formData, setFormData] = useState({
    monthlyRent: '',
    depositAmount: '',
    interestAmount: '',
    serviceFee: '',
    visitFee: '',
    processingFee: '',
    totalInitialPayment: '',
    landlordName: '',
    landlordEmail: '',
    landlordPhone: '',
    propertyAddress: '',
    leaseStartDate: '',
    leaseEndDate: ''
  });

  useEffect(() => {
    if (!isLoading && !isEligible) {
      redirectToEligibilityCheck();
    }
  }, [isEligible, isLoading, redirectToEligibilityCheck]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isEligible) {
    return null; // Component will redirect in useEffect
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Calculate all fees when monthly rent changes
      if (name === 'monthlyRent' && value) {
        const monthlyRent = parseFloat(value);
        const { deposit, interest, serviceFee, visitFee, processingFee, total } = calculateInitialPayment(monthlyRent);
        return {
          ...newData,
          depositAmount: deposit.toString(),
          interestAmount: interest.toString(),
          serviceFee: serviceFee.toString(),
          visitFee: visitFee.toString(),
          processingFee: processingFee.toString(),
          totalInitialPayment: total.toString()
        };
      }
      
      return newData;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Validate required fields
      const requiredFields = [
        'monthlyRent',
        'landlordName',
        'landlordEmail',
        'landlordPhone',
        'propertyAddress',
        'leaseStartDate',
        'leaseEndDate'
      ];

      const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]);
      
      if (missingFields.length > 0) {
        toast.error('Please fill in all required fields');
        return;
      }

      // Submit application
      await createApplication({
        monthly_rent: parseFloat(formData.monthlyRent),
        deposit_amount: parseFloat(formData.depositAmount),
        interest_amount: parseFloat(formData.interestAmount),
        service_fee: parseFloat(formData.serviceFee),
        visit_fee: parseFloat(formData.visitFee),
        processing_fee: parseFloat(formData.processingFee),
        total_initial_payment: parseFloat(formData.totalInitialPayment),
        landlord_name: formData.landlordName,
        landlord_email: formData.landlordEmail,
        landlord_phone: formData.landlordPhone,
        property_address: formData.propertyAddress,
        lease_start_date: formData.leaseStartDate,
        lease_end_date: formData.leaseEndDate,
        status: 'pending'
      });

      // Navigate to dashboard on success
      navigate('/dashboard');
    } catch (error) {
      console.error('Application submission error:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  };

  const monthlyRent = formData.monthlyRent ? parseFloat(formData.monthlyRent) : 0;
  const initialPayment = calculateInitialPayment(monthlyRent);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Rent Assistance Application</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="monthlyRent" className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Rent Amount (GH₵)
                  </label>
                  <input
                    type="number"
                    id="monthlyRent"
                    name="monthlyRent"
                    value={formData.monthlyRent}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="leaseStartDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Lease Start Date
                  </label>
                  <input
                    type="date"
                    id="leaseStartDate"
                    name="leaseStartDate"
                    value={formData.leaseStartDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="leaseEndDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Lease End Date
                  </label>
                  <input
                    type="date"
                    id="leaseEndDate"
                    name="leaseEndDate"
                    value={formData.leaseEndDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="propertyAddress" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Address
                </label>
                <input
                  type="text"
                  id="propertyAddress"
                  name="propertyAddress"
                  value={formData.propertyAddress}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="landlordName" className="block text-sm font-medium text-gray-700 mb-1">
                    Landlord Name
                  </label>
                  <input
                    type="text"
                    id="landlordName"
                    name="landlordName"
                    value={formData.landlordName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="landlordEmail" className="block text-sm font-medium text-gray-700 mb-1">
                    Landlord Email
                  </label>
                  <input
                    type="email"
                    id="landlordEmail"
                    name="landlordEmail"
                    value={formData.landlordEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="landlordPhone" className="block text-sm font-medium text-gray-700 mb-1">
                    Landlord Phone
                  </label>
                  <input
                    type="tel"
                    id="landlordPhone"
                    name="landlordPhone"
                    value={formData.landlordPhone}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full"
                isLoading={loading}
              >
                Submit Application
              </Button>
            </form>
          </Card>
        </div>
        
        <div>
          <Card>
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">Payment Summary</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700">Initial Payment Required</h3>
                  <div className="mt-2 space-y-2 text-sm">
                    <p className="flex justify-between">
                      <span>Two Months Deposit:</span>
                      <span>{formatCurrency(initialPayment.deposit)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Service Fee:</span>
                      <span>{formatCurrency(initialPayment.serviceFee)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Property Visit Fee:</span>
                      <span>{formatCurrency(initialPayment.visitFee)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Document Processing Fee:</span>
                      <span>{formatCurrency(initialPayment.processingFee)}</span>
                    </p>
                    <p className="flex justify-between">
                      <span>Interest (28% on 1 month):</span>
                      <span>{formatCurrency(initialPayment.interest)}</span>
                    </p>
                    <div className="pt-2 mt-2 border-t border-gray-200">
                      <p className="flex justify-between font-semibold">
                        <span>Total Initial Payment:</span>
                        <span>{formatCurrency(initialPayment.total)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-medium text-gray-700 mb-2">Important Notes</h3>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• Monthly payments due: 28th - 3rd (grace period)</li>
                    <li>• Late payment fees:
                      <ul className="ml-4 mt-1">
                        <li>- 4th-10th: 10% penalty</li>
                        <li>- 11th-18th: 15% penalty</li>
                        <li>- 19th-25th: 25% penalty</li>
                      </ul>
                    </li>
                    <li>• Deposit refundable after completing all payments</li>
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ApplicationForm;