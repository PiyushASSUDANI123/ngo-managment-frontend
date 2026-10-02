import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import API from '../../api/axios';
import { toast } from 'react-toastify';

const MyPoints = () => {
  const { user } = useAuth();
  const [points, setPoints] = useState([]);
  const [summary, setSummary] = useState({ summary: [], totalPoints: 0 });
  const [loading, setLoading] = useState(true);
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pointsRes, summaryRes] = await Promise.all([
        API.get('/points'),
        API.get(`/points/summary/${user._id}`)
      ]);
      setPoints(pointsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      toast.error('Failed to fetch points');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) fetchFilteredPoints();
  }, [filterStartDate, filterEndDate]);

  const fetchFilteredPoints = async () => {
    try {
      const params = new URLSearchParams();
      if (filterStartDate) params.append('startDate', filterStartDate);
      if (filterEndDate) params.append('endDate', filterEndDate);
      const { data } = await API.get(`/points?${params.toString()}`);
      setPoints(data);
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return <div className="page-loader"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>My Points</h2>
          <p>View your earned points across all fields</p>
        </div>
        <div className="total-points-badge">
          ⭐ Total: <strong>{summary.totalPoints}</strong> points
        </div>
      </div>

      {/* Points Summary Cards */}
      <div className="points-cards-grid">
        {summary.summary.map((s, i) => (
          <div className="points-summary-card" key={i}>
            <h4>{s.field}</h4>
            <p className="points-big">{s.totalPoints}</p>
            <span>{s.count} entries</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)}
          className="filter-date" />
        <span>to</span>
        <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)}
          className="filter-date" />
        {(filterStartDate || filterEndDate) && (
          <button className="btn btn-secondary btn-sm" onClick={() => { setFilterStartDate(''); setFilterEndDate(''); }}>
            Clear
          </button>
        )}
      </div>

      {/* Points History */}
      <div className="table-container">
        {points.length === 0 ? (
          <div className="empty-state">
            <h3>No Points Records</h3>
            <p>You haven't earned any points yet</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Field</th>
                <th>Points</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p._id}>
                  <td>{new Date(p.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                  <td><span className="badge badge-primary" style={{textTransform: 'capitalize'}}>{p.category?.name || 'Task'}</span></td>
                  <td><span className="points-badge">{p.points}</span></td>
                  <td>{p.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyPoints;
