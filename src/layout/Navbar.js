// src/components/Navbar.js
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';
import { Link, useNavigate } from 'react-router-dom';
import { useSection } from '../hooks/context/SectionProvider';
import { useAuth } from '../hooks/context/AuthContext';

function Navbar({ toggleSidebar }) {
  const {selectedSection, handleSelectSection} = useSection();
  const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login'); // Redirect after logout
    };

  return (
    <nav className="navbar navbar-expand-lg">
      <button 
        type="button" 
        className="btn btn-info" 
        onClick={toggleSidebar}
      >
        <FontAwesomeIcon icon={faBars} /> {/* Sidebar toggle icon */}
      </button>
      <div className="navbar-title">IT Planet</div>
       {/* Navbar Content */}
       <div className="collapse navbar-collapse d-flex" id="navbarSupportedContent">
        {/* Left Dropdown Menu */}
        <ul className="navbar-nav ms-auto">
          <li className="nav-item dropdown">
            <Link 
              className="nav-link dropdown-toggle TextColor"  
              role="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              {selectedSection} {/* Display the selected section */}
            </Link>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <Link
                to="#"
                  className="dropdown-item"  
                  onClick={() => handleSelectSection('Accessories Section')}
                >
                  Accessories Section
                </Link>
              </li>
              <li>
                <Link 
                  className="dropdown-item" 
                  to="#"
                  onClick={() => handleSelectSection('Laptop Section')}
                >
                  Laptop Section
                </Link>
              </li>
              <li>
                <Link 
                  className="dropdown-item" 
                  to="#"
                  onClick={() => handleSelectSection('GST Section')}
                >
                  GST Section
                </Link>
              </li>
            </ul>
          </li>
        </ul>

        {/* Right User Profile Menu */}
        <ul className="navbar-nav ms-auto">
          <li className="nav-item dropdown">
            <Link 
              className="nav-link dropdown-toggle TextColor" 
              to="#" 
              role="button" 
              data-bs-toggle="dropdown" 
              aria-expanded="false"
            >
              Profile
            </Link>
            <ul className="dropdown-menu dropdown-menu-end">
              <li>
                <Link className="dropdown-item" to="#">
                  <i className="fas fa-user me-2"></i> My Profile
                </Link>
              </li>
              <li>
                <Link className="dropdown-item" to="#">
                  <i className="fas fa-cogs me-2"></i> Settings
                </Link>
              </li>
              <li><hr className="dropdown-divider" /></li>
              <li><li>
    <Link className="dropdown-item" onClick={handleLogout}>
        <i className="fas fa-sign-out-alt me-2"></i> Log Out
    </Link>
</li>

              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;