import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Marketplace from './pages/Marketplace';
import LivestockMarket from './pages/LivestockMarket';
import AIAnalysis from './pages/AIAnalysis';
import Recommendations from './pages/Recommendations';
import Weather from './pages/Weather';
import GlobalMarket from './pages/GlobalMarket';
import Navbar from './components/Navbar';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, isAuthReady } = useAuth();
  if (!isAuthReady || loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return <>{children}</>;
};

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-stone-50 font-sans text-stone-900">
          <Navbar />
          <main className="container mx-auto px-4 py-8 pb-24 md:pb-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/marketplace" element={<ProtectedRoute><Marketplace /></ProtectedRoute>} />
              <Route path="/livestock" element={<ProtectedRoute><LivestockMarket /></ProtectedRoute>} />
              <Route path="/buy" element={<ProtectedRoute><GlobalMarket /></ProtectedRoute>} />
              <Route path="/ai-analysis" element={<ProtectedRoute><AIAnalysis /></ProtectedRoute>} />
              <Route path="/recommendations" element={<ProtectedRoute><Recommendations /></ProtectedRoute>} />
              <Route path="/weather" element={<ProtectedRoute><Weather /></ProtectedRoute>} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
