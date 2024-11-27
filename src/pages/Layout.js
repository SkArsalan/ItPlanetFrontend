import { useState } from "react";
import "./Layout.css"
import Sidebar from "../layout/Sidebar";
import Navbar from "../layout/Navbar";
import Content from "../layout/Content";
import { SectionProvider } from "../hooks/context/SectionProvider";

function Layout() {
    const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
    return (
       <SectionProvider>
         <div className="app">
      {/* Navbar Wrapper to ensure it doesn't overlap the content */}
      <div className="navbar-wrapper">
        <Navbar toggleSidebar={toggleSidebar} />
      </div>
      {/* Main container holds Sidebar and Content */}
      <div className={`main-container ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <Sidebar isOpen={sidebarOpen} />
        <Content isSidebarOpen={sidebarOpen} />
      </div>
    </div>
       </SectionProvider>
    )
}

export default Layout
