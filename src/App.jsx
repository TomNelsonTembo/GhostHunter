import { HashRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import pb from "./api/pocketbase";
import { useChromeStorage } from "./hooks/useChromeStorage";

const App = () => {
  const [user, setUser] = useChromeStorage('pb_auth', null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (user?.token) {
          pb.authStore.save(user.token, user.model);
          await pb.collection('users').authRefresh();
        }
      } catch (err) {
        console.error(err);
        pb.authStore.clear();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Sync auth state with chrome storage
    const unsubscribe = pb.authStore.onChange((token, model) => {
      if (token && model) {
        setUser({ token, model });
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div>Loading...</div>;

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
      </Routes>
    </Router>
  );
};

export default App;