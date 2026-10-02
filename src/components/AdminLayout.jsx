import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import AdminSidebar from './AdminSidebar';
import { HiOutlineMenuAlt2 } from 'react-icons/hi';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="layout">
      <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="main-content">
        <header className="topbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button className="menu-toggle" onClick={() => setSidebarOpen(true)}>
              <HiOutlineMenuAlt2 />
            </button>
            <h1 className="page-title">Admin Dashboard</h1>
          </div>
          <button 
            onClick={() => {
              localStorage.removeItem('ngo_user');
              window.location.href = '/login';
            }} 
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: '#EF4444', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Logout
          </button>
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

export default AdminLayout;
