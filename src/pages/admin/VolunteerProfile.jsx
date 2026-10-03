import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { HiOutlineArrowLeft, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineLockClosed, HiOutlineLockOpen, HiOutlineX, HiOutlineDownload } from 'react-icons/hi';
import { BASE_URL } from '../../utils/config';

const VolunteerProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [volunteer, setVolunteer] = useState(null);
  const [reports, setReports] = useState([]);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('screenshots');

  useEffect(() => {
    fetchProfileData();
  }, [id]);

  const fetchProfileData = async () => {
    try {
      const [volRes, repRes, ptsRes] = await Promise.all([
        API.get(`/volunteers/${id}`),
        API.get(`/reports?volunteerId=${id}`),
        API.get(`/points?volunteer=${id}`)
      ]);
      setVolunteer(volRes.data);
      setReports(repRes.data);
      setPoints(ptsRes.data);
    } catch (error) {
      toast.error('Failed to load profile');
      navigate('/admin/volunteers');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await API.delete(`/reports/${reportId}`);
      toast.success('Report deleted successfully');
      setReports(reports.filter(r => r._id !== reportId));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete report');
    }
  };

  const handleDownloadReport = async (report) => {
    try {
      for (let i = 0; i < report.screenshots.length; i++) {
        const url = `${BASE_URL}${report.screenshots[i]}`;
        const response = await fetch(url);
        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = `report_${report._id}_ss${i+1}.jpg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(blobUrl);
      }
      toast.success('Download started');
    } catch (error) {
      toast.error('Failed to download images');
    }
  };

  const toggleAccess = async () => {
    const newStatus = volunteer.status === 'active' ? 'inactive' : 'active';
    if (!window.confirm(`Change access to ${newStatus}?`)) return;
    try {
      const fd = new FormData();
      fd.append('status', newStatus);
      const res = await API.put(`/volunteers/${id}`, fd);
      setVolunteer(res.data);
      toast.success(`Access updated to ${newStatus}`);
    } catch (error) {
      toast.error('Failed to update access');
    }
  };

  if (loading) return <div className="page-loader"><div className="loading-spinner"></div></div>;
  if (!volunteer) return null;

  return (
    <div className="page">
      <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="icon-btn" onClick={() => navigate('/admin/volunteers')}>
          <HiOutlineArrowLeft size={24} />
        </button>
        <div style={{ flex: 1 }}>
          <h2>{volunteer.name}'s Profile</h2>
          <p>ID: {volunteer.volunteerId} | Field: {volunteer.field?.name || 'N/A'}</p>
        </div>
        <button 
          className={`btn ${volunteer.status === 'active' ? 'btn-danger' : 'btn-success'}`} 
          onClick={toggleAccess}
        >
          {volunteer.status === 'active' ? <><HiOutlineLockClosed /> Block Access</> : <><HiOutlineLockOpen /> Restore Access</>}
        </button>
      </div>

      <div className="profile-tabs" style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
        <button 
          className={activeTab === 'screenshots' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('screenshots')}
          style={{ padding: '0.5rem 1rem', borderBottom: activeTab === 'screenshots' ? '2px solid #0f172a' : 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Added SS (Screenshots)
        </button>
        <button 
          className={activeTab === 'points' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('points')}
          style={{ padding: '0.5rem 1rem', borderBottom: activeTab === 'points' ? '2px solid #0f172a' : 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Points History
        </button>
        <button 
          className={activeTab === 'details' ? 'tab-btn active' : 'tab-btn'}
          onClick={() => setActiveTab('details')}
          style={{ padding: '0.5rem 1rem', borderBottom: activeTab === 'details' ? '2px solid #0f172a' : 'none', background: 'none', cursor: 'pointer', fontWeight: 600 }}
        >
          Full Details
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'screenshots' && (
          <div className="reports-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
            {reports.length === 0 ? (
              <p>No screenshots or reports added yet.</p>
            ) : (
              reports.map(report => (
                <div key={report._id} className="card" style={{ padding: '1rem', border: '1px solid #e2e8f0', borderRadius: '8px', position: 'relative' }}>
                  <button 
                    onClick={() => handleDeleteReport(report._id)} 
                    style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--error)' }}
                    title="Delete Report"
                  >
                    <HiOutlineX size={20} />
                  </button>
                  <button 
                    onClick={() => handleDownloadReport(report)} 
                    style={{ position: 'absolute', top: '10px', right: '40px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                    title="Download Screenshots"
                  >
                    <HiOutlineDownload size={20} />
                  </button>

                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', marginRight: '60px' }}>
                    <span className="badge">{new Date(report.date || report.createdAt).toLocaleDateString()}</span>
                    <span className={`status-badge ${report.status}`}>{report.status}</span>
                  </div>
                  <p><strong>Task:</strong> {report.category?.name || report.taskType || 'Unknown'}</p>
                  <p style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '1rem' }}>{report.description}</p>
                  
                  {report.screenshots && report.screenshots.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
                      {report.screenshots.map((img, i) => (
                        <a key={i} href={`${BASE_URL}${img}`}>
                          <img src={`${BASE_URL}${img}`} alt={`SS ${i+1}`} style={{ height: '100px', width: '100px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #e2e8f0' }} />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {activeTab === 'points' && (
          <div className="table-container">
            {points.length === 0 ? (
              <p>No points assigned yet.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Points</th>
                    <th>Date</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {points.map(p => (
                    <tr key={p._id}>
                      <td><span className="badge">{p.category?.name || '-'}</span></td>
                      <td><span className="points-badge">{p.points}</span></td>
                      <td>{new Date(p.date).toLocaleDateString()}</td>
                      <td>{p.remarks || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="card" style={{ padding: '2rem', maxWidth: '600px' }}>
            <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', marginBottom: '2rem' }}>
              {volunteer.photo ? (
                <img src={volunteer.photo} alt={volunteer.name} style={{ width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '120px', height: '120px', borderRadius: '50%', backgroundColor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem', color: '#64748b' }}>
                  {volunteer.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 style={{ fontSize: '1.5rem', margin: 0 }}>{volunteer.name}</h3>
                <p style={{ color: '#64748b', margin: '0.5rem 0 0 0' }}>{volunteer.email || 'No email provided'}</p>
                <p style={{ color: '#64748b', margin: 0 }}>{volunteer.mobile}</p>
                <div style={{ marginTop: '0.5rem' }}>
                  <span className={`status-badge ${volunteer.status}`}>{volunteer.status}</span>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Join Date</label>
                <p style={{ margin: '0.2rem 0 0 0', fontWeight: 500 }}>{new Date(volunteer.joinDate).toLocaleDateString()}</p>
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>City / State</label>
                <p style={{ margin: '0.2rem 0 0 0', fontWeight: 500 }}>{volunteer.city || '-'} / {volunteer.state || '-'}</p>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.8rem', color: '#64748b', textTransform: 'uppercase' }}>Address</label>
                <p style={{ margin: '0.2rem 0 0 0', fontWeight: 500 }}>{volunteer.address || '-'}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VolunteerProfile;
