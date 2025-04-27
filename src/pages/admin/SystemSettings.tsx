import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Settings, Database, Globe, Mail, Bell, Save, RefreshCw } from 'lucide-react';
import Card, { CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { useAdminStore } from '../../store/adminStore';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';

const SystemSettings = () => {
  const { isAdmin } = useAuth();
  const { 
    systemSettings, 
    databaseSettings, 
    updateSystemSettings, 
    updateDatabaseSettings, 
    backupDatabase,
    loading,
    setupSubscriptions,
    cleanup
  } = useAdminStore();
  
  const [formData, setFormData] = useState({
    systemName: systemSettings.systemName,
    defaultCurrency: systemSettings.defaultCurrency,
    defaultLanguage: systemSettings.defaultLanguage,
    smtpServer: systemSettings.smtpServer,
    smtpPort: systemSettings.smtpPort,
    senderEmail: systemSettings.senderEmail,
    emailNotifications: systemSettings.emailNotifications,
    systemAlerts: systemSettings.systemAlerts,
    applicationUpdates: systemSettings.applicationUpdates,
    backupFrequency: databaseSettings.backupFrequency,
    backupRetentionPeriod: databaseSettings.backupRetentionPeriod
  });

  useEffect(() => {
    if (!isAdmin) {
      toast.error("You don't have permission to access this page");
      return;
    }
    
    // Set up real-time subscriptions
    setupSubscriptions();
    
    // Cleanup on unmount
    return () => cleanup();
  }, [setupSubscriptions, cleanup, isAdmin]);

  // Update form when store data changes
  useEffect(() => {
    setFormData({
      systemName: systemSettings.systemName,
      defaultCurrency: systemSettings.defaultCurrency,
      defaultLanguage: systemSettings.defaultLanguage,
      smtpServer: systemSettings.smtpServer,
      smtpPort: systemSettings.smtpPort,
      senderEmail: systemSettings.senderEmail,
      emailNotifications: systemSettings.emailNotifications,
      systemAlerts: systemSettings.systemAlerts,
      applicationUpdates: systemSettings.applicationUpdates,
      backupFrequency: databaseSettings.backupFrequency,
      backupRetentionPeriod: databaseSettings.backupRetentionPeriod
    });
  }, [systemSettings, databaseSettings]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSave = async () => {
    if (!isAdmin) {
      toast.error("You don't have permission to update settings");
      return;
    }
    
    try {
      // Update system settings
      await updateSystemSettings({
        systemName: formData.systemName,
        defaultCurrency: formData.defaultCurrency,
        defaultLanguage: formData.defaultLanguage,
        smtpServer: formData.smtpServer,
        smtpPort: Number(formData.smtpPort),
        senderEmail: formData.senderEmail,
        emailNotifications: formData.emailNotifications,
        systemAlerts: formData.systemAlerts,
        applicationUpdates: formData.applicationUpdates
      });

      // Update database settings
      await updateDatabaseSettings({
        backupFrequency: formData.backupFrequency as 'daily' | 'weekly' | 'monthly',
        backupRetentionPeriod: Number(formData.backupRetentionPeriod)
      });

      toast.success('Settings saved successfully');
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(`Error saving settings: ${error.message}`);
    }
  };

  const handleBackupNow = async () => {
    if (!isAdmin) {
      toast.error("You don't have permission to perform backups");
      return;
    }
    
    try {
      await backupDatabase();
      toast.success('Database backup initiated');
    } catch (error) {
      console.error('Error initiating backup:', error);
      toast.error('Failed to initiate backup');
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800">Access Denied</h2>
          <p className="mt-2 text-gray-600">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <Button
          onClick={handleSave}
          isLoading={loading}
          leftIcon={<Save size={18} />}
        >
          Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-primary-600" />
                <CardTitle>General Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    System Name
                  </label>
                  <input
                    type="text"
                    name="systemName"
                    value={formData.systemName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Currency
                  </label>
                  <select
                    name="defaultCurrency"
                    value={formData.defaultCurrency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="GHS">GHS (₵)</option>
                    <option value="USD">USD ($)</option>
                    <option value="EUR">EUR (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Language
                  </label>
                  <select
                    name="defaultLanguage"
                    value={formData.defaultLanguage}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="en">English</option>
                    <option value="fr">French</option>
                    <option value="es">Spanish</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Database Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Database className="h-6 w-6 text-green-600" />
                <CardTitle>Database Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Frequency
                  </label>
                  <select
                    name="backupFrequency"
                    value={formData.backupFrequency}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Backup Retention Period
                  </label>
                  <select
                    name="backupRetentionPeriod"
                    value={formData.backupRetentionPeriod}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="30">30 days</option>
                    <option value="60">60 days</option>
                    <option value="90">90 days</option>
                  </select>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<RefreshCw size={16} />}
                  className="w-full"
                  onClick={handleBackupNow}
                >
                  Backup Now
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Email Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Mail className="h-6 w-6 text-blue-600" />
                <CardTitle>Email Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Server
                  </label>
                  <input
                    type="text"
                    name="smtpServer"
                    value={formData.smtpServer}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SMTP Port
                  </label>
                  <input
                    type="number"
                    name="smtpPort"
                    value={formData.smtpPort}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Sender Email
                  </label>
                  <input
                    type="email"
                    name="senderEmail"
                    value={formData.senderEmail}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Notification Settings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <div className="flex items-center space-x-2">
                <Bell className="h-6 w-6 text-purple-600" />
                <CardTitle>Notification Settings</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Email Notifications
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      name="emailNotifications"
                      checked={formData.emailNotifications}
                      onChange={handleInputChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    System Alerts
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      name="systemAlerts"
                      checked={formData.systemAlerts}
                      onChange={handleInputChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    Application Updates
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      name="applicationUpdates"
                      checked={formData.applicationUpdates}
                      onChange={handleInputChange}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* System Information */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Globe className="h-6 w-6 text-gray-600" />
              <CardTitle>System Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Version</h3>
                <p className="mt-1 text-sm text-gray-900">2.5.0</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Last Updated</h3>
                <p className="mt-1 text-sm text-gray-900">{new Date().toLocaleDateString()}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-500">Environment</h3>
                <p className="mt-1 text-sm text-gray-900">Production</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SystemSettings;