import { useState, useEffect } from 'react';
import LoginPage from './loginPage.jsx';
import DashboardPage from './DashboardPage';
import { Toaster } from "sonner";

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [dbStatus, setDbStatus] = useState('Checking DB...');
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
  const savedPage = localStorage.getItem('currentPage');
  const savedUser = localStorage.getItem('user');

  if (savedPage === 'dashboard' && savedUser) {
    setCurrentPage('dashboard');
    setUser(JSON.parse(savedUser));
  }

  setIsInitializing(false); // 👈 important
}, []);


  // Restore session on refresh
  useEffect(() => {
    const savedPage = localStorage.getItem('currentPage');
    const savedUser = localStorage.getItem('user');

    if (savedPage === 'dashboard' && savedUser) {
      setCurrentPage('dashboard');
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // DB health check
  useEffect(() => {
    fetch('http://127.0.0.1:3001/api/health/db')
      .then(async res => {
        const data = await res.json();
        if (!res.ok) throw new Error();
        setDbStatus(data.status);
      })
      .catch(() => setDbStatus('❌ DB check failed'));
  }, []);

 const handleNavigation = (page, userData) => {
  setCurrentPage(page);
  setUser(userData || null);

  if (page === "dashboard" && userData) {
    localStorage.setItem("currentPage", "dashboard");
    localStorage.setItem("user", JSON.stringify(userData));
  }

  if (page === "login") {
    localStorage.removeItem("currentPage");
    localStorage.removeItem("user");
  }
};

  if (isInitializing) {
  return <div style={{ padding: '40px' }}>  </div>;
}
  return (
    <>
      <Toaster position="top-right" richColors />

      {/* <div style={{ padding: '10px', fontWeight: 'bold' }}>
        Neon DB Status: {dbStatus}
      </div> */}

      {currentPage === 'login' && (
        <LoginPage onNavigate={handleNavigation} />
      )}

      {currentPage === 'dashboard' && user && (
        <DashboardPage user={user} onNavigate={handleNavigation} />
      )}
    </>
  );
}
