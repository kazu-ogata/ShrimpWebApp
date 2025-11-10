import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import HeroSection from './components/HeroSection';
import FeaturesSection from './components/FeaturesSection';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import Dashboard from './pages/Dashboard';
import ResultsPage from './pages/ResultsPage';
import DashboardResults from './pages/DashboardResults';
import DashboardHistory from './pages/DashboardHistory';
import DashboardSettings from './pages/DashboardSettings';
import './App.css';
import Dashboard_upload from './pages/Dashboard copy';

function App() {
  // Simple authentication state management
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in (simple localStorage check)
    const savedUser = localStorage.getItem('shrimpSense_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    localStorage.setItem('shrimpSense_user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('shrimpSense_user');
    // Redirect to home page after logout
    window.location.href = '/';
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <>
                <Navigation />
                <HeroSection />
                <FeaturesSection />
              </>
            )
          } />

          {/* Authentication Routes */}
          <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />
          <Route path="/signup" element={<SignUpPage onLogin={handleLogin} />} />

          {/* Protected Dashboard Routes */}
          <Route path="/dashboard" element={
            isAuthenticated ? (
              <Dashboard_upload />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/results" element={
            isAuthenticated ? (
              <DashboardResults />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/results-page" element={
            isAuthenticated ? (
              <ResultsPage />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/dashboard/history" element={
            isAuthenticated ? (
              <DashboardHistory />
            ) : (
              <Navigate to="/login" replace />
            )
          } />
          <Route path="/dashboard/settings" element={
            isAuthenticated ? (
              <DashboardSettings />
            ) : (
              <Navigate to="/login" replace />
            )
          } />

          {/* Public Information Pages */}
          <Route path="/about" element={
            <>
              <Navigation />
              <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
                <div className="text-center max-w-4xl">
                  <h1 className="text-5xl font-bold text-gray-800 mb-6">About ShrimpSense</h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    ShrimpSense is an innovative aquaculture technology company dedicated to revolutionizing shrimp farming
                    through intelligent monitoring systems. Our AI-powered solutions help farmers optimize their operations
                    and maximize productivity while maintaining sustainability.
                  </p>
                </div>
              </div>
            </>
          } />
          <Route path="/products" element={
            <>
              <Navigation />
              <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
                <div className="text-center max-w-4xl">
                  <h1 className="text-5xl font-bold text-gray-800 mb-6">Our Products</h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Discover our comprehensive suite of intelligent shrimp monitoring solutions designed to transform
                    traditional aquaculture practices. From computer vision systems to real-time data analytics,
                    our products are engineered for precision and efficiency.
                  </p>
                </div>
              </div>
            </>
          } />
          <Route path="/contact" element={
            <>
              <Navigation />
              <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-8">
                <div className="text-center max-w-4xl">
                  <h1 className="text-5xl font-bold text-gray-800 mb-6">Contact Us</h1>
                  <p className="text-xl text-gray-600 leading-relaxed">
                    Get in touch with our team for support, inquiries, or partnership opportunities.
                    We're here to help you transform your shrimp farming operations with cutting-edge technology.
                  </p>
                </div>
              </div>
            </>
          } />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
