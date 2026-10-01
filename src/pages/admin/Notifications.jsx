import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { toast } from 'react-toastify';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      setNotifications(res.data);
    } catch (error) {
      toast.error('Failed to fetch notifications');
    }
  };

  const handlePush = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post('/notifications', { title, message });
      toast.success('Notification pushed successfully');
      setTitle('');
      setMessage('');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to push notification');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (id) => {
    try {
      await axios.put(`/notifications/${id}/deactivate`);
      toast.success('Notification deactivated');
      fetchNotifications();
    } catch (error) {
      toast.error('Failed to deactivate notification');
    }
  };

  return (
    <div className="dashboard-content">
      <div className="page-header">
        <h2>Global Notifications</h2>
        <p>Push announcements and updates to all volunteers</p>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Push New Notification</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handlePush}>
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  required 
                  placeholder="e.g. New Task Available!"
                />
              </div>
              <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Message</label>
                <textarea 
                  value={message} 
                  onChange={(e) => setMessage(e.target.value)} 
                  required 
                  rows={4}
                  placeholder="Type your announcement here..."
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
                ></textarea>
              </div>
              <button type="submit" className="btn btn-primary" style={{ marginTop: '1.5rem', width: '100%' }} disabled={loading}>
                {loading ? 'Pushing...' : 'Push Notification'}
              </button>
            </form>
          </div>
        </div>

        <div className="dashboard-card" style={{ gridColumn: 'span 2' }}>
          <div className="card-header">
            <h3>Past Notifications</h3>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Title</th>
                    <th>Message</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {notifications.map(notif => (
                    <tr key={notif._id}>
                      <td>{new Date(notif.createdAt).toLocaleDateString()}</td>
                      <td><strong>{notif.title}</strong></td>
                      <td>{notif.message}</td>
                      <td>
                        <span className={`badge ${notif.active ? 'badge-success' : 'badge-warning'}`}>
                          {notif.active ? 'Active' : 'Deactivated'}
                        </span>
                      </td>
                      <td>
                        {notif.active && (
                          <button onClick={() => handleDeactivate(notif._id)} className="btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Deactivate</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
