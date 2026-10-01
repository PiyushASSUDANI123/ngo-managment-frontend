import { useState } from 'react';
import axios from '../../api/axios';
import { toast } from 'react-toastify';

const Settings = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [newAdminUsername, setNewAdminUsername] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [newAdminName, setNewAdminName] = useState('');

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    try {
      await axios.put('/settings/change-password', { currentPassword, newPassword });
      toast.success('Password changed successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/settings/create-admin', {
        username: newAdminUsername,
        password: newAdminPassword,
        name: newAdminName
      });
      toast.success('New Admin created successfully');
      setNewAdminUsername('');
      setNewAdminPassword('');
      setNewAdminName('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create admin');
    }
  };

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h2>Admin Settings</h2>
        <p>Manage your account and create new administrators</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Change My Password</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label>Current Password</label>
                <input 
                  type="password" 
                  value={currentPassword} 
                  onChange={(e) => setCurrentPassword(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>New Password</label>
                <input 
                  type="password" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  required 
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>Update Password</button>
            </form>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Create New Admin</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleCreateAdmin}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={newAdminName} 
                  onChange={(e) => setNewAdminName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Username</label>
                <input 
                  type="text" 
                  value={newAdminUsername} 
                  onChange={(e) => setNewAdminUsername(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Password</label>
                <input 
                  type="password" 
                  value={newAdminPassword} 
                  onChange={(e) => setNewAdminPassword(e.target.value)} 
                  required 
                  minLength={6}
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }}>Create Admin</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
