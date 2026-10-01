import { useState } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { HiOutlineKey } from 'react-icons/hi';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (formData.newPassword.length < 4) {
      toast.error('Password must be at least 4 characters');
      return;
    }

    setLoading(true);
    try {
      await API.put('/auth/change-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      toast.success('Password changed successfully!');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Change Password</h2>
          <p>Update your account password</p>
        </div>
      </div>

      <div className="inline-form-card" style={{ maxWidth: '500px' }}>
        <div className="change-password-icon">
          <HiOutlineKey />
        </div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Current Password *</label>
            <input type="password" placeholder="Enter current password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>New Password *</label>
            <input type="password" placeholder="Enter new password (min 4 chars)"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Confirm New Password *</label>
            <input type="password" placeholder="Confirm new password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })} required />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? <span className="btn-loader"></span> : 'Update Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
