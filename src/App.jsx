import { useState, useEffect } from 'react';
import LoginPage from './loginPage.jsx';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);
  const [dbStatus, setDbStatus] = useState('Checking DB...');

  
useEffect(() => {
  fetch('http://127.0.0.1:3001/api/health/db')  // Use 127.0.0.1, not localhost
    .then(async res => {
      const data = await res.json();
      console.log('Health API response:', data);
      if (!res.ok) throw new Error('Request failed');
      setDbStatus(data.status);
    })
    .catch(err => {
      console.error('Health API error:', err);
      setDbStatus('❌ DB check failed');
    });
}, []);



  const handleNavigation = (page, userData) => {
    setCurrentPage(page);
    setUser(userData || null);
  };

  return (
    <>
      <div style={{ padding: '10px', fontWeight: 'bold' }}>
        Neon DB Status: {dbStatus}
      </div>

      {currentPage === 'login' && (
        <LoginPage onNavigate={handleNavigation} />
      )}
    </>
  );
}
