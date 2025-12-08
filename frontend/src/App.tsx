import { useState } from 'react';
import { BookOpen } from 'lucide-react';
import { AuthPage } from './components/AuthPage';
import { Dashboard } from './components/Dashboard';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name: string; email: string } | null>(null);

  const handleLogin = (email: string, password: string) => {
    // Mock login
    setCurrentUser({ name: 'Book Lover', email });
    setIsAuthenticated(true);
  };

  const handleSignup = (name: string, email: string, password: string) => {
    // Mock signup
    setCurrentUser({ name, email });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <AuthPage onLogin={handleLogin} onSignup={handleSignup} />;
  }

  return (
    <Dashboard 
      user={currentUser!} 
      onLogout={handleLogout}
    />
  );
}
