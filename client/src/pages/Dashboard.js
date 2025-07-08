import React, { useEffect, useState } from "react";
import KanbanBoard from "../components/KanbanBoard";
import ActivityLog from "../components/ActivityLog";
import ConflictModal from "../components/ConflictModal";
import TaskModal from "../components/TaskModal";
import { io } from "socket.io-client";
import { jwtDecode } from "jwt-decode";

const API_URL = process.env.REACT_APP_API_URL;

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [actions, setActions] = useState([]);
  const [socket, setSocket] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [users, setUsers] = useState([]);
  const [detailedTask, setDetailedTask] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Fetch tasks from backend
    fetchTasks();
    fetchUsers();
    fetchLogs();
    // Get current user from token
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUser({ id: decoded.id, username: decoded.username });
      } catch (e) {
        setCurrentUser(null);
      }
    }

    // Connect to Socket.IO
    const sock = io(API_URL);
    setSocket(sock);
    
    sock.on("connect", () => {
      console.log("Connected to Socket.IO server");
    });

    // Listen for real-time task updates
    sock.on("taskUpdated", (updatedTask) => {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === updatedTask._id ? updatedTask : task
        )
      );
    });

    sock.on("taskCreated", (newTask) => {
      setTasks(prevTasks => [...prevTasks, newTask]);
    });

    sock.on("taskDeleted", (taskId) => {
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
    });

    sock.on("taskMoved", (data) => {
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === data.taskId ? { ...task, status: data.newStatus } : task
        )
      );
    });

    // Clean up
    return () => sock.disconnect();
  }, []);

  const fetchTasks = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const fetchLogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/logs/recent`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      setActions(data);
    } catch (err) {
      console.error('Failed to fetch activity logs', err);
    }
  };

  const handleTaskDrop = async (taskId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });

      if (response.ok) {
        const updatedTask = await response.json();
        // Emit socket event for real-time update
        socket?.emit('taskMoved', { taskId, newStatus });
        return updatedTask;
      } else {
        throw new Error('Failed to update task status');
      }
    } catch (err) {
      console.error("Failed to update task status", err);
      throw err;
    }
  };

  const handleTaskEdit = (task = {}) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleTaskSave = async (taskData) => {
    try {
      const token = localStorage.getItem('token');
      const url = taskData._id 
        ? `${API_URL}/api/tasks/${taskData._id}`
        : `${API_URL}/api/tasks`;
      
      const method = taskData._id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });

      if (response.ok) {
        const savedTask = await response.json();
        
        if (taskData._id) {
          // Update existing task
          socket?.emit('taskUpdated', savedTask);
        } else {
          // Create new task
          socket?.emit('taskCreated', savedTask);
        }
        
        setShowTaskModal(false);
        setEditingTask(null);
      }
    } catch (err) {
      console.error("Failed to save task", err);
    }
  };

  const handleTaskDelete = async (task) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tasks/${task._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Emit socket event for real-time update
        socket?.emit('taskDeleted', task._id);
      }
    } catch (err) {
      console.error("Failed to delete task", err);
    }
  };

  const handleSmartAssign = async (task) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/tasks/${task._id}/smart-assign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const updatedTask = await response.json();
        // Emit socket event for real-time update
        socket?.emit('taskUpdated', updatedTask);
      }
    } catch (err) {
      console.error("Failed to smart assign task", err);
    }
  };

  const handleTaskClick = (task) => {
    setDetailedTask(task);
    setShowDetailModal(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  // Filter tasks for current user (assigned or created)
  const userTasks = currentUser
    ? tasks.filter(task => task.assignedTo?._id === currentUser.id || task.createdBy === currentUser.id)
    : tasks;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col pb-20 sm:pb-0">
      {/* Header */}
      <header className="w-full bg-white/70 backdrop-blur-md shadow-md py-4 mb-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto flex flex-col xs:flex-row sm:flex-row justify-between items-center gap-4 px-2 sm:px-4 md:px-6">
          <div className="flex items-center gap-3 w-full justify-center sm:justify-start">
            <span className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-tr from-pink-400 via-purple-400 to-blue-400 rounded-full shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4-4M7 17a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4H7zm0 0v2a2 2 0 002 2h6a2 2 0 002-2v-2" /></svg>
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent drop-shadow-lg tracking-tight">Real-Time Collaborative To-Do Board</h1>
          </div>
          <button 
            onClick={handleLogout} 
            className="btn-danger px-6 py-3 text-base flex items-center gap-2 shadow hover:scale-105 transition-transform w-full sm:w-auto justify-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full flex flex-col lg:flex-row justify-center items-start gap-8 px-1 xs:px-2 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Kanban Board */}
        <section className="w-full lg:flex-1 min-w-0 mb-8 lg:mb-0">
          <div className="bg-white/90 rounded-2xl p-2 xs:p-4 sm:p-6 shadow-xl">
            <KanbanBoard 
              tasks={userTasks} 
              onTaskDrop={handleTaskDrop}
              onTaskEdit={handleTaskEdit}
              onTaskDelete={handleTaskDelete}
              onSmartAssign={handleSmartAssign}
              onTaskClick={handleTaskClick}
              socket={socket}
              currentUser={currentUser}
            />
          </div>
        </section>
        {/* Activity Log */}
        <aside className="w-full lg:w-[350px] flex-shrink-0 flex flex-col gap-6">
          <div className="bg-white/90 rounded-2xl shadow-xl p-0">
            <ActivityLog actions={actions.map(log => ({
              _id: log._id,
              user: log.user?.username || 'Unknown',
              actionType: log.actionType,
              description: log.description,
              timestamp: log.timestamp
            }))} />
          </div>
          {/* Conflict Modal (hidden by default, show as needed) */}
          <div className="hidden lg:block">
            <ConflictModal />
          </div>
        </aside>
      </main>

      {/* Task Modal */}
      <TaskModal 
        task={editingTask}
        users={users}
        onSave={handleTaskSave}
        onClose={() => {
          setShowTaskModal(false);
          setEditingTask(null);
        }}
        isOpen={showTaskModal}
        mobileFullScreen={true}
      />
      {/* Task Detail Modal (read-only) */}
      <TaskModal
        task={detailedTask}
        users={users}
        onSave={() => {}}
        onClose={() => {
          setShowDetailModal(false);
          setDetailedTask(null);
        }}
        isOpen={showDetailModal}
        readOnly={true}
        mobileFullScreen={true}
      />

      {/* Footer */}
      <footer className="w-full py-4 bg-white/30 backdrop-blur-md text-center text-sm text-gray-700 fixed bottom-0 left-0 z-30 sm:static sm:mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-2 px-2 sm:px-6">
          <span>© {new Date().getFullYear()} Real-Time Collaborative To-Do Board</span>
          <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-pink-400">View on GitHub</a>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard; 