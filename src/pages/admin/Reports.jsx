import { useState, useEffect } from 'react';
import axios from '../../api/axios';
import { toast } from 'react-toastify';
import ExportButtons from '../../components/ExportButtons';
import { BASE_URL } from '../../utils/config';

const Reports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchReports();
  }, [dateFilter]);

  const fetchReports = async () => {
    try {
      const query = dateFilter ? `?date=${dateFilter}` : '';
      const res = await axios.get(`/reports${query}`);
      setReports(res.data);
    } catch (error) {
      toast.error('Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, status, defaultPoints = 0) => {
    let points = 0;
    if (status === 'approved') {
      const input = window.prompt('Enter points to award for this task:', defaultPoints);
      if (input === null) return; // Cancelled
      points = parseInt(input);
      if (isNaN(points) || points < 0) return toast.error('Invalid points');
    }

    try {
      await axios.put(`/reports/${id}/verify`, { status, points });
      toast.success(`Report ${status} successfully`);
      fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to verify');
    }
  };

  const exportColumns = [
    { header: 'Date', selector: (row) => new Date(row.createdAt).toLocaleDateString() },
    { header: 'Time', selector: (row) => new Date(row.createdAt).toLocaleTimeString() },
    { header: 'Volunteer Name', selector: (row) => row.volunteer?.name },
    { header: 'Volunteer ID', selector: (row) => row.volunteer?.volunteerId },
    { header: 'Program/Category', selector: (row) => row.category?.name || 'Unknown' },
    { header: 'Description', key: 'description' },
    { header: 'Status', key: 'status' },
    { header: 'Points Awarded', key: 'pointsAwarded' }
  ];

  return (
    <div className="dashboard-content">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Volunteer Daily Reports</h2>
          <p>Review promotion screenshots uploaded by volunteers</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ExportButtons data={reports} columns={exportColumns} filename={`Daily_Reports_${dateFilter}`} />
          <input 
            type="date" 
            value={dateFilter} 
            onChange={(e) => setDateFilter(e.target.value)}
            className="form-group"
            style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', margin: 0 }}
          />
        </div>
      </div>

      <div className="card">
        {loading ? (
          <p>Loading...</p>
        ) : reports.length === 0 ? (
          <p>No reports found for this date.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Volunteer</th>
                  <th>ID</th>
                  <th>Description</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Screenshots</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {reports.map(report => (
                  <tr key={report._id}>
                    <td>{new Date(report.createdAt).toLocaleTimeString()}</td>
                    <td>{report.volunteer?.name}</td>
                    <td>{report.volunteer?.volunteerId}</td>
                    <td>{report.description}</td>
                    <td style={{ textTransform: 'capitalize' }}>{report.category?.name || 'Unknown'}</td>
                    <td>
                      <span className={`badge ${report.status === 'approved' ? 'badge-success' : report.status === 'rejected' ? 'badge-error' : 'badge-warning'}`}>
                        {report.status}
                      </span>
                      {report.pointsAwarded > 0 && <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>+{report.pointsAwarded} Pts</div>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {report.screenshots.map((ss, idx) => (
                          <a 
                            key={idx} 
                            href={`${BASE_URL}${ss}`} 
                          >
                            <img 
                              src={`${BASE_URL}${ss}`} 
                              alt="Proof" 
                              style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ddd' }} 
                            />
                          </a>
                        ))}
                      </div>
                    </td>
                    <td>
                      {report.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => handleVerify(report._id, 'approved', report.category?.defaultPoints)} className="btn btn-primary" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}>Accept</button>
                          <button onClick={() => handleVerify(report._id, 'rejected')} className="btn-outline" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem', color: 'var(--error)', borderColor: 'var(--error)' }}>Reject</button>
                        </div>
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
  );
};

export default Reports;
