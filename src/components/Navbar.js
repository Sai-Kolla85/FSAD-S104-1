import React from 'react';
import { useAuth } from '../context/AuthContext';

const Navbar = ({ title }) => {
  const { currentUser, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <h2>🏥 {title}</h2>
      </div>
      <div className="navbar-user">
        <span>Welcome, {currentUser?.name}</span>
        <button onClick={handleLogout} className="btn btn-outline">
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
