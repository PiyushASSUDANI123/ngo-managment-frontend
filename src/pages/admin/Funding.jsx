import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { HiOutlinePlus, HiOutlineDocumentDownload, HiOutlinePencil, HiOutlineTrash, HiOutlineX, HiOutlineSearch } from 'react-icons/hi';
import ExportButtons from '../../components/ExportButtons';

const Funding = () => {
  const [donations, setDonations] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDonation, setEditingDonation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    donorName: '', email: '', phone: '', address: '', city: '', state: '',
    amount: '', date: new Date().toISOString().split('T')[0], purpose: '', notes: ''
  });

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      const { data } = await API.get('/donations');
      setDonations(data.donations);
      setTotalAmount(data.totalAmount);
    } catch (error) {
      toast.error('Failed to fetch donations');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData, amount: Number(formData.amount) };
      if (editingDonation) {
        await API.put(`/donations/${editingDonation._id}`, payload);
        toast.success('Donation updated');
      } else {
        await API.post('/donations', payload);
        toast.success('Donation recorded');
      }
      setShowModal(false);
      setEditingDonation(null);
      resetForm();
      fetchDonations();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (donation) => {
    setEditingDonation(donation);
    setFormData({
      donorName: donation.donorName,
      email: donation.email || '',
      phone: donation.phone || '',
      address: donation.address || '',
      city: donation.city || '',
      state: donation.state || '',
      amount: donation.amount.toString(),
      date: donation.date ? donation.date.split('T')[0] : '',
      purpose: donation.purpose || '',
      notes: donation.notes || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this donation record?')) return;
    try {
      await API.delete(`/donations/${id}`);
      toast.success('Donation deleted');
      fetchDonations();
    } catch (error) {
      toast.error('Failed to delete');
    }
  };

  const handleCertificate = async (id) => {
    try {
      const res = await API.get(`/donations/${id}/certificate`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `EnVision-Certificate-${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  const exportColumns = [
    { header: 'Donor Name', key: 'donorName' },
    { header: 'Email', key: 'email' },
    { header: 'Phone', key: 'phone' },
    { header: 'Amount', key: 'amount' },
    { header: 'Date', selector: (row) => new Date(row.date).toLocaleDateString() },
    { header: 'City', key: 'city' },
    { header: 'Purpose', key: 'purpose' }
  ];

  const resetForm = () => {
    setFormData({
      donorName: '', email: '', phone: '', address: '', city: '', state: '',
      amount: '', date: new Date().toISOString().split('T')[0], purpose: '', notes: ''
    });
  };

  const filteredDonations = donations.filter((d) =>
    d.donorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (d.email && d.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.phone && d.phone.includes(searchTerm))
  );

  if (loading) {
    return <div className="page-loader"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Funding / Donations</h2>
          <p>Track donations and generate certificates</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <ExportButtons data={filteredDonations} columns={exportColumns} filename="EnVision_Donations" />
          <button className="btn btn-primary" onClick={() => { resetForm(); setEditingDonation(null); setShowModal(true); }}>
            <HiOutlinePlus /> Add Donation
          </button>
        </div>
      </div>

      {/* Total Funding Card */}
      <div className="funding-summary">
        <div className="funding-card">
          <h3>Total Funding Received</h3>
          <p className="funding-amount">₹{totalAmount.toLocaleString('en-IN')}</p>
          <span>{donations.length} donations recorded</span>
        </div>
      </div>

      <div className="filters-bar">
        <div className="search-box">
          <HiOutlineSearch />
          <input type="text" placeholder="Search by donor name, email, or phone..."
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className="table-container">
        {filteredDonations.length === 0 ? (
          <div className="empty-state">
            <h3>No Donations Found</h3>
            <p>Record your first donation</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Contact</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date</th>
                <th>Purpose</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDonations.map((d) => (
                <tr key={d._id}>
                  <td>
                    <p className="cell-name">{d.donorName}</p>
                    <p className="cell-sub">{[d.city, d.state].filter(Boolean).join(', ')}</p>
                  </td>
                  <td>
                    <p className="cell-sub">{d.phone || '-'}</p>
                    <p className="cell-sub">{d.email || '-'}</p>
                  </td>
                  <td><span className="amount-badge">₹{d.amount.toLocaleString('en-IN')}</span></td>
                  <td>
                    <span style={{
                      padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                      background: d.status === 'completed' ? '#D1FAE5' : (d.status === 'partial' ? '#FEF3C7' : '#F3F4F6'),
                      color: d.status === 'completed' ? '#065F46' : (d.status === 'partial' ? '#92400E' : '#374151')
                    }}>
                      {d.status ? d.status.toUpperCase() : 'COMPLETED'}
                    </span>
                  </td>
                  <td>{new Date(d.date).toLocaleDateString('en-IN')}</td>
                  <td>{d.purpose || '-'}</td>
                  <td>
                    <div className="action-btns">
                      <button className="icon-btn" style={{color: '#059669'}} onClick={() => handleCertificate(d._id)} title="Download Certificate">
                        <HiOutlineDocumentDownload />
                      </button>
                      <button className="icon-btn edit" onClick={() => handleEdit(d)} title="Edit">
                        <HiOutlinePencil />
                      </button>
                      <button className="icon-btn delete" onClick={() => handleDelete(d._id)} title="Delete">
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
          <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingDonation ? 'Edit Donation' : 'Record New Donation'}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Donor Name *</label>
                  <input type="text" placeholder="Full name" value={formData.donorName}
                    onChange={(e) => setFormData({ ...formData, donorName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Amount (₹) *</label>
                  <input type="number" min="1" placeholder="Donation amount" value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input type="email" placeholder="Email address" value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Phone</label>
                  <input type="text" placeholder="Phone number" value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Address</label>
                <input type="text" placeholder="Full address" value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City</label>
                  <input type="text" placeholder="City" value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>State</label>
                  <input type="text" placeholder="State" value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Purpose</label>
                  <input type="text" placeholder="Donation purpose" value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea placeholder="Additional notes..." value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })} rows={2} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingDonation ? 'Update' : 'Record Donation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Funding;
