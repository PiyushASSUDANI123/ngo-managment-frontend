import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineLink } from 'react-icons/hi';
import { BASE_URL } from '../../utils/config';

const Shoutouts = () => {
  const [shoutouts, setShoutouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    donorName: '', amount: '', message: ''
  });
  const [image, setImage] = useState(null);

  useEffect(() => {
    fetchShoutouts();
  }, []);

  const fetchShoutouts = async () => {
    try {
      const { data } = await API.get('/shoutouts');
      setShoutouts(data);
    } catch (error) {
      toast.error('Failed to fetch shoutouts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = new FormData();
      form.append('donorName', formData.donorName);
      form.append('amount', formData.amount);
      form.append('message', formData.message);
      if (image) form.append('image', image);

      await API.post('/shoutouts', form, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success('Shoutout created successfully');
      setShowModal(false);
      setFormData({ donorName: '', amount: '', message: '' });
      setImage(null);
      fetchShoutouts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this shoutout?')) return;
    try {
      await API.delete(`/shoutouts/${id}`);
      toast.success('Shoutout deleted');
      fetchShoutouts();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const copyLink = (slug) => {
    const url = `https://envision.piyushassudani.in/funders/${slug}`; // Update to frontend website URL
    navigator.clipboard.writeText(url);
    toast.info('Personalized link copied to clipboard!');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Funders Shoutout</h1>
          <p className="text-secondary">Manage personalized shoutouts for top donors</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <HiOutlinePlus /> Add Shoutout
        </button>
      </div>

      <div className="table-container">
        {loading ? (
          <div className="empty-state">Loading...</div>
        ) : shoutouts.length === 0 ? (
          <div className="empty-state">
            <h3>No Shoutouts</h3>
            <p>Create a shoutout to feature a donor</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Amount</th>
                <th>Message</th>
                <th>Link</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shoutouts.map((s) => (
                <tr key={s._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      {s.image && <img src={`${BASE_URL}${s.image}`} alt={s.donorName} style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />}
                      <span className="cell-name">{s.donorName}</span>
                    </div>
                  </td>
                  <td><span className="amount-badge">₹{s.amount.toLocaleString('en-IN')}</span></td>
                  <td style={{ maxWidth: '300px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.message || '-'}</td>
                  <td>
                    <button className="btn-outline" onClick={() => copyLink(s.slug)} style={{ padding: '0.3rem 0.6rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <HiOutlineLink /> Copy Link
                    </button>
                  </td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn delete" onClick={() => handleDelete(s._id)} title="Delete">
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

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Shoutout</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Donor Name *</label>
                <input type="text" value={formData.donorName} onChange={(e) => setFormData({ ...formData, donorName: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Amount (₹) *</label>
                <input type="number" min="1" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Personalized Message</label>
                <textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} rows={3} placeholder="Thank you for your generous contribution..." />
              </div>
              <div className="form-group">
                <label>Donor Image (Optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shoutouts;
