import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { HiOutlineCheck, HiOutlineX, HiOutlineTrash } from 'react-icons/hi';

const Appeals = () => {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [responseModal, setResponseModal] = useState(null);
  const [adminResponse, setAdminResponse] = useState('');

  useEffect(() => {
    fetchAppeals();
  }, []);

  const fetchAppeals = async () => {
    try {
      const { data } = await API.get('/appeals');
      setAppeals(data);
    } catch (error) {
      toast.error('Failed to fetch appeals');
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async (id, status) => {
    try {
      await API.put(`/appeals/${id}`, { status, adminResponse });
      toast.success(`Appeal ${status}`);
      setResponseModal(null);
      setAdminResponse('');
      fetchAppeals();
    } catch (error) {
      toast.error('Failed to update appeal');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this appeal?')) return;
    try {
      await API.delete(`/appeals/${id}`);
      toast.success('Appeal deleted');
      fetchAppeals();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const filteredAppeals = appeals.filter((a) => {
    return !filterStatus || a.status === filterStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'approved': return '✅';
      case 'rejected': return '❌';
      default: return '❓';
    }
  };

  if (loading) {
    return <div className="page-loader"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Appeals & Requests</h2>
          <p>Review and respond to volunteer change requests</p>
        </div>
      </div>

      <div className="filters-bar">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
        <span className="filter-info">
          {filteredAppeals.filter(a => a.status === 'pending').length} pending appeals
        </span>
      </div>

      <div className="appeals-list">
        {filteredAppeals.length === 0 ? (
          <div className="empty-state">
            <h3>No Appeals Found</h3>
            <p>All clear! No volunteer appeals to review.</p>
          </div>
        ) : (
          filteredAppeals.map((appeal) => (
            <div className={`appeal-card ${appeal.status}`} key={appeal._id}>
              <div className="appeal-header">
                <div className="appeal-meta">
                  <span className="appeal-status-icon">{getStatusIcon(appeal.status)}</span>
                  <span className={`status-badge ${appeal.status}`}>{appeal.status}</span>
                  <span className="appeal-date">
                    {new Date(appeal.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </span>
                </div>
                <button className="icon-btn delete" onClick={() => handleDelete(appeal._id)}>
                  <HiOutlineTrash />
                </button>
              </div>

              <div className="appeal-body">
                <div className="appeal-from">
                  <strong>From:</strong> {appeal.volunteer?.name} ({appeal.volunteer?.volunteerId})
                </div>
                <h4 className="appeal-subject">{appeal.subject}</h4>
                <p className="appeal-message">{appeal.message}</p>

                {appeal.adminResponse && (
                  <div className="appeal-response">
                    <strong>Admin Response:</strong>
                    <p>{appeal.adminResponse}</p>
                  </div>
                )}
              </div>

              {appeal.status === 'pending' && (
                <div className="appeal-actions">
                  <button className="btn btn-success" onClick={() => setResponseModal({ id: appeal._id, action: 'approved' })}>
                    <HiOutlineCheck /> Approve
                  </button>
                  <button className="btn btn-danger" onClick={() => setResponseModal({ id: appeal._id, action: 'rejected' })}>
                    <HiOutlineX /> Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {responseModal && (
        <div className="modal-overlay" onClick={() => setResponseModal(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{responseModal.action === 'approved' ? 'Approve' : 'Reject'} Appeal</h3>
              <button className="icon-btn" onClick={() => setResponseModal(null)}><HiOutlineX /></button>
            </div>
            <div className="modal-form">
              <div className="form-group">
                <label>Response Message (Optional)</label>
                <textarea
                  placeholder="Write your response..."
                  value={adminResponse}
                  onChange={(e) => setAdminResponse(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button className="btn btn-secondary" onClick={() => setResponseModal(null)}>Cancel</button>
                <button
                  className={`btn ${responseModal.action === 'approved' ? 'btn-success' : 'btn-danger'}`}
                  onClick={() => handleRespond(responseModal.id, responseModal.action)}
                >
                  Confirm {responseModal.action === 'approved' ? 'Approval' : 'Rejection'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appeals;
