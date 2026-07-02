import { Calendar, AlertTriangle, Edit, Trash2, CheckCircle2 } from 'lucide-react';
import './TaskCard.css';

const TaskCard = ({ task, onEdit, onDelete, onStatusToggle }) => {
  const { _id, title, description, status, dueDate } = task;

  const isCompleted = status === 'Completed';

  // Check if overdue
  const isOverdue = (() => {
    if (!dueDate || isCompleted) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(dueDate) < today;
  })();

  const formatDueDate = (dateStr) => {
    if (!dateStr) return 'No due date';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getStatusBadgeClass = () => {
    switch (status) {
      case 'Completed':
        return 'badge-completed';
      case 'In Progress':
        return 'badge-in-progress';
      case 'Pending':
      default:
        return 'badge-pending';
    }
  };

  return (
    <div className={`task-card glass ${isCompleted ? 'task-completed' : ''} ${isOverdue ? 'task-overdue' : ''}`}>
      <div className="task-card-header">
        <button 
          onClick={() => onStatusToggle(task)}
          className={`status-checkbox ${isCompleted ? 'checked' : ''}`}
          title={isCompleted ? 'Mark Active' : 'Mark Completed'}
        >
          {isCompleted && <CheckCircle2 size={20} className="check-icon" />}
        </button>
        
        <h3 className="task-title" title={title}>{title}</h3>
        
        <span className={`status-badge ${getStatusBadgeClass()}`}>
          {status}
        </span>
      </div>

      <div className="task-card-body">
        <p className="task-desc">
          {description || <span className="no-desc">No description provided</span>}
        </p>
      </div>

      <div className="task-card-footer">
        <div className="task-date-wrapper">
          <Calendar size={14} className="date-icon" />
          <span className={`task-date ${isOverdue ? 'date-overdue' : ''}`}>
            {formatDueDate(dueDate)}
          </span>
          {isOverdue && (
            <span className="overdue-tag">
              <AlertTriangle size={12} />
              Overdue
            </span>
          )}
        </div>

        <div className="task-actions">
          <button 
            onClick={() => onEdit(task)} 
            className="action-btn edit-btn" 
            title="Edit Task"
          >
            <Edit size={16} />
          </button>
          <button 
            onClick={() => onDelete(_id)} 
            className="action-btn delete-btn" 
            title="Delete Task"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskCard;
