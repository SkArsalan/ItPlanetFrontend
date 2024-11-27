// src/components/Content.js
import React from 'react';
import './Content.css';
import { Outlet } from 'react-router';
function Content({ isSidebarOpen }) {
  return (
    <div id="content" className={isSidebarOpen ? 'content-with-sidebar' : 'content-full-width'}>
     
     <Outlet/>
     
    </div>
  );
}

export default Content;
