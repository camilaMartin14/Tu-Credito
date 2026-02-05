import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { CreateLoan } from './pages/CreateLoan';
import { LoanDetails } from './pages/LoanDetails';
import { Loans } from './pages/Loans';
import { Borrowers } from './pages/Borrowers';
import { CreateBorrower } from './pages/CreateBorrower';
import { EditBorrower } from './pages/EditBorrower';
import { BorrowerDetails } from './pages/BorrowerDetails';
import { Payments } from './pages/Payments';
import { Calculator } from './pages/Calculator';
import { Settings } from './pages/Settings';
import { NotFound } from './pages/NotFound';
import { ToastProvider } from './context/ToastContext';

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="loans" element={<Loans />} />
        <Route path="loans/create" element={<CreateLoan />} />
        <Route path="loans/:id" element={<LoanDetails />} />
        <Route path="borrowers" element={<Borrowers />} />
        <Route path="borrowers/create" element={<CreateBorrower />} />
        <Route path="borrowers/edit/:dni" element={<EditBorrower />} />
        <Route path="borrowers/:dni" element={<BorrowerDetails />} />
        <Route path="payments" element={<Payments />} />
        <Route path="calculator" element={<Calculator />} />
        <Route path="settings" element={<Settings />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
