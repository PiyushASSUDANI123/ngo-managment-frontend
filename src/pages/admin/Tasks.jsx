import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineX } from 'react-icons/hi';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterVolunteer, setFilterVolunteer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [formData, setFormData] = useState({
    volunteer: '', title: '', description: '', dueDate: '', status: 'pending'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, volRes] = await Promise.all([
        API.get('/tasks'),
        API.get('/volunteers')
      ]);
      setTasks(tasksRes.data);
      setVolunteers(volRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTask) {
        await API.put(`/tasks/${editingTask._id}`, formData);
        toast.success('Task updated');
      } else {
        await API.post('/tasks', formData);
        toast.success('Task created');
      }
      setShowModal(false);
      setEditingTask(null);
      resetForm();
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      volunteer: task.volunteer?._id || '',
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
      status: task.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this task?')) return;
    try {
      await API.delete(`/tasks/${id}`);
      toast.success('Task deleted');
      fetchData();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const resetForm = () => {
    setFormData({ volunteer: '', title: '', description: '', dueDate: '', status: 'pending' });
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesVol = !filterVolunteer || t.volunteer?._id === filterVolunteer;
    const matchesStatus = !filterStatus || t.status === filterStatus;
    return matchesVol && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in-progress': return '#3b82f6';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  if (loading) {
    return <div className="page-loader"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>Task Management</h2>
          <p>Assign and track tasks for volunteers</p>
        </div>
        <button className="btn btn-primary" onClick={() => { resetForm(); setEditingTask(null); setShowModal(true); }}>
          <HiOutlinePlus /> Add Task
        </button>
      </div>

      <div className="filters-bar">
        <select value={filterVolunteer} onChange={(e) => setFilterVolunteer(e.target.value)} className="filter-select">
          <option value="">All Volunteers</option>
          {volunteers.map((v) => (
            <option key={v._id} value={v._id}>{v.name}</option>
          ))}
        </select>
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="tasks-grid">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <h3>No Tasks Found</h3>
            <p>Create tasks and assign them to volunteers</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div className="task-card" key={task._id}>
              <div className="task-card-header">
                <span className="task-status-dot" style={{ background: getStatusColor(task.status) }}></span>
                <span className="task-status-text" style={{ color: getStatusColor(task.status) }}>
                  {task.status}
                </span>
                <div className="task-actions">
                  <button className="icon-btn edit" onClick={() => handleEdit(task)}><HiOutlinePencil /></button>
                  <button className="icon-btn delete" onClick={() => handleDelete(task._id)}><HiOutlineTrash /></button>
                </div>
              </div>
              <h4 className="task-title">{task.title}</h4>
              {task.description && <p className="task-desc">{task.description}</p>}
              <div className="task-meta">
                <span className="task-assignee">👤 {task.volunteer?.name} ({task.volunteer?.volunteerId})</span>
                {task.dueDate && (
                  <span className="task-due">📅 {new Date(task.dueDate).toLocaleDateString('en-IN')}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingTask ? 'Edit Task' : 'Add New Task'}</h3>
              <button className="icon-btn" onClick={() => setShowModal(false)}><HiOutlineX /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
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
                <label>Task Title *</label>
                <input type="text" placeholder="Enter task title" value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea placeholder="Task description..." value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Due Date</label>
                  <input type="date" value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                </div>
                {editingTask && (
                  <div className="form-group">
                    <label>Status</label>
                    <select value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">
                  {editingTask ? 'Update' : 'Create Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Tasks;
