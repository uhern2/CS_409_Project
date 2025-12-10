import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';
import { UserProfile } from './components/UserProfile';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);
  const [authToken, setAuthToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('authToken');
  });
  const [authChecked, setAuthChecked] = useState(false);

  // Hydrate user on app load if token exists
  useEffect(() => {
    async function loadUser() {
      if (!authToken) {
        setAuthChecked(true);
        return;
      }
      try {
        const res = await fetch('http://localhost:4000/auth/me', {
          headers: { Authorization: `Bearer ${authToken}` },
        });
        if (!res.ok) {
          throw new Error(`Auth check failed (${res.status})`);
        }
        const data = await res.json();
        setCurrentUser({ name: data.displayName, email: data.email });
        setIsAuthenticated(true);
      } catch (err) {
        console.error('Auth hydrate error:', err);
        setAuthToken(null);
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    }
    loadUser();
  }, [authToken]);

  const handleLogin = async (email: string, password: string) => {
    try {
      const res = await fetch('http://localhost:4000/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error(`Login failed (${res.status})`);
      }

      const data = await res.json();
      setAuthToken(data.token);
      localStorage.setItem('authToken', data.token);
      setCurrentUser({ name: data.user.displayName, email: data.user.email });
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Login error:', err);
      alert('Login failed. Please check your credentials.');
    }
  };

  const handleSignup = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('http://localhost:4000/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ displayName: name, email, password }),
      });

      if (!res.ok) {
        throw new Error(`Signup failed (${res.status})`);
      }

      const data = await res.json();
      setAuthToken(data.token);
      localStorage.setItem('authToken', data.token);
      setCurrentUser({ name: data.user.displayName, email: data.user.email });
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Signup error:', err);
      alert('Signup failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setAuthToken(null);
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            !isAuthenticated ? (
              <AuthPage onLogin={handleLogin} onSignup={handleSignup} />
            ) : (
              <Navigate to="/dashboard" replace />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard user={currentUser!} authToken={authToken!} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <UserProfile user={currentUser!} authToken={authToken!} onLogout={handleLogout} />
            ) : (
              <Navigate to="/" replace />
            )
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
