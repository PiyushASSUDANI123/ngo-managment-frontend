import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { HiOutlinePaperAirplane } from 'react-icons/hi';

const AppealForm = () => {
  const [appeals, setAppeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await API.post('/appeals', formData);
      toast.success('Appeal submitted successfully!');
      setFormData({ subject: '', message: '' });
      fetchAppeals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit appeal');
    } finally {
      setSubmitting(false);
    }
  };

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
          <h2>Submit Appeal</h2>
          <p>Request changes or submit appeals to the admin</p>
        </div>
      </div>

      {/* Appeal Form */}
      <div className="inline-form-card">
        <h3>New Appeal</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Subject *</label>
            <input type="text" placeholder="Brief subject of your appeal"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Message *</label>
            <textarea placeholder="Describe your request in detail..."
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={4} required />
          </div>
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? <span className="btn-loader"></span> : <><HiOutlinePaperAirplane /> Submit Appeal</>}
            </button>
          </div>
        </form>
      </div>

      {/* Previous Appeals */}
      <div className="section-title">
        <h3>Previous Appeals</h3>
      </div>

      <div className="appeals-list">
        {appeals.length === 0 ? (
          <div className="empty-state">
            <h3>No Appeals Yet</h3>
            <p>Submit your first appeal using the form above</p>
          </div>
        ) : (
          appeals.map((appeal) => (
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
              </div>
              <div className="appeal-body">
                <h4 className="appeal-subject">{appeal.subject}</h4>
                <p className="appeal-message">{appeal.message}</p>
                {appeal.adminResponse && (
                  <div className="appeal-response">
                    <strong>Admin Response:</strong>
                    <p>{appeal.adminResponse}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AppealForm;
