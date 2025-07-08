import React from "react";
import TaskCard from "./TaskCard";

const Column = ({ 
  status, 
  tasks, 
  onTaskDrop, 
  onTaskEdit, 
  onTaskDelete, 
  onSmartAssign, 
  onTaskClick,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  draggedOver,
  canDrop,
  isDragging,
  socket 
}) => {
  const handleDragOver = (e) => {
    e.preventDefault();
    onDragOver(e, status);
  };

  const handleDrop = (e) => {
    onDrop(e, status);
  };

  const getColumnColor = (status) => {
    switch (status) {
      case 'Todo': return 'border-l-danger-500 bg-danger-50/30';
      case 'In Progress': return 'border-l-warning-500 bg-warning-50/30';
      case 'Done': return 'border-l-success-500 bg-success-50/30';
      default: return 'border-l-primary-500 bg-primary-50/30';
    }
  };

  const getColumnIcon = (status) => {
    switch (status) {
      case 'Todo': return '📋';
      case 'In Progress': return '⚡';
      case 'Done': return '✅';
      default: return '📝';
    }
  };

  const getDropZoneStyle = () => {
    if (!isDragging) return {};
    
    if (draggedOver && canDrop) {
      return {
        borderColor: '#22c55e', // success green
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        transform: 'scale(1.02)',
        boxShadow: '0 0 20px rgba(34, 197, 94, 0.3)'
      };
    }
    
    if (draggedOver && !canDrop) {
      return {
        borderColor: '#ef4444', // danger red
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        transform: 'scale(1.02)',
        boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)'
      };
    }
    
    return {};
  };

  const getDropZoneMessage = () => {
    if (!isDragging) return null;
    
    if (draggedOver && canDrop) {
      return (
        <div className="text-success-600 font-semibold text-lg flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Drop to move here
        </div>
      );
    }
    
    if (draggedOver && !canDrop) {
      return (
        <div className="text-danger-600 font-semibold text-lg flex items-center gap-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          Invalid move
        </div>
      );
    }
    
    return null;
  };

  return (
    <div 
      className={`relative bg-white/80 backdrop-blur-sm rounded-xl p-6 min-h-[500px] border-2 border-transparent transition-all duration-300 ${
        !isDragging ? getColumnColor(status) : ''
      }`}
      style={getDropZoneStyle()}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    > 
      {/* Column Header */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-secondary-200">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getColumnIcon(status)}</span>
          <h3 className="text-xl font-bold text-secondary-800">{status}</h3>
        </div>
        <div className="flex items-center gap-2">
          {isDragging && (
            <div className={`w-3 h-3 rounded-full ${
              canDrop ? 'bg-success-500' : 'bg-danger-500'
            } animate-pulse`}></div>
          )}
          <span className="bg-primary-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-md">
            {tasks.length}
          </span>
        </div>
      </div>
      
      {/* Column Content */}
      <div className="space-y-4 min-h-[400px] relative">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-secondary-400">
            <svg className="w-12 h-12 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm font-medium">No tasks yet</p>
            {isDragging && canDrop && (
              <p className="text-xs text-success-600 mt-1">Drop here to add</p>
            )}
          </div>
        ) : (
          tasks.map(task => (
            <TaskCard 
              key={task._id} 
              task={task}
              onEdit={onTaskEdit}
              onDelete={onTaskDelete}
              onSmartAssign={onSmartAssign}
              onClick={onTaskClick}
              onDragStart={onDragStart}
              onDragEnd={onDragEnd}
              socket={socket}
            />
          ))
        )}
      </div>
      
      {/* Enhanced Drop Zone Indicator */}
      {draggedOver && (
        <div className="absolute inset-0 border-2 border-dashed rounded-xl flex items-center justify-center backdrop-blur-sm"
             style={{
               borderColor: canDrop ? '#22c55e' : '#ef4444',
               backgroundColor: canDrop ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)'
             }}>
          <div className="text-center">
            {getDropZoneMessage()}
            {canDrop && (
              <p className="text-sm text-success-600 mt-2">
                Task will be moved to {status}
              </p>
            )}
          </div>
        </div>
      )}
      
      {/* Column Status Indicator */}
      {isDragging && !draggedOver && (
        <div className="absolute inset-0 border-2 border-dashed border-secondary-300 rounded-xl flex items-center justify-center opacity-30">
          <div className="text-secondary-500 font-medium">
            Drop zone: {status}
          </div>
        </div>
      )}
    </div>
  );
};

export default Column; 