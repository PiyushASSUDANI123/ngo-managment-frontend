import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { HiOutlinePlus, HiOutlineTrash } from 'react-icons/hi';
import ExportButtons from '../../components/ExportButtons';

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '', date: '', description: '', attendance: []
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [meetRes, volRes] = await Promise.all([
        API.get('/meetings'),
        API.get('/volunteers')
      ]);
      setMeetings(meetRes.data);
      // Filter out inactive volunteers for attendance list
      setVolunteers(volRes.data.filter(v => v.status === 'active'));
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = () => {
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      attendance: volunteers.map(v => ({ volunteer: v, status: 'Absent' }))
    });
    setShowModal(true);
  };

  const handleAttendanceChange = (volunteerId, status) => {
    setFormData(prev => ({
      ...prev,
      attendance: prev.attendance.map(a => 
        a.volunteer._id === volunteerId ? { ...a, status } : a
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        date: formData.date,
        description: formData.description,
        attendance: formData.attendance.map(a => ({ volunteer: a.volunteer._id, status: a.status }))
      };
      await API.post('/meetings', payload);
      toast.success('Meeting attendance recorded successfully');
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to record meeting');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this meeting record?')) return;
    try {
      await API.delete(`/meetings/${id}`);
      toast.success('Meeting deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete meeting');
    }
  };

  const exportColumns = [
    { header: 'Meeting Title', key: 'title' },
    { header: 'Date', selector: (row) => new Date(row.date).toLocaleDateString() },
    { header: 'Description', key: 'description' },
    { header: 'Total Present', selector: (row) => row.attendance.filter(a => a.status === 'Present').length },
    { header: 'Total Absent', selector: (row) => row.attendance.filter(a => a.status === 'Absent').length }
  ];

  if (loading) return <div className="page-loader"><div className="loading-spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Meetings & Attendance</h2>
          <p>Track volunteer attendance for meetings and events</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ExportButtons data={meetings} columns={exportColumns} filename="Meetings_Attendance" />
          <button className="btn btn-primary" onClick={handleOpenModal}>
            <HiOutlinePlus /> Record Meeting
          </button>
        </div>
      </div>

      <div className="card">
        {meetings.length === 0 ? (
          <p className="empty-message">No meetings recorded yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {meetings.map((meet) => {
                  const present = meet.attendance.filter(a => a.status === 'Present').length;
                  const absent = meet.attendance.filter(a => a.status === 'Absent').length;
                  return (
                    <tr key={meet._id}>
                      <td style={{ fontWeight: '600' }}>{meet.title}</td>
                      <td>{new Date(meet.date).toLocaleDateString()}</td>
                      <td><span className="status-badge status-active">{present} Present</span></td>
                      <td><span className="status-badge status-inactive">{absent} Absent</span></td>
                      <td>
                        <button className="icon-btn" style={{color: '#ef4444'}} onClick={() => handleDelete(meet._id)} title="Delete Meeting">
                          <HiOutlineTrash />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>Record Meeting Attendance</h3>
              <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <div className="form-group" style={{ flex: 2 }}>
                  <label>Meeting Title *</label>
                  <input type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required placeholder="e.g. Weekly Sync" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label>Date *</label>
                  <input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                </div>
              </div>
              
              <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                <label>Description</label>
                <input type="text" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Optional details..." />
              </div>

              <h4>Mark Attendance</h4>
              <div className="table-responsive" style={{ maxHeight: '350px', overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)' }}>
                <table className="data-table" style={{ margin: 0 }}>
                  <thead style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                    <tr>
                      <th>Volunteer</th>
                      <th>Field</th>
                      <th style={{ textAlign: 'center' }}>Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.attendance.map((record) => (
                      <tr key={record.volunteer._id}>
                        <td>
                          <div style={{ fontWeight: 500 }}>{record.volunteer.name}</div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{record.volunteer.volunteerId}</div>
                        </td>
                        <td>{record.volunteer.field?.name || 'N/A'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
                            <button
                              type="button"
                              onClick={() => handleAttendanceChange(record.volunteer._id, 'Present')}
                              style={{
                                width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                                background: record.status === 'Present' ? '#10b981' : '#e5e7eb',
                                color: record.status === 'Present' ? '#fff' : '#6b7280',
                                fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                              title="Mark Present"
                            >
                              P
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAttendanceChange(record.volunteer._id, 'Absent')}
                              style={{
                                width: '32px', height: '32px', borderRadius: '50%', border: 'none',
                                background: record.status === 'Absent' ? '#ef4444' : '#e5e7eb',
                                color: record.status === 'Absent' ? '#fff' : '#6b7280',
                                fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.2s'
                              }}
                              title="Mark Absent"
                            >
                              A
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="modal-actions" style={{ marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Attendance</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Meetings;
