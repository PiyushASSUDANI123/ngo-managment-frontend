import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { HiOutlineStar, HiOutlineClipboardList, HiOutlineChatAlt2, HiOutlineUser, HiOutlinePencil, HiOutlineX } from 'react-icons/hi';
import { toast } from 'react-toastify';

const VolunteerDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [points, setPoints] = useState({ summary: [], totalPoints: 0 });
  const [appeals, setAppeals] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileFormData, setProfileFormData] = useState({
    mobile: '', email: '', address: '', city: '', state: ''
  });
  const [profilePhotoFile, setProfilePhotoFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [profileRes, tasksRes, pointsRes, appealsRes, notifRes, catRes] = await Promise.all([
        API.get(`/volunteers/${user._id}`),
        API.get('/tasks'),
        API.get(`/points/summary/${user._id}`),
        API.get('/appeals'),
        API.get('/notifications/active'),
        API.get('/points-categories')
      ]);
      setProfile(profileRes.data);
      setTasks(tasksRes.data);
      setPoints(pointsRes.data);
      setAppeals(appealsRes.data);
      setNotifications(notifRes.data);
      setCategories(catRes.data);
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-loader"><div className="loading-spinner"></div></div>;
  }

  const handleEditProfile = () => {
    setProfileFormData({
      mobile: profile.mobile || '',
      email: profile.email || '',
      address: profile.address || '',
      city: profile.city || '',
      state: profile.state || ''
    });
    setProfilePhotoFile(null);
    setShowProfileModal(true);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.keys(profileFormData).forEach(key => fd.append(key, profileFormData[key]));
    if (profilePhotoFile) fd.append('photo', profilePhotoFile);

    try {
      const res = await API.put('/volunteers/profile/me', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setProfile(res.data);
      setShowProfileModal(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2>Welcome, {user?.name}! 👋</h2>
        <p>Here's your activity overview</p>
      </div>

      {notifications.length > 0 && (
        <div style={{ marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {notifications.map(n => (
            <div key={n._id} style={{ padding: '1rem 1.5rem', background: 'var(--primary)', color: 'white', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-md)', display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '1.5rem', paddingTop: '2px' }}><HiOutlineChatAlt2 /></div>
              <div>
                <h4 style={{ margin: 0, fontWeight: 700, fontSize: '1rem' }}>{n.title}</h4>
                <p style={{ margin: '0.25rem 0 0 0', opacity: 0.9, fontSize: '0.9rem' }}>{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Profile Card */}
      {profile && (
        <div className="volunteer-profile-card">
          <div className="profile-avatar-section">
            <div style={{ position: 'relative' }}>
              {profile.photo ? (
                <img src={profile.photo.startsWith('http') ? profile.photo : `https://envision.piyushassudani.in${profile.photo}`} alt={profile.name} className="profile-avatar-img" />
              ) : (
                <div className="profile-avatar-placeholder">{profile.name.charAt(0)}</div>
              )}
            </div>
            <div className="profile-details" style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{profile.name}</h3>
                <button onClick={handleEditProfile} className="btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>
                  <HiOutlinePencil /> Edit Profile
                </button>
              </div>
              <span className="badge">{profile.volunteerId}</span>
              <p>{profile.field?.name}</p>
            </div>
          </div>
          <div className="profile-info-grid">
            <div><strong>Mobile:</strong> {profile.mobile}</div>
            <div><strong>Email:</strong> {profile.email || 'N/A'}</div>
            <div><strong>City:</strong> {profile.city || 'N/A'}</div>
            <div><strong>Joined:</strong> {new Date(profile.joinDate).toLocaleDateString('en-IN')}</div>
          </div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-card" style={{ '--accent': '#0f766e' }}>
          <div className="stat-icon" style={{ background: '#0f766e15', color: '#0f766e' }}>
            <HiOutlineStar />
          </div>
          <div className="stat-info">
            <h3 className="stat-value">{points.totalPoints}</h3>
            <p className="stat-label">Total Points</p>
          </div>
        </div>
        <div className="stat-card" style={{ '--accent': '#2563eb' }}>
          <div className="stat-icon" style={{ background: '#2563eb15', color: '#2563eb' }}>
            <HiOutlineClipboardList />
          </div>
          <div className="stat-info">
            <h3 className="stat-value">{tasks.length}</h3>
            <p className="stat-label">Total Tasks</p>
          </div>
        </div>
        <div className="stat-card" style={{ '--accent': '#f59e0b' }}>
          <div className="stat-icon" style={{ background: '#f59e0b15', color: '#f59e0b' }}>
            <HiOutlineClipboardList />
          </div>
          <div className="stat-info">
            <h3 className="stat-value">{pendingTasks}</h3>
            <p className="stat-label">Pending Tasks</p>
          </div>
        </div>
        <div className="stat-card" style={{ '--accent': '#7c3aed' }}>
          <div className="stat-icon" style={{ background: '#7c3aed15', color: '#7c3aed' }}>
            <HiOutlineChatAlt2 />
          </div>
          <div className="stat-info">
            <h3 className="stat-value">{appeals.length}</h3>
            <p className="stat-label">Appeals Sent</p>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Points Summary */}
        <div className="dashboard-card">
          <div className="card-header"><h3>Points by Field</h3></div>
          <div className="card-body">
            {points.summary.length === 0 ? (
              <p className="empty-message">No points earned yet</p>
            ) : (
              <div className="points-summary-list">
                {points.summary.map((s, i) => (
                  <div className="points-summary-row" key={i}>
                    <span className="points-field">{s.category}</span>
                    <div className="points-bar-container">
                      <div className="points-bar" style={{
                        width: `${Math.min((s.totalPoints / Math.max(...points.summary.map(x => x.totalPoints))) * 100, 100)}%`
                      }}></div>
                    </div>
                    <span className="points-value">{s.totalPoints}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Ways to Earn Points */}
        <div className="dashboard-card">
          <div className="card-header"><h3>Ways to Earn Points</h3></div>
          <div className="card-body">
            {categories.length === 0 ? (
              <p className="empty-message">No programs available yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {categories.map((cat) => (
                  <div key={cat._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem 1rem', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                    <div>
                      <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>{cat.name}</h4>
                      {cat.description && <p style={{ margin: '0.2rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{cat.description}</p>}
                    </div>
                    <span className="points-badge" style={{ fontSize: '0.85rem' }}>+{cat.defaultPoints} Pts</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Tasks */}
        <div className="dashboard-card">
          <div className="card-header"><h3>Recent Tasks</h3></div>
          <div className="card-body">
            {tasks.length === 0 ? (
              <p className="empty-message">No tasks assigned yet</p>
            ) : (
              <div className="mini-table">
                {tasks.slice(0, 5).map((task) => (
                  <div className="mini-table-row" key={task._id}>
                    <div className="mini-info">
                      <p className="mini-name">{task.title}</p>
                      <p className="mini-detail">
                        {task.dueDate ? `Due: ${new Date(task.dueDate).toLocaleDateString('en-IN')}` : 'No due date'}
                      </p>
                    </div>
                    <span className={`status-badge ${task.status}`}>{task.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Profile</h3>
              <button className="icon-btn" onClick={() => setShowProfileModal(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label>Profile Photo</label>
                <input type="file" accept="image/*" onChange={(e) => setProfilePhotoFile(e.target.files[0])} />
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label>Mobile Number</label>
                  <input type="text" value={profileFormData.mobile} onChange={e => setProfileFormData({...profileFormData, mobile: e.target.value})} required />
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input type="email" value={profileFormData.email} onChange={e => setProfileFormData({...profileFormData, email: e.target.value})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Address</label>
                  <input type="text" value={profileFormData.address} onChange={e => setProfileFormData({...profileFormData, address: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" value={profileFormData.city} onChange={e => setProfileFormData({...profileFormData, city: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" value={profileFormData.state} onChange={e => setProfileFormData({...profileFormData, state: e.target.value})} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowProfileModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default VolunteerDashboard;
