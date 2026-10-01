import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineFilter } from 'react-icons/hi';
import ExportButtons from '../../components/ExportButtons';

const Points = () => {
  const [points, setPoints] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [filterVolunteer, setFilterVolunteer] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('');
  const [filterEndDate, setFilterEndDate] = useState('');
  const [formData, setFormData] = useState({
    volunteer: '', category: '', points: '', date: new Date().toISOString().split('T')[0], remarks: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [pointsRes, volRes, catRes] = await Promise.all([
        API.get('/points'),
        API.get('/volunteers'),
        API.get('/points-categories')
      ]);
      setPoints(pointsRes.data);
      setVolunteers(volRes.data);
      setCategories(catRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const fetchFilteredPoints = async () => {
    try {
      const params = new URLSearchParams();
      if (filterVolunteer) params.append('volunteer', filterVolunteer);
      if (filterCategory) params.append('category', filterCategory);
      if (filterStartDate) params.append('startDate', filterStartDate);
      if (filterEndDate) params.append('endDate', filterEndDate);
      const { data } = await API.get(`/points?${params.toString()}`);
      setPoints(data);
    } catch (error) {
      toast.error('Failed to filter points');
    }
  };

  useEffect(() => {
    if (!loading) fetchFilteredPoints();
  }, [filterVolunteer, filterCategory, filterStartDate, filterEndDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post('/points', { ...formData, points: Number(formData.points) });
      toast.success('Points assigned successfully');
      setShowForm(false);
      setFormData({ volunteer: '', category: '', points: '', date: new Date().toISOString().split('T')[0], remarks: '' });
      fetchFilteredPoints();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign points');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this points entry?')) return;
    try {
      await API.delete(`/points/${id}`);
      toast.success('Points entry deleted');
      fetchFilteredPoints();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const exportColumns = [
    { header: 'Date', selector: (row) => new Date(row.date).toLocaleDateString() },
    { header: 'Volunteer Name', selector: (row) => row.volunteer?.name },
    { header: 'Volunteer ID', selector: (row) => row.volunteer?.volunteerId },
    { header: 'Program/Category', selector: (row) => row.category?.name || 'N/A' },
    { header: 'Points', key: 'points' },
    { header: 'Remarks', key: 'remarks' }
  ];

  if (loading) {
    return <div className="page-loader"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Points Management</h2>
          <p>Assign and track volunteer points by field and date</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ExportButtons data={points} columns={exportColumns} filename="Volunteer_Points" />
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            <HiOutlinePlus /> Assign Points
          </button>
        </div>
      </div>

      {/* Assign Points Form */}
      {showForm && (
        <div className="inline-form-card">
          <h3>Assign Points</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Volunteer *</label>
                <select value={formData.volunteer}
                  onChange={(e) => setFormData({ ...formData, volunteer: e.target.value })} required>
                  <option value="">Select Volunteer</option>
                  {volunteers.map((v) => (
                    <option key={v._id} value={v._id}>{v.name} ({v.volunteerId})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Task Category *</label>
                <select value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                  <option value="">Select Category</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Points *</label>
                <input type="number" min="0" placeholder="Enter points" value={formData.points}
                  onChange={(e) => setFormData({ ...formData, points: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input type="date" value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
              </div>
            </div>
            <div className="form-group">
              <label>Remarks</label>
              <input type="text" placeholder="Any remarks..." value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })} />
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Assign Points</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="filters-bar">
        <div className="filter-group">
          <HiOutlineFilter />
          <select value={filterVolunteer} onChange={(e) => setFilterVolunteer(e.target.value)}>
            <option value="">All Volunteers</option>
            {volunteers.map((v) => (
              <option key={v._id} value={v._id}>{v.name}</option>
            ))}
          </select>
        </div>
        <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="filter-select">
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.name}</option>
          ))}
        </select>
        <input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)}
          className="filter-date" placeholder="From" />
        <input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)}
          className="filter-date" placeholder="To" />
      </div>

      {/* Points Table */}
      <div className="table-container">
        {points.length === 0 ? (
          <div className="empty-state">
            <h3>No Points Records</h3>
            <p>Start assigning points to volunteers</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Volunteer</th>
                <th>Category</th>
                <th>Points</th>
                <th>Date</th>
                <th>Remarks</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {points.map((p) => (
                <tr key={p._id}>
                  <td>
                    <p className="cell-name">{p.volunteer?.name}</p>
                    <p className="cell-sub">{p.volunteer?.volunteerId}</p>
                  </td>
                  <td><span className="badge">{p.category?.name || '-'}</span></td>
                  <td><span className="points-badge">{p.points}</span></td>
                  <td>{new Date(p.date).toLocaleDateString('en-IN')}</td>
                  <td>{p.remarks || '-'}</td>
                  <td>
                    <button className="icon-btn delete" onClick={() => handleDelete(p._id)}>
                      <HiOutlineTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Points;
