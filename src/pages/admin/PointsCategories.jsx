import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

const PointsCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', defaultPoints: 0 });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const { data } = await API.get('/points-categories');
      setCategories(data);
    } catch (error) {
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await API.put(`/points-categories/${editingCategory._id}`, formData);
        toast.success('Category updated successfully');
      } else {
        await API.post('/points-categories', formData);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      setEditingCategory(null);
      setFormData({ name: '', description: '', defaultPoints: 0 });
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({ name: category.name, description: category.description, defaultPoints: category.defaultPoints || 0 });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await API.delete(`/points-categories/${id}`);
      toast.success('Category deleted');
      fetchCategories();
    } catch (error) {
      toast.error('Failed to delete category');
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
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
          <h2>Points Categories</h2>
          <p>Manage task categories for which volunteers earn points</p>
        </div>
        <button className="btn btn-primary" onClick={openAddModal}>
          <HiOutlinePlus /> Add Category
        </button>
      </div>

      <div className="cards-grid">
        {categories.length === 0 ? (
          <div className="empty-state">
            <h3>No Categories Yet</h3>
            <p>Create your first category to assign points</p>
            <button className="btn btn-primary" onClick={openAddModal}>
              <HiOutlinePlus /> Add Category
            </button>
          </div>
        ) : (
          categories.map((category) => (
            <div className="field-card" key={category._id}>
              <div className="field-card-header">
                <h3>{category.name} <span className="points-badge" style={{fontSize: '0.8rem', marginLeft: '0.5rem'}}>{category.defaultPoints} pts</span></h3>
                <div className="field-actions">
                  <button className="icon-btn edit" onClick={() => handleEdit(category)} title="Edit">
                    <HiOutlinePencil />
                  </button>
                  <button className="icon-btn delete" onClick={() => handleDelete(category._id)} title="Delete">
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
              <p className="field-desc">{category.description || 'No description'}</p>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}>
                <HiOutlineX />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Daily Spam, Referrals"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Default Points *</label>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  value={formData.defaultPoints}
                  onChange={(e) => setFormData({ ...formData, defaultPoints: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Brief description"
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
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PointsCategories;
