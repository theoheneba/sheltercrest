import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart2,
  Settings,
  Shield,
  Bell,
  HelpCircle,
  Building, 
  CreditCard,
  Files,
  Cog,
  MessageSquare,
  Briefcase
} from 'lucide-react';

interface AdminSidebarProps {
  open: boolean;
  theme: 'light' | 'dark';
}

const AdminSidebar = ({ open, theme }: AdminSidebarProps) => {
  const menuItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/applications', icon: FileText, label: 'Applications' },
    { path: '/admin/payments', icon: CreditCard, label: 'Payments' },
    { path: '/admin/documents', icon: Files, label: 'Documents' },
    { path: '/admin/configuration', icon: Cog, label: 'Configuration' },
    { path: '/admin/support', icon: MessageSquare, label: 'Support' },
    { path: '/admin/analytics', icon: BarChart2, label: 'Analytics' },
    { path: '/admin/properties', icon: Building, label: 'Properties' },
    { path: '/admin/security', icon: Shield, label: 'Security' },
    { path: '/admin/notifications', icon: Bell, label: 'Notifications' },
    { path: '/admin/settings', icon: Settings, label: 'Settings' },
    { path: '/admin/help', icon: HelpCircle, label: 'Help & Support' },
    { path: '/admin/companies', icon: Briefcase, label: 'Companies' },
  ];

  return (
    <aside className={`fixed left-0 top-0 h-screen transition-all duration-300 z-20 ${
      theme === 'dark' ? 'bg-gray-800' : 'bg-white'
    } ${open ? 'w-64' : 'w-20'} border-r ${
      theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
    } pt-20 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600`}>
      <div className="flex justify-center py-4 border-b border-gray-200 dark:border-gray-700">
        {open ? (
          <img 
            src="https://translogixgroup.com/wp-content/uploads/2025/05/shelterlogo.png" 
            alt="ShelterCrest Logo" 
            className="h-8 w-auto"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
            <span className="text-lg font-bold text-primary-700">SC</span>
          </div>
        )}
      </div>
      <nav className="p-4 mt-2">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center px-3 py-2.5 rounded-lg transition-colors
                    ${isActive 
                      ? 'bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-100 font-medium' 
                      : `${theme === 'dark' 
                          ? 'text-gray-300 hover:bg-gray-700' 
                          : 'text-gray-600 hover:bg-gray-100'}`
                    }
                  `}
                >
                  <Icon size={20} className={`${open ? 'mr-3' : 'mx-auto'}`} />
                  {open && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 dark:border-gray-700">
        {open && (
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>ShelterCrest Admin</p>
            <p>v2.5.0</p>
          </div>
        )}
      </div>
    </aside>
  );
};

export default AdminSidebar;