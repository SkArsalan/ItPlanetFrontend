import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import './Navbar.css';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useSection } from '../hooks/context/SectionProvider';
import { useAuth } from '../hooks/context/AuthContext';
import API from '../api/axios';
import { useQuery } from '@tanstack/react-query';

const fetchPages = async () => {
  const response = await API.get('/get-sections');
  console.log('API Response:', response.data); // Debugging
  return response.data.pages; // Extract the `pages` array
};

function Navbar({ toggleSidebar }) {
  const { selectedSection, setSelectedSection } = useSection();
  const { data: pages = [], isLoading, error } = useQuery({
    queryKey: ['pages'],
    queryFn: fetchPages,
  });

  
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login'); // Redirect after logout
  };

  const handleClick = (page) => {
    setSelectedSection(page.categories);
    // Use page.categories directly in navigate
    navigate(`/${user.location}/${page.categories}/product-list`);
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
      <div className="navbar-title">IT Planet, {user.location}</div>
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
              {selectedSection || 'Select'} Section
            </Link>
            <ul className="dropdown-menu dropdown-menu-end">
              {isLoading && <li>Loading...</li>}
              {error && <li>Error: {error.message}</li>}
              {pages.map((page) => (
                <li
                  key={page.id}
                  style={{
                    cursor: 'pointer',
                    fontWeight: selectedSection === page.categories ? 'bold' : 'normal',
                  }}
                >
                  <button
                    className="dropdown-item"
                    onClick={() => handleClick(page)}
                  >
                    {page.categories} Section
                  </button>
                </li>
              ))}
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
              {user.username}
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
              <li>
                <Link className="dropdown-item" onClick={handleLogout}>
                  <i className="fas fa-sign-out-alt me-2"></i> Log Out
                </Link>
              </li>
            </ul>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navbar;
