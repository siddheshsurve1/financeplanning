import { useState } from 'react';
import LoginPage from './loginPage.jsx';
// import DashboardPage from './DashboardPage';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');
  const [user, setUser] = useState(null);

  const handleNavigation = (page, userData) => {
    setCurrentPage(page);
    if (userData) {
      setUser(userData);
    } else {
      setUser(null);
    }
  };

  return (
    <>
      {currentPage === 'login' && (
        <LoginPage onNavigate={handleNavigation} />
      )}
  
    </>
  );
}