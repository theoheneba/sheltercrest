import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LoadingSpinner from './components/ui/LoadingSpinner';
import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/auth/ProtectedRoute';
import RoleRoute from './components/auth/RoleRoute';
import HomePage from './pages/HomePage';
import { useAuth } from './contexts/AuthContext';
import AdminRoute from './components/auth/AdminRoute';
import CompanyRoute from './components/auth/CompanyRoute';
import CompanyManagerRoute from './components/auth/CompanyManagerRoute';

// Lazy-loaded components
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('./pages/auth/RegisterPage'));
const EligibilityChecker = lazy(() => import('./pages/eligibility/EligibilityChecker'));
const ApplicationForm = lazy(() => import('./pages/application/ApplicationForm'));
const UserDashboard = lazy(() => import('./pages/dashboard/UserDashboard'));
const PaymentHistory = lazy(() => import('./pages/dashboard/PaymentHistory'));
const Documents = lazy(() => import('./pages/dashboard/Documents'));
const Profile = lazy(() => import('./pages/dashboard/Profile'));
const HelpCenter = lazy(() => import('./pages/dashboard/HelpCenter'));

// Role-based dashboards
const SalesExecutiveDashboard = lazy(() => import('./pages/dashboard/SalesExecutiveDashboard'));
const CreditAnalystDashboard = lazy(() => import('./pages/dashboard/CreditAnalystDashboard'));
const CompanyManagerDashboard = lazy(() => import('./pages/dashboard/CompanyManagerDashboard'));
const RecoveryAndCollectionsDashboard = lazy(() => import('./pages/dashboard/RecoveryAndCollectionsDashboard'));
const InspectionAndVerificationDashboard = lazy(() => import('./pages/dashboard/InspectionAndVerificationDashboard'));
const FinanceDashboard = lazy(() => import('./pages/dashboard/FinanceDashboard'));

const Notifications = lazy(() => import('./pages/dashboard/Notifications'));
const CreateTicket = lazy(() => import('./pages/dashboard/CreateTicket'));
const ViewTickets = lazy(() => import('./pages/dashboard/ViewTickets'));

// Shop Pages
const ProductCatalog = lazy(() => import('./pages/shop/ProductCatalog'));
const Checkout = lazy(() => import('./pages/shop/Checkout'));

// Static Pages
const AboutUs = lazy(() => import('./pages/AboutUs'));
const ContactUs = lazy(() => import('./pages/ContactUs'));
const PrivacyPolicy = lazy(() => import('./pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('./pages/TermsAndConditions'));

// Admin Pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const ApplicationProcessing = lazy(() => import('./pages/admin/ApplicationProcessing'));
const PaymentManagement = lazy(() => import('./pages/admin/PaymentManagement'));
const DocumentManagement = lazy(() => import('./pages/admin/DocumentManagement'));
const SystemConfiguration = lazy(() => import('./pages/admin/SystemConfiguration'));
const SupportManagement = lazy(() => import('./pages/admin/SupportManagement'));
const ReportingAnalytics = lazy(() => import('./pages/admin/ReportingAnalytics'));
const SecuritySettings = lazy(() => import('./pages/admin/SecuritySettings'));
const NotificationCenter = lazy(() => import('./pages/admin/NotificationCenter'));
const SystemSettings = lazy(() => import('./pages/admin/SystemSettings'));
const HelpSupport = lazy(() => import('./pages/admin/HelpSupport'));
const PropertyManagement = lazy(() => import('./pages/admin/PropertyManagement'));
const CompanyManagement = lazy(() => import('./pages/admin/CompanyManagement'));

// Company Pages
const CompanyDashboard = lazy(() => import('./pages/company/CompanyDashboard'));
const EmployeeManagement = lazy(() => import('./pages/company/EmployeeManagement'));
const BillingHistory = lazy(() => import('./pages/company/BillingHistory'));
const MakePayment = lazy(() => import('./pages/company/MakePayment'));

function App() {
  const { isInitialized } = useAuth();

  if (!isInitialized) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Suspense fallback={<LoadingSpinner fullScreen />}>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Public routes */}
            <Route index element={<HomePage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
            <Route path="eligibility" element={<EligibilityChecker />} />
            <Route path="about" element={<AboutUs />} />
            <Route path="contact" element={<ContactUs />} />
            <Route path="privacy" element={<PrivacyPolicy />} />
            <Route path="terms" element={<TermsAndConditions />} />
            
            {/* Protected user routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="application" element={<ApplicationForm />} />
              <Route path="dashboard" element={<UserDashboard />} />
              <Route path="payments" element={<PaymentHistory />} />
              <Route path="documents" element={<Documents />} />
              <Route path="profile" element={<Profile />} />
              <Route path="help" element={<HelpCenter />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="tickets/create" element={<CreateTicket />} />
              <Route path="tickets" element={<ViewTickets />} />
              <Route path="shop" element={<ProductCatalog />} />
              
              {/* Role-specific dashboards */}
              <Route path="dashboard/sales-executive" element={
                <RoleRoute allowedRoles={['sales_executive']}>
                  <SalesExecutiveDashboard />
                </RoleRoute>
              } />
              <Route path="dashboard/credit-analyst" element={
                <RoleRoute allowedRoles={['credit_analyst']}>
                  <CreditAnalystDashboard />
                </RoleRoute>
              } />
              <Route path="dashboard/company-manager" element={
                <RoleRoute allowedRoles={['company_manager']}>
                  <CompanyManagerDashboard />
                </RoleRoute>
              } />
              <Route path="dashboard/recovery-and-collections" element={
                <RoleRoute allowedRoles={['recovery_and_collections']}>
                  <RecoveryAndCollectionsDashboard />
                </RoleRoute>
              } />
              <Route path="dashboard/inspection-and-verification" element={
                <RoleRoute allowedRoles={['inspection_and_verification']}>
                  <InspectionAndVerificationDashboard />
                </RoleRoute>
              } />
              <Route path="dashboard/finance" element={
                <RoleRoute allowedRoles={['finance']}>
                  <FinanceDashboard />
                </RoleRoute>
              } />
              
              <Route path="checkout" element={<Checkout />} />
            </Route>
          </Route>
            
          {/* Admin routes with separate layout */}
          <Route element={<AdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="admin" element={<AdminDashboard />} />
              <Route path="admin/users" element={<UserManagement />} />
              <Route path="admin/applications" element={<ApplicationProcessing />} />
              <Route path="admin/payments" element={<PaymentManagement />} />
              <Route path="admin/documents" element={<DocumentManagement />} />
              <Route path="admin/configuration" element={<SystemConfiguration />} />
              <Route path="admin/support" element={<SupportManagement />} />
              <Route path="admin/analytics" element={<ReportingAnalytics />} />
              <Route path="admin/properties" element={<PropertyManagement />} />
              <Route path="admin/security" element={<SecuritySettings />} />
              <Route path="admin/notifications" element={<NotificationCenter />} />
              <Route path="admin/settings" element={<SystemSettings />} />
              <Route path="admin/help" element={<HelpSupport />} />
              <Route path="admin/companies" element={<CompanyManagement />} />
            </Route>
          </Route>
          
          {/* Company routes with separate layout */}
          <Route element={<CompanyRoute />}> 
            <Route element={<Layout />}>
              <Route path="company" element={<CompanyDashboard />} />
              <Route path="company/employees" element={<EmployeeManagement />} />
              <Route path="company/billing" element={<BillingHistory />} />
              <Route path="company/payment" element={<MakePayment />} />
            </Route>
          </Route>
          
          {/* Company Manager routes */}
          <Route element={<CompanyManagerRoute />}>
            <Route element={<Layout />}>
              <Route path="company-manager" element={<CompanyManagerDashboard />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#059669',
              color: '#fff',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#DC2626',
              color: '#fff',
            },
          },
        }}
      />
    </>
  );
}

export default App;