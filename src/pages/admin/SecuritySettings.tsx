import React from 'react';
import { Shield, Key, Users, AlertTriangle, History } from 'lucide-react';

const SecuritySettings = () => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Security Settings</h1>
        <p className="mt-2 text-gray-600">Manage system security and access controls</p>
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
                <input type="checkbox" className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Password Complexity</span>
              <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5">
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
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
              <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5">
                <option>30 minutes</option>
                <option>1 hour</option>
                <option>2 hours</option>
                <option>4 hours</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">IP Whitelisting</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" />
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
              <button className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 transition-colors">
                Trigger Reset
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-700">Account Lockout</span>
              <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5">
                <option>After 3 attempts</option>
                <option>After 5 attempts</option>
                <option>After 10 attempts</option>
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
              <select className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 p-2.5">
                <option>30 days</option>
                <option>60 days</option>
                <option>90 days</option>
                <option>180 days</option>
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