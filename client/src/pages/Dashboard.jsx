import { useState } from 'react';
import { useTasks } from '../context/TasksContext';
import { useAuth } from '../context/AuthContext';
import Sidebar from '../components/Sidebar';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { Plus, Search, SlidersHorizontal, Inbox, ClipboardList, CheckCircle, Clock } from 'lucide-react';
import './Dashboard.css';

const Dashboard = ({ triggerToast }) => {
  const { user } = useAuth();
  const {
    tasks,
    loading,
    page,
    setPage,
    hasMore,
    filterStatus,
    searchTerm,
    setSearchTerm,
    sortBy,
    setSortBy,
    stats,
    addTask,
    editTask,
    removeTask
  } = useTasks();

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const handleOpenAddModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (taskData) => {
    try {
      if (selectedTask) {
        // Edit mode
        await editTask(selectedTask._id, taskData);
        triggerToast('Task updated successfully!', 'success');
      } else {
        // Create mode
        await addTask(taskData);
        triggerToast('Task created successfully!', 'success');
      }
    } catch (err) {
      triggerToast(err.message || 'Failed to save task', 'error');
      throw err; // propagates to let the modal keep loading state if failed
    }
  };

  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await removeTask(id);
        triggerToast('Task deleted successfully', 'info');
      } catch (err) {
        triggerToast(err.message || 'Failed to delete task', 'error');
      }
    }
  };

  const handleStatusToggle = async (task) => {
    try {
      const newStatus = task.status === 'Completed' ? 'In Progress' : 'Completed';
      await editTask(task._id, { ...task, status: newStatus });
      triggerToast(`Task marked as ${newStatus}`, 'success');
    } catch (err) {
      triggerToast(err.message || 'Failed to update status', 'error');
    }
  };

  // Helper for greeting text
  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Pane */}
      <main className="dashboard-content">
        {/* Top bar header */}
        <header className="content-header">
          <div className="header-welcome">
            <h1 className={loading ? 'skeleton-text' : ''}>{getGreeting()}, {user?.name.split(' ')[0]}</h1>
            <p className={loading ? 'skeleton-text' : ''}>Here is an overview of your tasks for today.</p>
          </div>
          <button onClick={handleOpenAddModal} className="add-task-btn">
            <Plus size={18} />
            <span>Add Task</span>
          </button>
        </header>

        {/* Dynamic Analytics Metric Row */}
        <section className="metrics-row">
          <div className="metric-card glass">
            <div className="metric-icon-wrapper total">
              <ClipboardList size={20} />
            </div>
            <div className="metric-info">
              <h3>Total Tasks</h3>
              <p className={`metric-num ${loading ? 'skeleton-text' : ''}`}>{stats.total}</p>
            </div>
          </div>

          <div className="metric-card glass">
            <div className="metric-icon-wrapper pending">
              <Clock size={20} />
            </div>
            <div className="metric-info">
              <h3>Pending</h3>
              <p className={`metric-num ${loading ? 'skeleton-text' : ''}`}>{stats.pending}</p>
            </div>
          </div>

          <div className="metric-card glass">
            <div className="metric-icon-wrapper progress">
              <Clock size={20} className="spin-slow" />
            </div>
            <div className="metric-info">
              <h3>In Progress</h3>
              <p className={`metric-num ${loading ? 'skeleton-text' : ''}`}>{stats.progress}</p>
            </div>
          </div>

          <div className="metric-card glass">
            <div className="metric-icon-wrapper completed">
              <CheckCircle size={20} />
            </div>
            <div className="metric-info">
              <h3>Completed</h3>
              <p className={`metric-num ${loading ? 'skeleton-text' : ''}`}>{stats.completed}</p>
            </div>
          </div>
        </section>

        {/* Filter, Sort & Search Toolbar */}
        <section className="toolbar glass">
          <div className="search-box">
            <Search className="search-icon" size={18} />
            <input
              type="text"
              placeholder="Search tasks by title or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="sort-box">
            <SlidersHorizontal size={16} className="sort-icon" />
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>
        </section>

        {/* Tasks Grid or Loading/Empty States */}
        <section className="tasks-container">
          {loading ? (
            /* Skeleton Loading Grid */
            <div className="tasks-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="task-skeleton glass">
                  <div className="skeleton-line title"></div>
                  <div className="skeleton-line desc"></div>
                  <div className="skeleton-line desc-short"></div>
                  <div className="skeleton-footer">
                    <div className="skeleton-circle"></div>
                    <div className="skeleton-circle"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : tasks.length === 0 ? (
            /* Empty State Illustration */
            <div className="empty-state glass">
              <Inbox size={48} className="empty-icon" />
              <h3>No tasks found</h3>
              <p>
                {searchTerm 
                  ? 'No tasks match your search criteria. Try a different search term.' 
                  : `You have no tasks in the '${filterStatus}' category. Create a new task to get started!`}
              </p>
              {!searchTerm && (
                <button onClick={handleOpenAddModal} className="add-task-btn mt-4">
                  <Plus size={18} />
                  <span>Create First Task</span>
                </button>
              )}
            </div>
          ) : (
            /* Actual Tasks Grid */
            <div className="tasks-grid">
              {tasks.map((task) => (
                <TaskCard
                  key={task._id}
                  task={task}
                  onEdit={handleOpenEditModal}
                  onDelete={handleDeleteTask}
                  onStatusToggle={handleStatusToggle}
                />
              ))}
            </div>
          )}
        </section>

        {/* Pagination Section */}
        {tasks.length > 0 && (
          <section className="pagination-bar">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="pagination-btn glass"
            >
              Previous
            </button>
            <span className="page-indicator">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore}
              className="pagination-btn glass"
            >
              Next
            </button>
          </section>
        )}
      </main>

      {/* Task Creation & Edit Modal */}
      <TaskModal
        task={selectedTask}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
};

export default Dashboard;
