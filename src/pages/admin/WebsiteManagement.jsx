import React, { useState, useEffect } from 'react';
import API from '../../api/axios';
import { HiOutlineCheck, HiOutlineX, HiOutlineEye, HiOutlineTrash } from 'react-icons/hi';
import { toast } from 'react-toastify';

const WebsiteManagement = () => {
  const [activeTab, setActiveTab] = useState('applications');
  const [applications, setApplications] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal state
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'applications') {
        const res = await API.get('/website/applications');
        setApplications(res.data.applications);
      } else {
        const res = await API.get('/website/reviews');
        setReviews(res.data.reviews);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action, type) => {
    try {
      if (type === 'application') {
        await API.put(`/website/applications/${id}/status`, { status: action });
        setApplications(applications.map(app => app._id === id ? { ...app, status: action } : app));
        toast.success(`Application ${action}`);
      } else {
        const newStatus = action === 'approve' ? 'Approved' : 'Rejected';
        await API.put(`/website/reviews/${id}/status`, { status: newStatus });
        setReviews(reviews.map(rev => rev._id === id ? { ...rev, status: newStatus } : rev));
        toast.success(`Review ${action}d`);
      }
    } catch (err) {
      toast.error('Action failed');
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review permanently?')) return;
    try {
      await API.delete(`/website/reviews/${id}`);
      setReviews(reviews.filter(rev => rev._id !== id));
      toast.success('Review deleted');
    } catch (err) {
      toast.error('Failed to delete review');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Website Management</h2>
          <p>Manage volunteer applications and reviews from the website</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button 
          className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('applications')}
        >
          Volunteer Applications
        </button>
        <button 
          className={`btn ${activeTab === 'reviews' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('reviews')}
        >
          Website Reviews
        </button>
      </div>

      <div className="card" style={{ padding: 0 }}>
        {loading ? (
          <div className="page-loader"><div className="loading-spinner"></div></div>
        ) : activeTab === 'applications' ? (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Class/School</th>
                  <th>Department</th>
                  <th>Contact</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.length > 0 ? applications.map(app => (
                  <tr key={app._id}>
                    <td>
                      <p style={{ fontWeight: 600 }}>{app.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.location}</p>
                    </td>
                    <td>
                      <p>{app.school}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{app.className}</p>
                    </td>
                    <td>{app.department}</td>
                    <td>{app.contact}</td>
                    <td>
                      <span className={`status-badge ${app.status === 'Approved' ? 'success' : app.status === 'Rejected' ? 'danger' : 'warning'}`}>
                        {app.status || 'Pending'}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        <button className="icon-btn" onClick={() => { setSelectedApp(app); setViewModalOpen(true); }} title="View Details" style={{ color: 'var(--primary)' }}>
                          <HiOutlineEye />
                        </button>
                        <button className="icon-btn edit" onClick={() => handleAction(app._id, 'Approved', 'application')} title="Approve">
                          <HiOutlineCheck />
                        </button>
                        <button className="icon-btn delete" onClick={() => handleAction(app._id, 'Rejected', 'application')} title="Reject">
                          <HiOutlineX />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="6" className="text-center">No applications found</td></tr>}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Review</th>
                  <th>Rating</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reviews.length > 0 ? reviews.map(rev => (
                  <tr key={rev._id}>
                    <td style={{ fontWeight: 600 }}>{rev.name}</td>
                    <td>{rev.review}</td>
                    <td>{rev.rating} / 5</td>
                    <td>
                      <span className={`status-badge ${rev.status === 'Approved' ? 'success' : rev.status === 'Rejected' ? 'danger' : 'warning'}`}>
                        {rev.status}
                      </span>
                    </td>
                    <td>
                      <div className="table-actions">
                        {rev.status === 'Pending' && (
                          <button className="icon-btn edit" onClick={() => handleAction(rev._id, 'approve', 'review')} title="Approve Review">
                            <HiOutlineCheck />
                          </button>
                        )}
                        {rev.status !== 'Rejected' && (
                          <button className="icon-btn delete" onClick={() => handleAction(rev._id, 'reject', 'review')} title="Reject Review">
                            <HiOutlineX />
                          </button>
                        )}
                        <button className="icon-btn delete" onClick={() => handleDeleteReview(rev._id)} title="Delete Review Permanently" style={{ color: 'red' }}>
                          <HiOutlineTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : <tr><td colSpan="5" className="text-center">No reviews found</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* View Application Modal */}
      {viewModalOpen && selectedApp && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h3>Application Details</h3>
              <button className="close-btn" onClick={() => { setViewModalOpen(false); setSelectedApp(null); }}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'grid', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div><strong>Name:</strong> <p>{selectedApp.name}</p></div>
                <div><strong>Department:</strong> <p>{selectedApp.department}</p></div>
                <div><strong>Class:</strong> <p>{selectedApp.className || selectedApp.class}</p></div>
                <div><strong>School/College:</strong> <p>{selectedApp.school}</p></div>
                <div><strong>Location:</strong> <p>{selectedApp.location}</p></div>
                <div><strong>Contact:</strong> <p>{selectedApp.contact}</p></div>
              </div>
              <hr style={{ border: 'none', borderTop: '1px solid #eee' }} />
              <div>
                <strong>Why they want to join:</strong>
                <p style={{ background: '#f8f9fa', padding: '10px', borderRadius: '5px', marginTop: '5px' }}>{selectedApp.reason}</p>
              </div>
              <div>
                <strong>Past Experience/Resume:</strong>
                <p>{selectedApp.experienceLink || selectedApp.experience ? <a href={selectedApp.experienceLink || selectedApp.experience} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>View Link</a> : 'Not provided'}</p>
              </div>
              <div>
                <strong>Reference:</strong>
                <p>{selectedApp.reference || 'None'}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WebsiteManagement;
