import React, { useState, useEffect } from 'react';

const TaskModal = ({ task, users, onSave, onClose, isOpen, readOnly }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'Medium',
    assignedTo: '',
    dueDate: '',
    status: 'Todo'
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (task && task._id) {
      setForm({
        title: task.title || '',
        description: task.description || '',
        priority: task.priority || 'Medium',
        assignedTo: task.assignedTo?._id || '',
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
        status: task.status || 'Todo'
      });
    } else {
      setForm({
        title: '',
        description: '',
        priority: 'Medium',
        assignedTo: '',
        dueDate: '',
        status: 'Todo'
      });
    }
    setErrors({});
  }, [task]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (form.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters';
    }
    if (form.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (readOnly) return; // Prevent submit in read-only mode
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length === 0) {
      const taskData = {
        ...form,
        assignedTo: form.assignedTo || null,
        dueDate: form.dueDate || null
      };
      onSave(taskData);
    } else {
      setErrors(newErrors);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="flex justify-between items-center p-6 border-b border-secondary-200">
          <h2 className="text-2xl font-bold text-secondary-800">
            {readOnly ? 'Task Details' : (task && task._id ? 'Edit Task' : 'Create New Task')}
          </h2>
          <button 
            className="p-2 text-secondary-400 hover:text-secondary-600 hover:bg-secondary-100 rounded-full transition-all duration-200"
            onClick={onClose}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-semibold text-secondary-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Enter task title"
              className={`input-field ${errors.title ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100' : ''}`}
              disabled={readOnly}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-danger-600">{errors.title}</p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="description" className="block text-sm font-semibold text-secondary-700 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter task description"
              rows="4"
              className={`input-field resize-none w-full min-w-0 ${errors.description ? 'border-danger-500 focus:border-danger-500 focus:ring-danger-100' : ''}`}
              disabled={readOnly}
            />
            {errors.description && (
              <p className="mt-1 text-sm text-danger-600">{errors.description}</p>
            )}
          </div>

          {/* Priority and Status Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="priority" className="block text-sm font-semibold text-secondary-700 mb-2">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={form.priority}
                onChange={handleChange}
                className="input-field"
                disabled={readOnly}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
              </select>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-semibold text-secondary-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={form.status}
                onChange={handleChange}
                className="input-field"
                disabled={readOnly}
              >
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Done">Done</option>
              </select>
            </div>
          </div>

          {/* Assignment and Due Date Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-semibold text-secondary-700 mb-2">
                Assign To
              </label>
              <select
                id="assignedTo"
                name="assignedTo"
                value={form.assignedTo}
                onChange={handleChange}
                className="input-field"
                disabled={readOnly}
              >
                <option value="">Unassigned</option>
                {users.map(user => (
                  <option key={user._id} value={user._id}>
                    {user.username || user.name || user.email}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="block text-sm font-semibold text-secondary-700 mb-2">
                Due Date
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={form.dueDate}
                onChange={handleChange}
                className="input-field"
                disabled={readOnly}
              />
            </div>
          </div>

          {/* Save Button */}
          {!readOnly && (
            <div className="flex justify-end">
              <button type="submit" className="btn-primary px-6 py-2 text-base font-semibold">
                Save Task
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default TaskModal; 