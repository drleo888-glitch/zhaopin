import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import { HRDashboard } from './dashboards/HRDashboard';
import { CandidateDashboard } from './dashboards/CandidateDashboard';
import { HospitalDashboard } from './dashboards/HospitalDashboard';
import { MedicalDashboard } from './dashboards/MedicalDashboard';
import { LoginScreen } from './components/LoginScreen';
import { LogOut } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { currentRole } = useAppContext();

  return (
    <div className="mt-8">
      {currentRole === 'HR' && <HRDashboard />}
      {currentRole === 'CANDIDATE' && <CandidateDashboard />}
      {currentRole === 'HOSPITAL' && <HospitalDashboard />}
      {currentRole === 'MEDICAL' && <MedicalDashboard />}
    </div>
  );
};

const MainApp: React.FC = () => {
  const { isAuthenticated, logout, currentRole } = useAppContext();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isAuthenticated) {
    if (location.pathname === '/hr') return <LoginScreen initialRole="HR" />;
    if (location.pathname === '/hospital') return <LoginScreen initialRole="HOSPITAL" />;
    if (location.pathname === '/medical') return <LoginScreen initialRole="MEDICAL" />;
    if (location.pathname === '/candidate') return <LoginScreen initialRole="CANDIDATE" />;
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center mr-3">
              <span className="text-white font-bold text-lg">H</span>
            </div>
            <h1 className="text-xl font-semibold text-gray-900">Health Check Portal / 体检门户</h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
              Vai trò / 角色: {currentRole}
            </span>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex items-center text-sm text-gray-600 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-4 h-4 mr-1" /> Đăng xuất / 登出
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/hr" element={currentRole === 'HR' ? <HRDashboard /> : <Navigate to="/" replace />} />
          <Route path="/candidate" element={currentRole === 'CANDIDATE' ? <CandidateDashboard /> : <Navigate to="/" replace />} />
          <Route path="/hospital" element={currentRole === 'HOSPITAL' ? <HospitalDashboard /> : <Navigate to="/" replace />} />
          <Route path="/medical" element={currentRole === 'MEDICAL' ? <MedicalDashboard /> : <Navigate to="/" replace />} />
          <Route path="/" element={<DashboardContent />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <MainApp />
      </AppProvider>
    </BrowserRouter>
  );
}
