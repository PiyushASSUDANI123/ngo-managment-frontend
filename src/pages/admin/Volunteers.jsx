import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineSearch, HiOutlineX, HiOutlineKey, HiOutlineEye, HiOutlineUser } from 'react-icons/hi';
import { Link } from 'react-router-dom';
import ExportButtons from '../../components/ExportButtons';

const Volunteers = () => {
  const [volunteers, setVolunteers] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCredentials, setShowCredentials] = useState(null);
  const [editingVolunteer, setEditingVolunteer] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const cardRef = useRef(null);
  const [filterField, setFilterField] = useState('');
  const [formData, setFormData] = useState({
    name: '', email: '', mobile: '', address: '', city: '', state: '', field: ''
  });
  const [photoFile, setPhotoFile] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [volRes, fieldRes] = await Promise.all([
        API.get('/volunteers'),
        API.get('/fields')
      ]);
      setVolunteers(volRes.data);
      setFields(fieldRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key]) fd.append(key, formData[key]);
      });
      if (photoFile) fd.append('photo', photoFile);

      if (editingVolunteer) {
        await API.put(`/volunteers/${editingVolunteer._id}`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Volunteer updated');
      } else {
        const { data } = await API.post('/volunteers', fd, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Volunteer created');
        setShowCredentials({
          ...data.credentials,
          name: data.volunteer.name,
          field: data.volunteer.field?.name || 'Volunteer'
        });
      }
      setShowModal(false);
      setEditingVolunteer(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (vol) => {
    setEditingVolunteer(vol);
    setFormData({
      name: vol.name,
      email: vol.email || '',
      mobile: vol.mobile,
      address: vol.address || '',
      city: vol.city || '',
      state: vol.state || '',
      field: vol.field?._id || ''
    });
    setPhotoFile(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this volunteer?')) return;
    try {
      await API.delete(`/volunteers/${id}`);
      toast.success('Volunteer deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete volunteer');
    }
  };

  const handleResetPassword = async (vol) => {
    if (!window.confirm(`Reset password for ${vol.name}?`)) return;
    try {
      const { data } = await API.put(`/volunteers/${vol._id}/reset-password`, {});
      toast.success(`Password reset! New password: ${data.newPassword}`);
      setShowCredentials({ 
        volunteerId: vol.volunteerId, 
        password: data.newPassword,
        name: vol.name,
        field: vol.field?.name || 'Volunteer'
      });
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const handleViewCredentials = (vol) => {
    setShowCredentials({ 
      volunteerId: vol.volunteerId, 
      password: vol.plainPassword || '(Old Encrypted Password - Please Reset)',
      name: vol.name,
      field: vol.field?.name || 'Volunteer'
    });
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', mobile: '', address: '', city: '', state: '', field: '' });
    setPhotoFile(null);
  };

  const openAddModal = () => {
    setEditingVolunteer(null);
    resetForm();
    setShowModal(true);
  };

  const exportColumns = [
    { header: 'Volunteer ID', key: 'volunteerId' },
    { header: 'Name', key: 'name' },
    { header: 'Email', key: 'email' },
    { header: 'Mobile', key: 'mobile' },
    { header: 'Field', selector: (row) => row.field?.name || 'N/A' },
    { header: 'City', key: 'city' },
    { header: 'State', key: 'state' },
    { header: 'Joined', selector: (row) => new Date(row.createdAt).toLocaleDateString() }
  ];

  const filteredVolunteers = volunteers.filter((vol) => {
    const matchesSearch = vol.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vol.volunteerId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vol.mobile.includes(searchTerm);
    const matchesField = !filterField || vol.field?._id === filterField;
    return matchesSearch && matchesField;
  });

  if (loading) {
    return <div className="page-loader"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Volunteers</h2>
          <p>Manage all volunteers in your organization</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ExportButtons data={filteredVolunteers} columns={exportColumns} filename="Volunteers_List" />
          <button className="btn btn-primary" onClick={openAddModal}>
            <HiOutlinePlus /> Add Volunteer
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="filters-bar">
        <div className="search-box">
          <HiOutlineSearch />
          <input
            type="text"
            placeholder="Search by name, ID, or mobile..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterField}
          onChange={(e) => setFilterField(e.target.value)}
          className="filter-select"
        >
          <option value="">All Fields</option>
          {fields.map((f) => (
            <option key={f._id} value={f._id}>{f.name}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="table-container">
        {filteredVolunteers.length === 0 ? (
          <div className="empty-state">
            <h3>No Volunteers Found</h3>
            <p>{searchTerm || filterField ? 'Try adjusting your filters' : 'Add your first volunteer'}</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Volunteer</th>
                <th>ID</th>
                <th>Mobile</th>
                <th>Field</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredVolunteers.map((vol) => (
                <tr key={vol._id}>
                  <td>
                    <div className="user-cell">
                      {vol.photo ? (
                        <img src={vol.photo} alt={vol.name} className="table-avatar" />
                      ) : (
                        <div className="table-avatar-placeholder">{vol.name.charAt(0)}</div>
                      )}
                      <div>
                        <p className="cell-name">{vol.name}</p>
                        <p className="cell-sub">{vol.email}</p>
                      </div>
                    </div>
                  </td>
                  <td><span className="badge">{vol.volunteerId}</span></td>
                  <td>{vol.mobile}</td>
                  <td>{vol.field?.name || '-'}</td>
                  <td>
                    <span className={`status-badge ${vol.status}`}>{vol.status}</span>
                  </td>
                  <td>
                    <div className="action-btns">
                      <Link to={`/admin/volunteers/${vol._id}`} className="icon-btn" title="View Full Profile" style={{color: '#0ea5e9'}}>
                        <HiOutlineUser />
                      </Link>
                      <button className="icon-btn edit" onClick={() => handleEdit(vol)} title="Edit">
                        <HiOutlinePencil />
                      </button>
                      <button className="icon-btn" onClick={() => handleViewCredentials(vol)} title="View ID & Default Pass" style={{color: '#3b82f6'}}>
                        <HiOutlineEye />
                      </button>
                      <button className="icon-btn" onClick={() => handleResetPassword(vol)} title="Reset Password" style={{color: '#7c3aed'}}>
                        <HiOutlineKey />
                      </button>
                      <button className="icon-btn delete" onClick={() => handleDelete(vol._id)} title="Delete">
                        <HiOutlineTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingVolunteer ? 'Edit Volunteer' : 'Add New Volunteer'}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input type="text" placeholder="Enter full name" value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Mobile Number *</label>
                  <input type="text" placeholder="Enter mobile number" value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="Enter email" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Field / Category *</label>
                  <select value={formData.field}
                    onChange={(e) => setFormData({ ...formData, field: e.target.value })} required>
                    <option value="">Select Field</option>
                    {fields.map((f) => (
                      <option key={f._id} value={f._id}>{f.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" placeholder="Enter address" value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" placeholder="Enter city" value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" placeholder="Enter state" value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Photo</label>
                <input type="file" accept="image/*"
                  onChange={(e) => setPhotoFile(e.target.files[0])} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingVolunteer ? 'Update' : 'Create Volunteer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credentials Modal */}
      {showCredentials && (
        <div className="modal-overlay" onClick={() => setShowCredentials(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>🎉 Volunteer Credentials</h3>
              <button className="icon-btn" onClick={() => setShowCredentials(null)}><HiOutlineX /></button>
            </div>
            <div className="credentials-display">
              {/* This is the printable ID Card */}
              <div 
                ref={cardRef} 
                style={{
                  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
                  padding: '1.5rem',
                  borderRadius: '12px',
                  color: '#1e293b',
                  marginBottom: '1rem',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  position: 'relative',
                  overflow: 'hidden',
                  border: '1px solid #cbd5e1'
                }}
              >
                {/* Background pattern */}
                <div style={{ position: 'absolute', top: '-50%', left: '-50%', width: '200%', height: '200%', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.05) 0%, transparent 60%)', pointerEvents: 'none' }}></div>
                
                <h4 style={{ margin: '0 0 1rem 0', color: '#0369a1', fontSize: '1.2rem', textAlign: 'center', borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '0.5rem', fontWeight: 'bold' }}>
                  EnVision NGO
                </h4>
                
                <div style={{ display: 'grid', gap: '0.6rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#475569', fontSize: '0.85rem' }}>Name</span>
                    <span style={{ fontWeight: '700' }}>{showCredentials.name}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#475569', fontSize: '0.85rem' }}>Field</span>
                    <span style={{ fontWeight: '600', color: '#0284c7' }}>{showCredentials.field}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem', paddingTop: '0.5rem', borderTop: '1px solid rgba(0,0,0,0.1)' }}>
                    <span style={{ color: '#475569', fontSize: '0.85rem' }}>Volunteer ID</span>
                    <span style={{ fontWeight: '700', letterSpacing: '0.5px' }}>{showCredentials.volunteerId}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#475569', fontSize: '0.85rem' }}>Password</span>
                    <span style={{ fontFamily: 'monospace', background: 'rgba(0,0,0,0.05)', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{showCredentials.password}</span>
                  </div>
                </div>
                
                <div style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.75rem', color: '#ef4444', fontWeight: '600' }}>
                  ⚠️ Please change your password ASAP after login.
                </div>
              </div>
              <p className="credential-note">⚠️ Please save these credentials. The password cannot be viewed again.</p>
            </div>
            <div className="modal-actions" style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
              <button 
                className="btn btn-secondary" 
                onClick={async () => {
                  if (cardRef.current) {
                    const canvas = await html2canvas(cardRef.current, { scale: 3, backgroundColor: null });
                    const link = document.createElement('a');
                    link.download = `EnVision-ID-${showCredentials.volunteerId}.png`;
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                  }
                }}
              >
                Download Card
              </button>
              <button className="btn btn-primary" onClick={() => setShowCredentials(null)}>Got it!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Volunteers;
