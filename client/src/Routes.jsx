import React, { useContext, useState, useEffect } from "react";
import { BrowserRouter, Routes as RouterRoutes, Route, Navigate } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import Sidebar, { SidebarProvider, SidebarContext } from "components/ui/Sidebar";
import Header from "components/ui/Header";
import { AuthContext } from "contexts/AuthContext";
import AuthProvider from "contexts/AuthContext";

// Page imports
import Home from "landingpages/Home";
import Login from "landingpages/Login";
import Signup from "landingpages/Signup";
import Contact from "landingpages/Contact";
import Dashboard from "pages/dashboard";
import PaymentsManagement from "pages/payments-management";
import PaymentDetailsModal from "pages/payment-details-modal";
import AccountSettings from "pages/account-settings";
import TransactionExport from "pages/transaction-export";
import PortfolioManagement from "pages/portfolio-management";
import NotFound from "pages/NotFound";

// Error display component
const AuthErrorDisplay = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="max-w-md mx-auto text-center p-8 bg-white rounded-lg shadow-lg">
      <div className="mb-4">
        <svg className="mx-auto h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Error</h2>
      <p className="text-gray-600 mb-4">{error}</p>
      <button 
        onClick={() => window.location.href = '/login'}
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        Go to Login
      </button>
    </div>
  </div>
);

// Enhanced Dashboard Data Provider that fetches complete user data from localhost:9000
const DashboardDataProvider = ({ children, userData: authUserData }) => {
  const [completeUserData, setCompleteUserData] = useState(null);
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [userDataError, setUserDataError] = useState(null);

  // Function to fetch user data from localhost:8000 (not 9000)
  const fetchCompleteUserData = async (userId) => {
    try {
      setIsLoadingUserData(true);
      console.log(`🚀 REQUEST SENT: Fetching complete user data from localhost:8000/api/userdata for ID: ${userId}`);
      
      const response = await fetch(`http://localhost:8000/api/userdata?id=${userId}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      console.log(`✅ RESPONSE RECEIVED: localhost:8000/api/userdata - Status: ${response.status}`);

      // Check if response is HTML (error page) instead of JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.error('❌ ERROR: Server returned HTML instead of JSON');
        throw new Error('Server returned invalid response format');
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log('Complete user data received from localhost:8000:', data.userData);
        setCompleteUserData(data.userData);
        setUserDataError(null);
        return data.userData;
      } else {
        throw new Error(data.message || 'Failed to fetch user data');
      }
    } catch (error) {
      console.error('❌ ERROR: Fetching complete user data:', error);
      setUserDataError(error.message);
      // Fallback to auth data if API fails
      console.log('Using fallback auth data:', authUserData);
      setCompleteUserData(authUserData);
      return authUserData;
    } finally {
      setIsLoadingUserData(false);
    }
  };

  useEffect(() => {
    if (authUserData?.id) {
      fetchCompleteUserData(authUserData.id);
    } else {
      setIsLoadingUserData(false);
      setCompleteUserData(authUserData);
    }
  }, [authUserData?.id]);

  // Show loading if still fetching user data
  if (isLoadingUserData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-lg">Loading complete user profile...</div>
          {userDataError && (
            <div className="text-sm text-orange-600 max-w-md text-center">
              {userDataError}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Clone children and pass complete user data
  return React.cloneElement(children, { 
    userData: completeUserData,
    userDataError: userDataError
  });
};

// Protected Route Component - now with enhanced data
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, authError, userData } = useContext(AuthContext);

  // Show loading while checking authentication
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-lg">Verifying authentication...</div>
        </div>
      </div>
    );
  }

  // Show error message if not authenticated
  if (isAuthenticated === false) {
    return <AuthErrorDisplay error={authError} />;
  }

  // Render protected content if authenticated - wrap with data provider
  return (
    <DashboardDataProvider userData={userData}>
      {children}
    </DashboardDataProvider>
  );
};

// Login wrapper - simplified since we're not auto-redirecting
const LoginWrapper = () => {
  const { isAuthenticated, isLoading } = useContext(AuthContext);

  // Show loading while checking
  if (isLoading || isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-lg">Loading...</div>
        </div>
      </div>
    );
  }

  // If authenticated, redirect to dashboard
  if (isAuthenticated === true) {
    return <Navigate to="/dashboard" replace />;
  }

  // Show login form if not authenticated
  return <Login />;
};

//data handling from Landing page to Dashboard - simplified and cleaned up
const DashboardWithData = ({ userData, userDataError }) => {
  return <Dashboard userData={userData} userDataError={userDataError} />;
};

// Enhanced components that receive userData
const EnhancedPaymentsManagement = ({ userData, userDataError }) => (
  <PaymentsManagement userData={userData} userDataError={userDataError} />
);

const EnhancedAccountSettings = ({ userData, userDataError }) => (
  <AccountSettings userData={userData} userDataError={userDataError} />
);

const EnhancedTransactionExport = ({ userData, userDataError }) => (
  <TransactionExport userData={userData} userDataError={userDataError} />
);

const EnhancedPortfolioManagement = ({ userData, userDataError }) => (
  <PortfolioManagement userData={userData} userDataError={userDataError} />
);

const EnhancedPaymentDetailsModal = ({ userData, userDataError }) => (
  <PaymentDetailsModal userData={userData} userDataError={userDataError} />
);

// Dashboard layout with user data context
const DashboardLayout = ({ children, userData, userDataError }) => (
  <SidebarProvider>
    <ErrorBoundary>
      <ScrollToTop />
      <div className="min-h-screen bg-background flex flex-col">
        <Sidebar userData={userData} />
        <Header userData={userData} />
        <MainContent>
          {React.cloneElement(children, { userData, userDataError })}
        </MainContent>
      </div>
    </ErrorBoundary>
  </SidebarProvider>
);

// Landing layout for Home (no sidebar/header)
const LandingLayout = ({ children }) => (
  <div className="min-h-screen bg-background flex flex-col">
    {children}
  </div>
);

// Dashboard layout (sidebar/header)
const MainContent = ({ children }) => {
  const { isCollapsed } = useContext(SidebarContext);
  return (
    <main
      className={`
        transition-layout
        pt-16 pb-6
        ${isCollapsed ? 'lg:ml-16' : 'lg:ml-60'}
        px-1 sm:px-2 md:px-4
        min-h-[calc(100vh-4rem)]
        overflow-x-hidden
        max-w-full
      `}
      style={{
        maxWidth: "100vw",
        transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)"
      }}
    >
      {children}
    </main>
  );
};

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <RouterRoutes>
          {/* Landing page routes */}
          <Route path="/" element={<LandingLayout><Home /></LandingLayout>} />
          <Route path="/login" element={<LandingLayout><LoginWrapper /></LandingLayout>} />
          <Route path="/signup" element={<LandingLayout><Signup /></LandingLayout>} />
          <Route path="/contact" element={<LandingLayout><Contact /></LandingLayout>} />
          
          {/* Protected Dashboard and all admin pages */}
          <Route path="/dashboard/*" element={
            <ProtectedRoute>
              <DashboardLayout>
                <RouterRoutes>
                  <Route index element={<DashboardWithData />} />
                  <Route path="payments-management" element={<EnhancedPaymentsManagement />} />
                  <Route path="payment-details-modal" element={<EnhancedPaymentDetailsModal />} />
                  <Route path="account-settings" element={<EnhancedAccountSettings />} />
                  <Route path="transaction-export" element={<EnhancedTransactionExport />} />
                  <Route path="portfolio-management" element={<EnhancedPortfolioManagement />} />
                  <Route path="*" element={<NotFound />} />
                </RouterRoutes>
              </DashboardLayout>
            </ProtectedRoute>
          } />
        </RouterRoutes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;