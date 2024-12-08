// src/components/Sidebar.js
import './Sidenew.css';
import './SidebarContainer/SidebarHeader'
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import SidebarHeader from './SidebarContainer/SidebarHeader';
import SidebarMenu from './SidebarContainer/SidebarMenu';
import { useSection } from '../hooks/context/SectionProvider';

function Sidebar({ isOpen }) {

  const {selectedSection} = useSection()

  const renderMenuBasedOnSection = () => {
    switch (selectedSection) {
      case 'Laptop Section':
        return (
          <ul className="list-unstyled components">
        <p>Laptop Categories</p>

        <SidebarMenu
       title="Laptop"
       submenu={[
        { path: '/sales-list', label: 'Laptop Sale' },
        { path: '/purchase-list', label: 'Laptop Purchase' },
        { path: '/quotation-list', label: 'Laptop Quotation' },
       ]}
       />
       <SidebarMenu path="/product-list" label="Stock"/>
       </ul>
        );
      case 'Accessories Section':
        return (
          <ul className="list-unstyled components">
        <p>Accessories Categories</p>
          <SidebarMenu
       title="Accessories"
       submenu={[
        { path: '/sales-list', label: 'Accessories Sale' },
        { path: '/purchase-list', label: 'Accessories Purchase' },
        { path: '/quotation-list', label: 'Accessories Quotation' },
       ]}
       />
       <SidebarMenu
       title="CCTV"
       submenu={[
        { path: '/sales-list', label: 'CCTV Sale' },
        { path: '/purchase-list', label: 'CCTV Purchase' },
        { path: '/quotation-list', label: 'CCTV Quotation' },
       ]}
       />
       
       
       </ul>
        );
        case 'GST Section':
        return (
          <ul className="list-unstyled components">
            <p>GST Categories</p>
            <SidebarMenu path="/product-list" label="Stock"/>
          </ul>
        );
        default:
          return (
            <p>
              Please select a section from navbar
            </p>
          )
    }
  }

  return (
    <div id="sidebar" className={isOpen ? 'active' : ''}>
      <SidebarHeader title="Inventory Management" />
      {renderMenuBasedOnSection()}
    </div>
  );
}

export default Sidebar;
