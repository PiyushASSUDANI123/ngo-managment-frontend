import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import { BASE_URL } from '../../utils/config';

const UploadReport = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewImage, setViewImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);

  useEffect(() => {
    fetchMyReports();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await axios.get('/points-categories');
      setCategories(data);
      if (data.length > 0) setCategory(data[0]._id);
    } catch (error) {
      toast.error('Failed to fetch categories');
    }
  };

  const fetchMyReports = async () => {
    try {
      const res = await axios.get('/reports/my-reports');
      setReports(res.data);
    } catch (error) {
      toast.error('Failed to fetch your reports');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (files.length === 0) return toast.error('Please select at least one screenshot');
    
    setUploading(true);
    const formData = new FormData();
    formData.append('category', category);
    formData.append('description', description);
    files.forEach(file => {
      formData.append('screenshots', file);
    });

    try {
      await axios.post('/reports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success('Report uploaded successfully!');
      setDescription('');
      setFiles([]);
      fetchMyReports(); // Refresh list
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload report');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      await axios.delete(`/reports/${id}`);
      toast.success('Report deleted successfully');
      fetchMyReports();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete report');
    }
  };

  return (
    <div className="dashboard-content">
      
      {uploading && (
        <div className="overlay-loader" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <div className="loading-spinner"></div>
          <p style={{ marginTop: '1rem', fontWeight: 'bold', color: 'var(--primary)' }}>Processing...</p>
        </div>
      )}
      <div className="page-header">
        <h2>Daily Promotion Reports</h2>
        <p>Upload your daily group promotion screenshots here</p>
      </div>

      <div className="stats-grid">
        <div className="card">
          <h3>Upload Proofs</h3>
          <form onSubmit={handleSubmit} style={{ marginTop: '1rem' }}>
            
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Program / Task Type *</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} required>
                {categories.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Description (Optional)</label>
              <input 
                type="text" 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="e.g., Morning spam in 5 groups"
              />
            </div>
            
            <div className="form-group" style={{ marginTop: '1rem' }}>
              <label>Select Screenshots (Max 5)</label>
              <input 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleFileChange} 
                required 
              />
              {files.length > 0 && (
                <p style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.5rem' }}>
                  {files.length} file(s) selected
                </p>
              )}
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ marginTop: '1.5rem', width: '100%' }}
              disabled={uploading}
            >
              {uploading ? 'Uploading...' : 'Upload Report'}
            </button>
          </form>
        </div>

        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h3>My Past Reports</h3>
          {loading ? (
            <p>Loading reports...</p>
          ) : reports.length === 0 ? (
            <p>No reports uploaded yet.</p>
          ) : (
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ whiteSpace: 'nowrap' }}>Date</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Type</th>
                    <th>Description</th>
                    <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Status</th>
                    <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Points</th>
                    <th style={{ whiteSpace: 'nowrap' }}>Proofs</th>
                    <th style={{ whiteSpace: 'nowrap', textAlign: 'center' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map(report => (
                    <tr key={report._id}>
                      <td style={{ whiteSpace: 'nowrap' }}>{new Date(report.createdAt).toLocaleDateString()}</td>
                      <td style={{ textTransform: 'capitalize', whiteSpace: 'nowrap' }}>{report.category?.name || 'Unknown'}</td>
                      <td>{report.description}</td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`badge ${report.status === 'approved' ? 'badge-success' : report.status === 'rejected' ? 'badge-error' : 'badge-warning'}`} style={{ whiteSpace: 'nowrap' }}>
                          {report.status}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>{report.pointsAwarded || 0}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                          {report.screenshots.map((ss, idx) => {
                            const imgUrl = ss.startsWith('http') ? ss : `${BASE_URL}${ss}`;
                            return (
                              <button 
                                key={idx} 
                                onClick={() => setViewImage(imgUrl)}
                                className="btn-outline"
                                type="button"
                                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', cursor: 'pointer' }}
                              >
                                View {idx + 1}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        {report.status === 'pending' && (
                          <button 
                            onClick={() => handleDelete(report._id)} 
                            style={{ background: '#ef4444', color: 'white', border: 'none', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      
      {/* Lightbox Modal */}
      {viewImage && (
        <div 
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
          }}
          onClick={() => setViewImage(null)}
        >
          <div style={{ position: 'relative', maxWidth: '90%', maxHeight: '90%' }}>
            <button 
              onClick={() => setViewImage(null)}
              style={{
                position: 'absolute', top: '-40px', right: '0', background: 'transparent',
                border: 'none', color: 'white', fontSize: '2rem', cursor: 'pointer'
              }}
            >
              &times;
            </button>
            <img src={viewImage} alt="Proof" style={{ maxWidth: '100%', maxHeight: '90vh', objectFit: 'contain', borderRadius: '8px' }} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadReport;
