import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import pb from './api/pocketbase';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import JobDetails from './pages/JobDetails';

export default function App() {
  const [user, setUser] = useState(pb.authStore.model);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check auth state on initial load
    const checkAuth = async () => {
      try {
        // Refresh auth if token exists
        if (pb.authStore.isValid) {
          await pb.collection('users').authRefresh();
          setUser(pb.authStore.model);
        }
      } catch (err) {
        pb.authStore.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Listen to auth changes
    const unsubscribe = pb.authStore.onChange(() => {
      setUser(pb.authStore.model);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <div className="app-loading">Loading...</div>;
  }

  return (
    <Router>
  <Routes>
    <Route
      path="/"
      element={user ? <Navigate to="/dashboard" replace /> : <Login />}
    />
    <Route
      path="/dashboard"
      element={user ? <Dashboard /> : <Navigate to="/" replace />}
    />
    <Route 
      path="/jobs/:id" 
      element={user ? <JobDetails /> : <Navigate to="/" replace />} 
    />
  </Routes>
</Router>
  );
}