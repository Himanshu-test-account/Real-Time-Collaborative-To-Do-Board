import React, { useState } from "react";
import SmartAssignButton from "./SmartAssignButton";
import UserAvatar from "./UserAvatar";

const TaskCard = ({ 
  task, 
  onEdit, 
  onDelete, 
  onSmartAssign, 
  onClick, 
  onDragStart, 
  onDragEnd,
  socket 
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e) => {
    setIsDragging(true);
    onDragStart(e, task);
    
    // Add dragging class to body for global styles
    document.body.classList.add('dragging');
  };

  const handleDragEnd = (e) => {
    setIsDragging(false);
    onDragEnd(e);
    
    // Remove dragging class from body
    document.body.classList.remove('dragging');
  };

  const getPriorityColor = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return 'bg-danger-500 text-white';
      case 'medium': return 'bg-warning-500 text-white';
      case 'low': return 'bg-success-500 text-white';
      default: return 'bg-secondary-400 text-white';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority?.toLowerCase()) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return null;
    
    const date = new Date(dueDate);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return { text: 'Due today', className: 'text-warning-600' };
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return { text: 'Due tomorrow', className: 'text-warning-500' };
    } else if (date < today) {
      return { text: 'Overdue', className: 'text-danger-600' };
    } else {
      return { text: `Due: ${date.toLocaleDateString()}`, className: 'text-secondary-500' };
    }
  };

  const dueDateInfo = formatDueDate(task.dueDate);

  return (
    <div 
      className={`card p-6 cursor-grab active:cursor-grabbing transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border-l-4 border-primary-500 animate-fade-in ${
        isHovered ? 'ring-2 ring-primary-200' : ''
      } ${
        isDragging ? 'opacity-50 scale-95 rotate-2 shadow-2xl' : ''
      }`}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onClick && onClick(task)}
    >
      {/* Task Header */}
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-secondary-800 flex-1 mr-3 line-clamp-2">
          {task.title}
        </h3>
        <div className={`flex gap-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            className="p-2 text-secondary-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            title="Edit Task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          <button 
            className="p-2 text-secondary-600 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-all duration-200"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm('Are you sure you want to delete this task?')) {
                onDelete(task);
              }
            }}
            title="Delete Task"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Task Description */}
      {task.description && (
        <div className="mb-4">
          <p className="text-sm text-secondary-600 line-clamp-3 leading-relaxed">
            {task.description}
          </p>
        </div>
      )}

      {/* Task Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
        {/* Priority */}
        <div className="flex items-center">
          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(task.priority)}`}>
            {getPriorityIcon(task.priority)} {task.priority || 'None'}
          </span>
        </div>
        
        {/* Assignment */}
        <div className="flex items-center min-w-0">
          {task.assignedTo ? (
            <div className="flex items-center gap-2 min-w-0">
              <UserAvatar user={task.assignedTo} />
              <span className="text-sm font-medium text-secondary-700 truncate max-w-[100px] sm:max-w-[140px] md:max-w-[180px]" title={task.assignedTo.username || task.assignedTo.name || 'Unknown'}>
                {task.assignedTo.username || task.assignedTo.name || 'Unknown'}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-secondary-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-sm font-medium italic">Unassigned</span>
            </div>
          )}
        </div>
      </div>

      {/* Smart Assign Button */}
      <div className="mb-3">
        <SmartAssignButton 
          onClick={(e) => {
            e.stopPropagation();
            onSmartAssign(task);
          }}
        />
      </div>

      {/* Due Date */}
      {task.dueDate && (
        <div className="flex items-center gap-2 text-xs pt-3 border-t border-secondary-100">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span className={`font-medium ${dueDateInfo.className}`}>
            {dueDateInfo.text}
          </span>
        </div>
      )}
      
      {/* Drag Indicator */}
      {isDragging && (
        <div className="absolute inset-0 bg-primary-500/10 border-2 border-dashed border-primary-500 rounded-lg flex items-center justify-center">
          <div className="text-primary-600 font-semibold text-sm">
            Moving to new column...
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard; 