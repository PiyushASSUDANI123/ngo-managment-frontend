import { useState, useEffect } from 'react';
import API from '../../api/axios';
import { toast } from 'react-toastify';

const MyTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const { data } = await API.get('/tasks');
      setTasks(data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (taskId, newStatus) => {
    try {
      await API.put(`/tasks/${taskId}`, { status: newStatus });
      toast.success('Task status updated');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'in-progress': return '#3b82f6';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };

  const filteredTasks = tasks.filter((t) => !filterStatus || t.status === filterStatus);

  if (loading) {
    return <div className="page-loader"><div className="loading-spinner"></div></div>;
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h2>My Tasks</h2>
          <p>View and update your assigned tasks</p>
        </div>
      </div>

      <div className="filters-bar">
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <span className="filter-info">
          {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''}
        </span>
      </div>

      <div className="tasks-grid">
        {filteredTasks.length === 0 ? (
          <div className="empty-state">
            <h3>No Tasks</h3>
            <p>{filterStatus ? 'No tasks with this status' : 'No tasks assigned to you yet'}</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div className="task-card" key={task._id}>
              <div className="task-card-header">
                <span className="task-status-dot" style={{ background: getStatusColor(task.status) }}></span>
                <span className="task-status-text" style={{ color: getStatusColor(task.status) }}>
                  {task.status}
                </span>
              </div>
              <h4 className="task-title">{task.title}</h4>
              {task.description && <p className="task-desc">{task.description}</p>}
              {task.notes && (
                <div style={{ background: 'var(--bg-secondary)', padding: '0.5rem', borderRadius: '4px', marginTop: '0.5rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <strong>Notes:</strong> {task.notes}
                </div>
              )}
              {task.dueDate && (
                <p className="task-due">📅 Due: {new Date(task.dueDate).toLocaleDateString('en-IN')}</p>
              )}
              <div className="task-update-status">
                <label>Update Status:</label>
                <select
                  value={task.status}
                  onChange={(e) => handleStatusUpdate(task._id, e.target.value)}
                  className="status-select"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyTasks;
