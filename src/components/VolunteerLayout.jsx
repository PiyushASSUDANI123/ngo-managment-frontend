import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import VolunteerSidebar from './VolunteerSidebar';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';

const VolunteerLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <VolunteerSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            <HiOutlineMenuAlt2 />
          </button>
          <h1 className="page-title">Volunteer Dashboard</h1>
        </header>
        <div className="content-area" style={{ flex: 1 }}>
          <Outlet />
        </div>
        <footer style={{ textAlign: 'center', padding: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--border)', marginTop: 'auto' }}>
          Designed and developed by <a href="https://piyushassudani.in" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', fontWeight: 'bold', textDecoration: 'none' }}>Piyush Assudani</a>, Founder Assudani Developer | Contact: 9413879444
        </footer>
      </main>
    </div>
  );
};

export default VolunteerLayout;
