import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { taskApi } from '../api/taskApi';
import { useAuth } from './AuthContext';

const TasksContext = createContext(null);

export const TasksProvider = ({ children }) => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, oldest
  
  // Database-wide statistics state
  const [stats, setStats] = useState({ total: 0, pending: 0, progress: 0, completed: 0 });

  const limit = 6;

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await taskApi.getTasks({
        status: filterStatus === 'All' ? '' : filterStatus,
        page,
        limit,
      });

      setTasks(data);
      setHasMore(data.length === limit);
    } catch (error) {
      console.error('Error fetching tasks:', error.message);
    } finally {
      setLoading(false);
    }
  }, [user, filterStatus, page]);

  // Fetch full stats (database-wide)
  const fetchStats = useCallback(async () => {
    if (!user) return;
    try {
      const allTasks = await taskApi.getTasks({ limit: 1000 });
      const computed = { total: allTasks.length, pending: 0, progress: 0, completed: 0 };
      allTasks.forEach((t) => {
        if (t.status === 'Pending') computed.pending++;
        else if (t.status === 'In Progress') computed.progress++;
        else if (t.status === 'Completed') computed.completed++;
      });
      setStats(computed);
    } catch (error) {
      console.error('Error fetching stats:', error.message);
    }
  }, [user]);

  // Refetch tasks and stats on changes
  useEffect(() => {
    fetchTasks();
    fetchStats();
  }, [fetchTasks, fetchStats]);

  // Reset page to 1 when changing filters
  const handleFilterChange = (newStatus) => {
    setFilterStatus(newStatus);
    setPage(1);
  };

  const addTask = async (taskData) => {
    try {
      const newTask = await taskApi.createTask(taskData);
      if (page === 1) {
        setTasks((prev) => [newTask, ...prev].slice(0, limit));
      } else {
        setPage(1);
      }
      fetchStats();
      return newTask;
    } catch (error) {
      console.error('Error adding task:', error.message);
      throw error;
    }
  };

  const editTask = async (id, updatedFields) => {
    try {
      const updatedTask = await taskApi.updateTask(id, updatedFields);
      setTasks((prev) => prev.map((t) => (t._id === id ? updatedTask : t)));
      fetchStats();
      return updatedTask;
    } catch (error) {
      console.error('Error editing task:', error.message);
      throw error;
    }
  };

  const removeTask = async (id) => {
    try {
      await taskApi.deleteTask(id);
      setTasks((prev) => prev.filter((t) => t._id !== id));
      if (tasks.length <= 1 && page > 1) {
        setPage((p) => p - 1);
      } else {
        fetchTasks();
      }
      fetchStats();
    } catch (error) {
      console.error('Error deleting task:', error.message);
      throw error;
    }
  };

  const getProcessedTasks = () => {
    let processed = [...tasks];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      processed = processed.filter(
        (t) =>
          t.title.toLowerCase().includes(term) ||
          (t.description && t.description.toLowerCase().includes(term))
      );
    }

    processed.sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt);
      }
      return 0;
    });

    return processed;
  };

  return (
    <TasksContext.Provider
      value={{
        tasks: getProcessedTasks(),
        rawTasksCount: tasks.length,
        loading,
        page,
        setPage,
        hasMore,
        filterStatus,
        setFilterStatus: handleFilterChange,
        searchTerm,
        setSearchTerm,
        sortBy,
        setSortBy,
        stats,
        addTask,
        editTask,
        removeTask,
        refreshTasks: fetchTasks,
        refreshStats: fetchStats,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
};

export const useTasks = () => {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
};
