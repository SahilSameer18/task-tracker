import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { TasksProvider } from './context/TasksContext';
import AuthPages from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import Toast from './components/Toast';

import './App.css';

// Inner App with context access
function AppContent() {
  const { user, loading } = useAuth();
  const [toast, setToast] = useState(null);

  const triggerToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  const handleCloseToast = () => {
    setToast(null);
  };

  if (loading) {
    return (
      <div className="global-loader">
        <div className="spinner-large"></div>
        <p>Loading Task Tracker...</p>
      </div>
    );
  }

  return (
    <>
      {user ? (
        <TasksProvider>
          <Dashboard triggerToast={triggerToast} />
        </TasksProvider>
      ) : (
        <AuthPages triggerToast={triggerToast} />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={handleCloseToast}
        />
      )}
    </>
  );
}

// Global entry point wrapping content inside providers
function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
