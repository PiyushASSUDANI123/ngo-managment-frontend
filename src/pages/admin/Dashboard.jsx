import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { HiOutlineUserGroup, HiOutlineCollection, HiOutlineClipboardList, HiOutlineChatAlt2, HiOutlineCurrencyRupee, HiOutlineStar } from 'react-icons/hi';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    volunteers: 0,
    fields: 0,
    tasks: 0,
    appeals: 0,
    totalFunding: 0,
    totalPoints: 0
  });
  const [recentVolunteers, setRecentVolunteers] = useState([]);
  const [recentAppeals, setRecentAppeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [volunteersRes, fieldsRes, tasksRes, appealsRes, donationsRes] = await Promise.all([
        API.get('/volunteers'),
        API.get('/fields'),
        API.get('/tasks'),
        API.get('/appeals'),
        API.get('/donations')
      ]);

      setStats({
        volunteers: volunteersRes.data.length,
        fields: fieldsRes.data.length,
        tasks: tasksRes.data.length,
        appeals: appealsRes.data.filter(a => a.status === 'pending').length,
        totalFunding: donationsRes.data.totalAmount || 0,
        totalPoints: 0
      });

      setRecentVolunteers(volunteersRes.data.slice(0, 5));
      setRecentAppeals(appealsRes.data.filter(a => a.status === 'pending').slice(0, 5));
    } catch (error) {
      console.error('Dashboard fetch error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="page-loader"><div className="loading-spinner"></div></div>;
  }

  const statCards = [
    { label: 'Total Volunteers', value: stats.volunteers, icon: <HiOutlineUserGroup />, color: '#0f766e' },
    { label: 'Active Fields', value: stats.fields, icon: <HiOutlineCollection />, color: '#7c3aed' },
    { label: 'Total Tasks', value: stats.tasks, icon: <HiOutlineClipboardList />, color: '#2563eb' },
    { label: 'Pending Appeals', value: stats.appeals, icon: <HiOutlineChatAlt2 />, color: '#dc2626' },
    { label: 'Total Funding', value: `₹${stats.totalFunding.toLocaleString()}`, icon: <HiOutlineCurrencyRupee />, color: '#059669' }
  ];

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h2>Welcome Back!</h2>
        <p>Here's an overview of your NGO management</p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat, index) => (
          <div className="stat-card" key={index} style={{ '--accent': stat.color }}>
            <div className="stat-icon" style={{ background: `${stat.color}15`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3 className="stat-value">{stat.value}</h3>
              <p className="stat-label">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Recent Volunteers</h3>
          </div>
          <div className="card-body">
            {recentVolunteers.length === 0 ? (
              <p className="empty-message">No volunteers yet</p>
            ) : (
              <div className="mini-table">
                {recentVolunteers.map((vol) => (
                  <div className="mini-table-row" key={vol._id}>
                    <div className="mini-avatar">{vol.name.charAt(0)}</div>
                    <div className="mini-info">
                      <p className="mini-name">{vol.name}</p>
                      <p className="mini-detail">{vol.volunteerId} • {vol.field?.name}</p>
                    </div>
                    <span className={`status-badge ${vol.status}`}>{vol.status}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-card">
          <div className="card-header">
            <h3>Pending Appeals</h3>
          </div>
          <div className="card-body">
            {recentAppeals.length === 0 ? (
              <p className="empty-message">No pending appeals</p>
            ) : (
              <div className="mini-table">
                {recentAppeals.map((appeal) => (
                  <div className="mini-table-row" key={appeal._id}>
                    <div className="mini-avatar" style={{ background: '#fef3c7', color: '#d97706' }}>!</div>
                    <div className="mini-info">
                      <p className="mini-name">{appeal.subject}</p>
                      <p className="mini-detail">By {appeal.volunteer?.name}</p>
                    </div>
                    <span className="status-badge pending">Pending</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
