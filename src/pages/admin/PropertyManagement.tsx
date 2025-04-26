import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Building, Plus, Search, Filter, MapPin, Home, DollarSign, Users, Edit2, Trash2 } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

// Mock data
const mockProperties = [
  {
    id: '1',
    name: 'Skyline Apartments',
    address: '123 Main St, Accra',
    units: 24,
    occupiedUnits: 20,
    monthlyRevenue: 28000,
    status: 'active'
  },
  {
    id: '2',
    name: 'Harbor View Complex',
    address: '456 Beach Road, Tema',
    units: 36,
    occupiedUnits: 30,
    monthlyRevenue: 42000,
    status: 'active'
  },
  {
    id: '3',
    name: 'Green Valley Residences',
    address: '789 Park Ave, Kumasi',
    units: 18,
    occupiedUnits: 15,
    monthlyRevenue: 21000,
    status: 'maintenance'
  }
];

const PropertyManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Property Management</h1>
        <Button
          leftIcon={<Plus size={18} />}
        >
          Add Property
        </Button>
      </div>

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
                  <p className="text-sm font-medium text-blue-600">Total Properties</p>
                  <h3 className="text-2xl font-bold text-blue-900 mt-1">12</h3>
                  <p className="text-sm text-blue-600 mt-1">3 cities</p>
                </div>
                <div className="p-3 bg-blue-200 rounded-lg">
                  <Building className="h-6 w-6 text-blue-700" />
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
                  <p className="text-sm font-medium text-green-600">Total Units</p>
                  <h3 className="text-2xl font-bold text-green-900 mt-1">156</h3>
                  <p className="text-sm text-green-600 mt-1">85% occupied</p>
                </div>
                <div className="p-3 bg-green-200 rounded-lg">
                  <Home className="h-6 w-6 text-green-700" />
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
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-600">Total Revenue</p>
                  <h3 className="text-2xl font-bold text-purple-900 mt-1">GH₵ 245K</h3>
                  <p className="text-sm text-purple-600 mt-1">Monthly</p>
                </div>
                <div className="p-3 bg-purple-200 rounded-lg">
                  <DollarSign className="h-6 w-6 text-purple-700" />
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
          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-600">Total Tenants</p>
                  <h3 className="text-2xl font-bold text-orange-900 mt-1">132</h3>
                  <p className="text-sm text-orange-600 mt-1">Active leases</p>
                </div>
                <div className="p-3 bg-orange-200 rounded-lg">
                  <Users className="h-6 w-6 text-orange-700" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Properties</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search properties..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="maintenance">Maintenance</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Units</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-lg bg-primary-100 flex items-center justify-center">
                            <Building className="h-5 w-5 text-primary-600" />
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{property.name}</div>
                          <div className="text-sm text-gray-500">{property.units} units</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="h-4 w-4 text-gray-400 mr-1" />
                        {property.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{property.occupiedUnits}/{property.units}</div>
                      <div className="text-sm text-gray-500">
                        {Math.round((property.occupiedUnits / property.units) * 100)}% occupied
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      GH₵ {property.monthlyRevenue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        property.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {property.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button className="text-primary-600 hover:text-primary-900">
                          <Edit2 size={18} />
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PropertyManagement;