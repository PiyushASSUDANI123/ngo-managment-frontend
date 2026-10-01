import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

const Fields = () => {
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    try {
      const { data } = await API.get('/fields');
      setFields(data);
    } catch (error) {
      toast.error('Failed to fetch fields');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingField) {
        await API.put(`/fields/${editingField._id}`, formData);
        toast.success('Field updated successfully');
      } else {
        await API.post('/fields', formData);
        toast.success('Field created successfully');
      }
      setShowModal(false);
      setEditingField(null);
      setFormData({ name: '', description: '' });
      fetchFields();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setFormData({ name: field.name, description: field.description });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this field?')) return;
    try {
      await API.delete(`/fields/${id}`);
      toast.success('Field deleted');
      fetchFields();
    } catch (error) {
      toast.error('Failed to delete field');
    }
  };

  const openAddModal = () => {
    setEditingField(null);
    setFormData({ name: '', description: '' });
    setShowModal(true);
  };

  if (loading) {
    return <div className="page-loader"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Fields / Categories</h2>
          <p>Manage volunteer fields and categories</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <HiOutlinePlus /> Add Field
        </button>
      </div>

      <div className="cards-grid">
        {fields.length === 0 ? (
          <div className="empty-state">
            <h3>No Fields Yet</h3>
            <p>Create your first field to categorize volunteers</p>
            <button className="btn btn-primary" onClick={openAddModal}>
              <HiOutlinePlus /> Add Field
            </button>
          </div>
        ) : (
          fields.map((field) => (
            <div className="field-card" key={field._id}>
              <div className="field-card-header">
                <h3>{field.name}</h3>
                <div className="field-actions">
                  <button className="icon-btn edit" onClick={() => handleEdit(field)} title="Edit">
                    <HiOutlinePencil />
                  </button>
                  <button className="icon-btn delete" onClick={() => handleDelete(field._id)} title="Delete">
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
              <p className="field-desc">{field.description || 'No description'}</p>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingField ? 'Edit Field' : 'Add New Field'}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}>
                <HiOutlineX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Field Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Education, Healthcare"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Brief description of the field"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingField ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Fields;
