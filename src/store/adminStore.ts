import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase, subscribeToChanges } from '../services/db';
import { toast } from 'react-hot-toast'; 

interface SystemSettings {
  id?: string;
  systemName: string;
  defaultCurrency: string;
  defaultLanguage: string;
  smtpServer: string;
  smtpPort: number;
  senderEmail: string;
  emailNotifications: boolean;
  systemAlerts: boolean;
  applicationUpdates: boolean;
}

interface SecuritySettings {
  id?: string;
  twoFactorAuth: boolean;
  passwordComplexity: 'high' | 'medium' | 'low';
  sessionTimeout: number;
  ipWhitelisting: boolean;
  accountLockout: number;
  logRetention: number;
}

interface DatabaseSettings {
  id?: string;
  backupFrequency: 'daily' | 'weekly' | 'monthly';
  backupRetentionPeriod: number;
}

interface Property {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  total_units: number;
  occupied_units: number;
  monthly_revenue: number;
  status: 'active' | 'maintenance' | 'inactive';
}

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  created_at: string;
}

interface AdminState {
  systemSettings: SystemSettings;
  securitySettings: SecuritySettings;
  databaseSettings: DatabaseSettings;
  properties: Property[];
  users: User[];
  loading: boolean;
  error: string | null;
  subscriptions: (() => void)[];
  
  // Functions
  setupSubscriptions: () => void;
  cleanup: () => void;
  fetchSystemSettings: () => Promise<void>;
  updateSystemSettings: (settings: Partial<SystemSettings>) => Promise<void>;
  fetchSecuritySettings: () => Promise<void>;
  updateSecuritySettings: (settings: Partial<SecuritySettings>) => Promise<void>;
  fetchDatabaseSettings: () => Promise<void>;
  updateDatabaseSettings: (settings: Partial<DatabaseSettings>) => Promise<void>;
  backupDatabase: () => Promise<void>;
  fetchProperties: () => Promise<void>;
  addProperty: (property: Omit<Property, 'id'>) => Promise<void>;
  updateProperty: (id: string, data: Partial<Property>) => Promise<void>;
  deleteProperty: (id: string) => Promise<void>; 
  fetchUsers: () => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
}

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      systemSettings: {
        systemName: 'RentAssist Admin',
        defaultCurrency: 'GHS',
        defaultLanguage: 'en',
        smtpServer: 'smtp.hostinger.com',
        smtpPort: 465,
        senderEmail: 'info@sheltercrest.org',
        emailNotifications: true,
        systemAlerts: true,
        applicationUpdates: true,
      },
      
      securitySettings: {
        twoFactorAuth: false,
        passwordComplexity: 'high',
        sessionTimeout: 30,
        ipWhitelisting: false,
        accountLockout: 3,
        logRetention: 30,
      },
      
      databaseSettings: {
        backupFrequency: 'daily',
        backupRetentionPeriod: 30,
      },
      
      properties: [],
      users: [],
      loading: false,
      error: null,
      subscriptions: [],
      
      setupSubscriptions: () => {
        const subscriptions = [
          // Subscribe to system settings changes
          subscribeToChanges('system_settings', (payload) => {
            const { new: newSettings } = payload;
            if (!newSettings) return;
            
            set(state => ({
              systemSettings: {
                ...state.systemSettings,
                systemName: newSettings.system_name || state.systemSettings.systemName,
                defaultCurrency: newSettings.default_currency || state.systemSettings.defaultCurrency,
                defaultLanguage: newSettings.default_language || state.systemSettings.defaultLanguage,
                smtpServer: newSettings.smtp_server || state.systemSettings.smtpServer,
                smtpPort: newSettings.smtp_port || state.systemSettings.smtpPort,
                senderEmail: newSettings.sender_email || state.systemSettings.senderEmail,
                emailNotifications: newSettings.email_notifications !== undefined ? 
                  newSettings.email_notifications : state.systemSettings.emailNotifications,
                systemAlerts: newSettings.system_alerts !== undefined ? 
                  newSettings.system_alerts : state.systemSettings.systemAlerts,
                applicationUpdates: newSettings.application_updates !== undefined ? 
                  newSettings.application_updates : state.systemSettings.applicationUpdates,
              }
            }));
          }),
          
          // Subscribe to security settings changes
          subscribeToChanges('security_settings', (payload) => {
            const { new: newSettings } = payload;
            if (!newSettings) return;
            
            set(state => ({
              securitySettings: {
                ...state.securitySettings,
                twoFactorAuth: newSettings.two_factor_auth !== undefined ? 
                  newSettings.two_factor_auth : state.securitySettings.twoFactorAuth,
                passwordComplexity: newSettings.password_complexity || state.securitySettings.passwordComplexity,
                sessionTimeout: newSettings.session_timeout || state.securitySettings.sessionTimeout,
                ipWhitelisting: newSettings.ip_whitelisting !== undefined ? 
                  newSettings.ip_whitelisting : state.securitySettings.ipWhitelisting,
                accountLockout: newSettings.account_lockout || state.securitySettings.accountLockout,
                logRetention: newSettings.log_retention || state.securitySettings.logRetention,
              }
            }));
          }),
          
          // Subscribe to database settings changes
          subscribeToChanges('database_settings', (payload) => {
            const { new: newSettings } = payload;
            if (!newSettings) return;
            
            set(state => ({
              databaseSettings: {
                ...state.databaseSettings,
                backupFrequency: newSettings.backup_frequency || state.databaseSettings.backupFrequency,
                backupRetentionPeriod: newSettings.backup_retention_period || state.databaseSettings.backupRetentionPeriod,
              }
            }));
          }),
          
          // Subscribe to properties changes
          subscribeToChanges('properties', (payload) => {
            const { eventType, new: newProperty, old: oldProperty } = payload;
            
            set(state => {
              switch (eventType) {
                case 'INSERT':
                  return {
                    properties: [...state.properties, newProperty]
                  };
                case 'UPDATE':
                  return {
                    properties: state.properties.map(prop =>
                      prop.id === newProperty.id ? { ...prop, ...newProperty } : prop
                    )
                  };
                case 'DELETE':
                  return {
                    properties: state.properties.filter(prop => prop.id !== oldProperty.id)
                  };
                default:
                  return state;
              }
            });
          }),
          
          // Subscribe to users changes
          subscribeToChanges('profiles', (payload) => {
            const { eventType, new: newUser, old: oldUser } = payload;
            
            set(state => {
              switch (eventType) {
                case 'INSERT':
                  return {
                    users: [...state.users, newUser]
                  };
                case 'UPDATE':
                  return {
                    users: state.users.map(user =>
                      user.id === newUser.id ? { ...user, ...newUser } : user
                    )
                  };
                case 'DELETE':
                  return {
                    users: state.users.filter(user => user.id !== oldUser.id)
                  };
                default:
                  return state;
              }
            });
          }),
        ];
        
        set({ subscriptions });
      },
      
      cleanup: () => {
        const { subscriptions } = get();
        subscriptions.forEach(unsubscribe => unsubscribe());
        set({ subscriptions: [] });
      },
      
      fetchSystemSettings: async () => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await supabase
            .from('system_settings')
            .select('*')
            .single();
            
          if (error) throw error;
          
          if (data) {
            set({
              systemSettings: {
                systemName: data.system_name,
                defaultCurrency: data.default_currency,
                defaultLanguage: data.default_language,
                smtpServer: data.smtp_server || '',
                smtpPort: data.smtp_port || 587,
                senderEmail: data.sender_email || '',
                emailNotifications: data.email_notifications,
                systemAlerts: data.system_alerts,
                applicationUpdates: data.application_updates,
              },
              loading: false
            });
          }
        } catch (error: any) {
          console.error('Error fetching system settings:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      updateSystemSettings: async (settings) => {
        try {
          set({ loading: true, error: null });
          
          // Check if user has admin role
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');
          
          // Get user role from profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
            
          if (profileError) throw profileError;
          if (!profile) throw new Error('Profile not found');
          
          // Check if user is admin or superadmin
          if (!['admin', 'superadmin'].includes(profile.role)) {
            throw new Error('Insufficient permissions');
          }
          
          // Convert camelCase to snake_case for database
          const dbSettings = {
            system_name: settings.systemName,
            default_currency: settings.defaultCurrency,
            default_language: settings.defaultLanguage,
            smtp_server: settings.smtpServer,
            smtp_port: settings.smtpPort,
            sender_email: settings.senderEmail,
            email_notifications: settings.emailNotifications,
            system_alerts: settings.systemAlerts,
            application_updates: settings.applicationUpdates,
          };
          
          // Remove undefined values
          Object.keys(dbSettings).forEach(key => {
            if (dbSettings[key as keyof typeof dbSettings] === undefined) {
              delete dbSettings[key as keyof typeof dbSettings];
            }
          });
          
          const { data, error } = await supabase
            .from('system_settings')
            .upsert([dbSettings])
            .select()
            .single();
            
          if (error) throw error;
          
          set(state => ({
            systemSettings: {
              ...state.systemSettings,
              ...settings
            },
            loading: false
          }));
        } catch (error: any) {
          console.error('Error updating system settings:', error);
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      fetchSecuritySettings: async () => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await supabase
            .from('security_settings')
            .select('*')
            .single();
            
          if (error) throw error;
          
          if (data) {
            set({
              securitySettings: {
                twoFactorAuth: data.two_factor_auth,
                passwordComplexity: data.password_complexity,
                sessionTimeout: data.session_timeout,
                ipWhitelisting: data.ip_whitelisting,
                accountLockout: data.account_lockout,
                logRetention: data.log_retention,
              },
              loading: false
            });
          }
        } catch (error: any) {
          console.error('Error fetching security settings:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      updateSecuritySettings: async (settings) => {
        try {
          set({ loading: true, error: null });
          
          // Check if user has admin role
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');
          
          // Get user role from profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
            
          if (profileError) throw profileError;
          if (!profile) throw new Error('Profile not found');
          
          // Check if user is admin or superadmin
          if (!['admin', 'superadmin'].includes(profile.role)) {
            throw new Error('Insufficient permissions');
          }
          
          // Convert camelCase to snake_case for database
          const dbSettings = {
            two_factor_auth: settings.twoFactorAuth,
            password_complexity: settings.passwordComplexity,
            session_timeout: settings.sessionTimeout,
            ip_whitelisting: settings.ipWhitelisting,
            account_lockout: settings.accountLockout,
            log_retention: settings.logRetention,
          };
          
          // Remove undefined values
          Object.keys(dbSettings).forEach(key => {
            if (dbSettings[key as keyof typeof dbSettings] === undefined) {
              delete dbSettings[key as keyof typeof dbSettings];
            }
          });
          
          const { data, error } = await supabase
            .from('security_settings')
            .upsert([dbSettings])
            .select()
            .single();
            
          if (error) throw error;
          
          set(state => ({
            securitySettings: {
              ...state.securitySettings,
              ...settings
            },
            loading: false
          }));
        } catch (error: any) {
          console.error('Error updating security settings:', error);
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      fetchDatabaseSettings: async () => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await supabase
            .from('database_settings')
            .select('*')
            .single();
            
          if (error) throw error;
          
          if (data) {
            set({
              databaseSettings: {
                backupFrequency: data.backup_frequency,
                backupRetentionPeriod: data.backup_retention_period,
              },
              loading: false
            });
          }
        } catch (error: any) {
          console.error('Error fetching database settings:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      updateDatabaseSettings: async (settings) => {
        try {
          set({ loading: true, error: null });
          
          // Check if user has admin role
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');
          
          // Get user role from profiles table
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
            
          if (profileError) throw profileError;
          if (!profile) throw new Error('Profile not found');
          
          // Check if user is admin or superadmin
          if (!['admin', 'superadmin'].includes(profile.role)) {
            throw new Error('Insufficient permissions');
          }
          
          // Convert camelCase to snake_case for database
          const dbSettings = {
            backup_frequency: settings.backupFrequency,
            backup_retention_period: settings.backupRetentionPeriod,
          };
          
          // Remove undefined values
          Object.keys(dbSettings).forEach(key => {
            if (dbSettings[key as keyof typeof dbSettings] === undefined) {
              delete dbSettings[key as keyof typeof dbSettings];
            }
          });
          
          const { data, error } = await supabase
            .from('database_settings')
            .upsert([dbSettings])
            .select()
            .single();
            
          if (error) throw error;
          
          set(state => ({
            databaseSettings: {
              ...state.databaseSettings,
              ...settings
            },
            loading: false
          }));
        } catch (error: any) {
          console.error('Error updating database settings:', error);
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      backupDatabase: async () => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await supabase.rpc('backup_database');
          
          if (error) throw error;
          
          set({ loading: false });
          return data;
        } catch (error: any) {
          console.error('Error backing up database:', error);
          set({ error: error.message, loading: false });
          throw error;
        }
      },
      
      fetchProperties: async () => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await supabase
            .from('properties')
            .select('*')
            .order('name');
            
          if (error) throw error;
          
          set({ properties: data || [], loading: false });
        } catch (error: any) {
          console.error('Error fetching properties:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      addProperty: async (property) => {
        try {
          set({ loading: true, error: null }); 
          const { data, error } = await supabase
            .from('properties')
            .insert([property])
            .select()
            .single();
            
          if (error) throw error;
          
          set(state => ({
            properties: [...state.properties, data],
            loading: false
          }));
          
          toast.success('Property added successfully');
        } catch (error: any) {
          console.error('Error adding property:', error);
          set({ error: error.message, loading: false });
          toast.error('Failed to add property');
        }
      },
      
      updateProperty: async (id, data) => {
        try {
          set({ loading: true, error: null }); 
          const { data: updatedProperty, error } = await supabase
            .from('properties')
            .update(data)
            .eq('id', id)
            .select()
            .single();
            
          if (error) throw error;
          
          set(state => ({
            properties: state.properties.map(prop => 
              prop.id === id ? { ...prop, ...updatedProperty } : prop
            ),
            loading: false
          }));
          
          toast.success('Property updated successfully');
        } catch (error: any) {
          console.error('Error updating property:', error);
          set({ error: error.message, loading: false });
          toast.error('Failed to update property');
        }
      },
      
      deleteProperty: async (id) => {
        try {
          set({ loading: true, error: null }); 
          const { error } = await supabase
            .from('properties')
            .delete()
            .eq('id', id);
            
          if (error) throw error;
          
          set(state => ({
            properties: state.properties.filter(prop => prop.id !== id),
            loading: false
          }));
          
          toast.success('Property deleted successfully');
        } catch (error: any) {
          console.error('Error deleting property:', error);
          set({ error: error.message, loading: false });
          toast.error('Failed to delete property');
        }
      },
      
      fetchUsers: async () => {
        try {
          set({ loading: true, error: null });
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .order('created_at', { ascending: false });
            
          if (error) throw error;
          
          set({ users: data || [], loading: false });
        } catch (error: any) {
          console.error('Error fetching users:', error);
          set({ error: error.message, loading: false });
        }
      },
      
      updateUser: async (id, data) => {
        try {
          set({ loading: true, error: null });
          const { data: updatedUser, error } = await supabase
            .from('profiles')
            .update(data)
            .eq('id', id)
            .select()
            .single();
            
          if (error) throw error;
          
          set(state => ({
            users: state.users.map(user => 
              user.id === id ? { ...user, ...updatedUser } : user
            ),
            loading: false
          }));
          
          toast.success('User updated successfully');
        } catch (error: any) {
          console.error('Error updating user:', error);
          set({ error: error.message, loading: false });
          toast.error('Failed to update user');
        }
      },
    }),
    {
      name: 'admin-store',
      partialize: (state) => ({
        systemSettings: state.systemSettings,
        securitySettings: state.securitySettings,
        databaseSettings: state.databaseSettings
      })
    }
  )
);