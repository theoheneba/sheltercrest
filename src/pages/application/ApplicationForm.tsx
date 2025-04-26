import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { calculateInitialPayment, formatCurrency } from '../../utils/paymentCalculations';

const ApplicationForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    loanAmount: '',
    rentAmount: '',
    purpose: '',
    duration: '',
    income: '',
    employment: '',
    landlordName: '',
    landlordEmail: '',
    landlordPhone: '',
    propertyAddress: '',
    leaseStartDate: '',
    leaseEndDate: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  const initialPayment = formData.rentAmount ? 
    calculateInitialPayment(Number(formData.rentAmount)) : 
    { deposit: 0, interest: 0, total: 0 };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Rent Assistance Application</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="rentAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Rent Amount (GH₵)
                  </label>
                  <input
                    type="number"
                    id="rentAmount"
                    name="rentAmount"
                    value={formData.rentAmount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="income" className="block text-sm font-medium text-gray-700 mb-1">
                    Monthly Income (GH₵)
                  </label>
                  <input
                    type="number"
                    id="income"
                    name="income"
                    value={formData.income}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="employment" className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Status
                </label>
                <select
                  id="employment"
                  name="employment"
                  value={formData.employment}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                >
                  <option value="">Select status</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="self-employed">Self-employed</option>
                  <option value="contract">Contract</option>
                </select>
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

              <Button type="submit" className="w-full">
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
                      <span>Company Interest (28%):</span>
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