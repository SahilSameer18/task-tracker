import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTasks } from '../context/TasksContext';
import { 
  CheckSquare, 
  LogOut, 
  User, 
  LayoutDashboard, 
  Clock, 
  Play, 
  CheckCircle,
  Menu,
  X
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const { filterStatus, setFilterStatus, stats, loading } = useTasks();
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => setIsOpen(!isOpen);

  // Calculate completion percentage
  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  const handleFilterClick = (status) => {
    setFilterStatus(status);
    setIsOpen(false); // Close sidebar on mobile after selection
  };

  const menuItems = [
    { name: 'All', icon: <LayoutDashboard size={18} />, count: stats.total },
    { name: 'Pending', icon: <Clock size={18} />, count: stats.pending },
    { name: 'In Progress', icon: <Play size={18} />, count: stats.progress },
    { name: 'Completed', icon: <CheckCircle size={18} />, count: stats.completed },
  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <button className="mobile-toggle" onClick={toggleSidebar}>
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Backdrop overlay for mobile */}
      {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

      <aside className={`sidebar glass ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo">✓</div>
          <h2>Task Tracker</h2>
        </div>

        {/* Scrollable menu content wrapper to keep footer on screen */}
        <div className="sidebar-menu-wrapper">
          {/* User Card */}
          <div className="user-profile">
            <div className="avatar-wrapper">
              <User size={20} className="avatar-icon" />
            </div>
            <div className="user-info">
              <p className="user-name">{user?.name || 'User'}</p>
              <p className="user-email">{user?.email || 'email@domain.com'}</p>
            </div>
          </div>

          {/* Navigation Filters */}
          <nav className="sidebar-nav">
            <p className="section-title">Task Categories</p>
            <ul className="nav-list">
              {menuItems.map((item) => (
                <li key={item.name} className="nav-item">
                  <button
                    className={`nav-link ${filterStatus === item.name ? 'active' : ''}`}
                    onClick={() => handleFilterClick(item.name)}
                  >
                    <span className="link-icon-text">
                      {item.icon}
                      <span>{item.name}</span>
                    </span>
                    <span className={`badge badge-${item.name.toLowerCase().replace(' ', '-')} ${loading ? 'skeleton-text' : ''}`}>
                      {item.count}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Analytics Tracker Panel */}
          <div className="analytics-card">
            <div className="analytics-header">
              <CheckSquare size={16} className="analytics-icon" />
              <span>Completion Rate</span>
              <span className={`percentage-text ${loading ? 'skeleton-text' : ''}`}>{completionRate}%</span>
            </div>
            <div className="progress-bar-container">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <p className={`analytics-sub ${loading ? 'skeleton-text' : ''}`}>
              {stats.completed} of {stats.total} tasks completed
            </p>
          </div>
        </div>

        {/* Footer Actions - Pinned */}
        <div className="sidebar-footer">
          <button onClick={logout} className="logout-btn">
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
