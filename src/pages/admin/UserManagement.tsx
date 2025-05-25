import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Filter, Edit2, Trash2, UserPlus, Eye } from 'lucide-react';
import { useState, useRef } from 'react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAdminStore } from '../../store/adminStore';
import { toast } from 'react-hot-toast';
import { supabase } from '../../services/db';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';

interface UserFormData {
  id?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  employment_status?: string;
  employer_name?: string;
  monthly_income?: number;
  role: string;
}

const UserManagement = () => {
  const { users, loading, fetchUsers, updateUser, setupSubscriptions, cleanup } = useAdminStore(); 
  const { isAdmin } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserFormData | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    id: '',
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    employment_status: '',
    employer_name: '',
    monthly_income: 0,
    role: 'user'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUserData, setNewUserData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user'
  });
  const [emailToCheck, setEmailToCheck] = useState('');
  const [userRoleResult, setUserRoleResult] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchUsers();
    setupSubscriptions();
    return () => cleanup();
  }, [fetchUsers, setupSubscriptions, cleanup]);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        setShowForm(false);
      }
    };

    if (showForm) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showForm]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      employment_status: '',
      employer_name: '',
      monthly_income: 0,
      role: 'user'
    });
    setShowForm(true);
  };

  const handleEditUser = (user: any) => {
    setEditingUser(user);
    setFormData({
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email, 
      phone: user.phone || '',
      address: user.address || '',
      city: user.city || '',
      state: user.state || '',
      zip: user.zip || '',
      employment_status: user.employment_status || '',
      employer_name: user.employer_name || '',
      monthly_income: user.monthly_income || 0,
      role: user.role
    });
    setShowForm(true);
  };

  const handleUpdateUserRole = async (userId: string, role: string) => {
    try {
      await updateUser(userId, { role });
      toast.success(`User role updated to ${role}`);
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const handleNewUserInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUserData(prev => ({ ...prev, [name]: value }));
  };

  const handleCreateUser = async () => {
    try {
      setCreatingUser(true);
      setIsSubmitting(true);
      
      if (!isAdmin) {
        throw new Error('Only administrators can create users');
      }
      
      // Check if we have the supabase client
      if (!supabase) {
        throw new Error('Database connection not available');
      }
      
      // Step 1: Create the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUserData.email,
        password: newUserData.password,
        options: {
          data: {
            first_name: newUserData.firstName,
            last_name: newUserData.lastName
          }
        }
      });
      
      if (authError) throw authError;
      
      // Step 2: Make sure we have a user ID before proceeding
      if (authData.user) {
        const userId = authData.user.id;
        
        try {
          // Step 3: Create the profile with the user's ID and specified role
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: userId, // Use the ID from auth.user
              first_name: newUserData.firstName,
              last_name: newUserData.lastName,
              email: newUserData.email,
              role: newUserData.role
            });
            
          if (profileError) {
            console.error('Profile creation error:', profileError);
            throw new Error(`Profile creation failed: ${profileError.message}`);
          }
          
          toast.success('User created successfully');
          
          // Refresh the user list
          fetchUsers();
          
          // Reset form and close modal
          setNewUserData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            role: 'user'
          });
          setCreatingUser(false);
        } catch (profileError) {
          console.error('Error creating profile:', profileError);
          throw new Error('User created but profile setup failed. Please contact support.');
        }
      } else {
        throw new Error('User creation failed - no user ID returned');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(`Failed to create user: ${error.message}`);
    } finally {
      setIsSubmitting(false);
      setCreatingUser(false);
    }
  };

  const handleCheckUserRole = async () => {
    if (!emailToCheck) {
      toast.error('Please enter an email address');
      return;
    }
    
    try {
      const user = await authService.getUserByEmail(emailToCheck);
      if (user) {
        setUserRoleResult(user.role);
        toast.success(`User found: ${user.firstName} ${user.lastName} (${user.role})`);
      } else {
        setUserRoleResult(null);
        toast.error('User not found');
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      toast.error('Failed to check user role');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingUser) {
        await updateUser(editingUser.id!, formData);
        toast.success('User updated successfully');
      } else {
        // In a real implementation, this would create a new user
        toast.success('User creation would happen here');
      }
      setShowForm(false);
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    }
    setIsSubmitting(false);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <Button
          onClick={() => setCreatingUser(true)} 
          leftIcon={<UserPlus size={18} />} 
          className="ml-2"
        >
          Create New User
        </Button>
      </div>

      {/* Email Role Lookup */}
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Check User Role by Email</h2>
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={emailToCheck}
                onChange={(e) => setEmailToCheck(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <Button onClick={handleCheckUserRole}>
              Check Role
            </Button>
          </div>
          
          {userRoleResult !== null && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <p className="font-medium">User Role: <span className="text-primary-600">{userRoleResult}</span></p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle>Users</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-800 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-800 font-medium">
                                {user.first_name[0]}{user.last_name[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.role}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="text-primary-600 hover:text-primary-900"
                            title="Edit User"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setFormData({
                                id: user.id,
                                first_name: user.first_name,
                                last_name: user.last_name,
                                email: user.email,
                                phone: user.phone || '',
                                address: user.address || '',
                                city: user.city || '',
                                state: user.state || '',
                                zip: user.zip || '',
                                employment_status: user.employment_status || '',
                                employer_name: user.employer_name || '',
                                monthly_income: user.monthly_income || 0,
                                role: user.role
                              });
                              setShowForm(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 ml-2"
                            title="View User Details"
                          >
                            <Eye size={18} />
                          </button>
                          <button 
                            className="text-red-600 hover:text-red-900"
                            title="Delete User"
                            onClick={() => toast.error('User deletion is disabled for safety')}
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
        </CardContent>
      </Card>

      {/* User Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ZIP
                  </label>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employment Status
                </label>
                <select
                  name="employment_status"
                  value={formData.employment_status}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Select status</option>
                  <option value="full-time">Full-time</option>
                  <option value="part-time">Part-time</option>
                  <option value="self-employed">Self-employed</option>
                  <option value="unemployed">Unemployed</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Employer Name
                </label>
                <input
                  type="text"
                  name="employer_name"
                  value={formData.employer_name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Income
                </label>
                <input
                  type="number"
                  name="monthly_income"
                  value={formData.monthly_income}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="sales_executive">Sales Executive</option>
                  <option value="credit_analyst">Credit Analyst</option>
                  <option value="recovery_and_collections">Recovery And Collections</option>
                  <option value="inspection_and_verification">Inspection And Verification</option>
                  <option value="company_manager">Company Manager</option>
                  <option value="finance">Finance</option>
                </select>
              </div>
              
            </form>
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                disabled={isSubmitting}
                variant="outline"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSubmit}
                isLoading={isSubmitting}
              >
                {editingUser ? 'Update User' : 'Add User'}
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Create New User Modal */}
      {creatingUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">Create New User</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={newUserData.email}
                  onChange={handleNewUserInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={newUserData.password}
                  onChange={handleNewUserInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  First Name
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={newUserData.firstName}
                  onChange={handleNewUserInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Last Name
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={newUserData.lastName}
                  onChange={handleNewUserInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Role
                </label>
                <select
                  name="role"
                  value={newUserData.role}
                  onChange={handleNewUserInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="company_manager">Company Manager</option>
                  <option value="company">Company</option>
                  <option value="sales_executive">Sales Executive</option>
                  <option value="credit_analyst">Credit Analyst</option>
                  <option value="recovery_and_collections">Recovery And Collections</option>
                  <option value="inspection_and_verification">Inspection And Verification</option>
                  <option value="finance">Finance</option>
                </select>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCreatingUser(false)}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateUser}
                isLoading={isSubmitting}
              >
                Create User
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;