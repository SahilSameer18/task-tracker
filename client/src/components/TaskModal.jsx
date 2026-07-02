import { useState, useEffect } from 'react';
import { X, Calendar, Type, FileText, CheckCircle } from 'lucide-react';
import './TaskModal.css';

const TaskModal = ({ task, isOpen, onClose, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Pending');
  const [dueDate, setDueDate] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'Pending');
      // Format ISO Date to YYYY-MM-DD for native HTML date input
      if (task.dueDate) {
        setDueDate(new Date(task.dueDate).toISOString().split('T')[0]);
      } else {
        setDueDate('');
      }
    } else {
      setTitle('');
      setDescription('');
      setStatus('Pending');
      setDueDate('');
    }
    setError('');
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        status,
        dueDate: dueDate && dueDate.trim() ? new Date(dueDate).toISOString() : null
      };

      await onSubmit(taskData);
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container glass" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{task ? 'Edit Task' : 'Create Task'}</h2>
          <button className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {error && <div className="modal-error-banner">{error}</div>}

          {/* Title Field */}
          <div className="modal-group">
            <label htmlFor="modal-title">
              <Type size={16} />
              Task Title *
            </label>
            <input
              id="modal-title"
              type="text"
              placeholder="e.g. Design Landing Page"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (error) setError('');
              }}
              className={error ? 'input-error' : ''}
              maxLength={80}
            />
          </div>

          {/* Description Field */}
          <div className="modal-group">
            <label htmlFor="modal-desc">
              <FileText size={16} />
              Description
            </label>
            <textarea
              id="modal-desc"
              rows={4}
              placeholder="Provide a detailed description of what needs to be done..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
            />
          </div>

          <div className="modal-grid">
            {/* Status Field */}
            <div className="modal-group">
              <label htmlFor="modal-status">
                <CheckCircle size={16} />
                Status
              </label>
              <select
                id="modal-status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            {/* Due Date Field */}
            <div className="modal-group">
              <label htmlFor="modal-date">
                <Calendar size={16} />
                Due Date
              </label>
              <input
                id="modal-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="cancel-btn" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : (
                task ? 'Save Changes' : 'Create Task'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
