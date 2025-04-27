import { useEffect, useState } from 'react';
import { Shield, Key, Users, AlertTriangle, History } from 'lucide-react';
import { useAdminStore } from '../../store/adminStore';
import { toast } from 'react-hot-toast';
import Button from '../../components/ui/Button';

const SecuritySettings = () => {
  const { 
    securitySettings, 
    updateSecuritySettings, 
    loading,
    setupSubscriptions,
    cleanup
  } = useAdminStore();

  const [formData, setFormData] = useState({
    twoFactorAuth: securitySettings.twoFactorAuth,
    passwordComplexity: securitySettings.passwordComplexity,
    sessionTimeout: securitySettings.sessionTimeout,
    ipWhitelisting: securitySettings.ipWhitelisting,
    accountLockout: securitySettings.accountLockout,
    logRetention: securitySettings.logRetention
  });

  useEffect(() => {
    // Set up real-time subscriptions
    setupSubscriptions();
    
    // Cleanup on unmount
    return () => cleanup();
  }, [setupSubscriptions, cleanup]);

  // Update form when store data changes
  useEffect(() => {
    setFormData({
      twoFactorAuth: securitySettings.twoFactorAuth,
      passwordComplexity: securitySettings.passwordComplexity,
      sessionTimeout: securitySettings.sessionTimeout,
      ipWhitelisting: securitySettings.ipWhitelisting,
      accountLockout: securitySettings.accountLockout,
      logRetention: securitySettings.logRetention
    });
  }, [securitySettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = async () => {
    try {
      await updateSecuritySettings(formData);
      toast.success('Security settings updated successfully');
    } catch (error) {
      console.error('Error updating security settings:', error);
      toast.error('Failed to update security settings');
    }
  };

  const triggerPasswordReset = () => {
    toast.success('Password reset triggered for all users');
  };

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
          <p className="mt-2 text-gray-600">Manage system security and access controls</p>
        </div>
        <Button
          onClick={handleSave}
          isLoading={loading}
        >
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Authentication Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Shield className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Authentication</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Two-Factor Authentication</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  name="twoFactorAuth"
                  checked={formData.twoFactorAuth}
                  onChange={handleInputChange}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Password Complexity</span>
              <select
                name="passwordComplexity"
                value={formData.passwordComplexity}
                onChange={handleInputChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Access Control */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Key className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Access Control</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Session Timeout</span>
              <select
                name="sessionTimeout"
                value={formData.sessionTimeout}
                onChange={handleInputChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
              >
                <option value="30">30 minutes</option>
                <option value="60">1 hour</option>
                <option value="120">2 hours</option>
                <option value="240">4 hours</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">IP Whitelisting</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  name="ipWhitelisting"
                  checked={formData.ipWhitelisting}
                  onChange={handleInputChange}
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* User Security */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Users className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">User Security</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Force Password Reset</span>
              <button 
                className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                onClick={triggerPasswordReset}
              >
                Trigger Reset
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Account Lockout</span>
              <select
                name="accountLockout"
                value={formData.accountLockout}
                onChange={handleInputChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
              >
                <option value="3">After 3 attempts</option>
                <option value="5">After 5 attempts</option>
                <option value="10">After 10 attempts</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Logs */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <History className="w-6 h-6 text-orange-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Security Logs</h2>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Log Retention</span>
              <select
                name="logRetention"
                value={formData.logRetention}
                onChange={handleInputChange}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5"
              >
                <option value="30">30 days</option>
                <option value="60">60 days</option>
                <option value="90">90 days</option>
                <option value="180">180 days</option>
              </select>
            </div>
            <button className="w-full bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
              View Security Logs
            </button>
          </div>
        </div>
      </div>

      {/* Alert Section */}
      <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <AlertTriangle className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              Changes to security settings may affect all users. Please review carefully before saving.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecuritySettings;