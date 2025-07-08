import React, { useState } from "react";
import Column from "./Column";

const KanbanBoard = ({ tasks, onTaskDrop, onTaskEdit, onTaskDelete, onSmartAssign, onTaskClick, socket }) => {
  const columns = ["Todo", "In Progress", "Done"];
  
  const [draggedTask, setDraggedTask] = useState(null);
  const [draggedOverColumn, setDraggedOverColumn] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    setIsDragging(true);
    e.dataTransfer.effectAllowed = "move";
    
    // Create a custom drag image
    const dragImage = e.target.cloneNode(true);
    dragImage.style.opacity = "0.8";
    dragImage.style.transform = "rotate(5deg)";
    dragImage.style.width = "200px";
    document.body.appendChild(dragImage);
    e.dataTransfer.setDragImage(dragImage, 100, 50);
    
    // Remove the temporary element after drag starts
    setTimeout(() => {
      document.body.removeChild(dragImage);
    }, 0);
  };

  const handleDragOver = (e, columnStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDraggedOverColumn(columnStatus);
  };

  const handleDrop = async (e, columnStatus) => {
    e.preventDefault();
    if (draggedTask && draggedTask.status !== columnStatus) {
      // Show loading state
      const originalStatus = draggedTask.status;
      
      try {
        await onTaskDrop(draggedTask._id, columnStatus);
        
        // Show success feedback
        showDropSuccess(columnStatus);
      } catch (error) {
        // Revert on error
        console.error("Drop failed:", error);
        showDropError(originalStatus);
      }
    }
    
    // Reset drag state
    setDraggedTask(null);
    setDraggedOverColumn(null);
    setIsDragging(false);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
    setDraggedOverColumn(null);
    setIsDragging(false);
  };

  const showDropSuccess = (status) => {
    // Create a temporary success indicator
    const successIndicator = document.createElement('div');
    successIndicator.className = 'fixed top-4 right-4 bg-success-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
    successIndicator.textContent = `Task moved to ${status}!`;
    document.body.appendChild(successIndicator);
    
    setTimeout(() => {
      document.body.removeChild(successIndicator);
    }, 2000);
  };

  const showDropError = (originalStatus) => {
    // Create a temporary error indicator
    const errorIndicator = document.createElement('div');
    errorIndicator.className = 'fixed top-4 right-4 bg-danger-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-fade-in';
    errorIndicator.textContent = 'Failed to move task. Please try again.';
    document.body.appendChild(errorIndicator);
    
    setTimeout(() => {
      document.body.removeChild(errorIndicator);
    }, 3000);
  };

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
  };

  const canDropInColumn = (columnStatus) => {
    if (!draggedTask) return false;
    
    // Define allowed transitions
    const allowedTransitions = {
      'Todo': ['In Progress'],
      'In Progress': ['Todo', 'Done'],
      'Done': ['In Progress']
    };
    
    return allowedTransitions[draggedTask.status]?.includes(columnStatus) || false;
  };

  return (
    <div className="glass rounded-2xl p-4 sm:p-8 shadow-glow animate-fade-in">
      {/* Board Header */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-6 mb-8 pb-6 border-b-2 border-white/20 w-full">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent flex items-center gap-3 drop-shadow-lg">
          <svg className="w-8 h-8 md:w-10 md:h-10 text-pink-400 animate-bounce" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2l4-4M7 17a4 4 0 01-4-4V7a4 4 0 014-4h10a4 4 0 014 4v6a4 4 0 01-4 4H7zm0 0v2a2 2 0 002 2h6a2 2 0 002-2v-2" />
          </svg>
          Task Management Board
        </h2>
        <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
          {isDragging && (
            <div className="flex items-center gap-2 text-sm text-secondary-600 bg-secondary-100 px-3 py-1 rounded-full">
              <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
              </svg>
              Dragging: {draggedTask?.title}
            </div>
          )}
          <button 
            className="btn-primary flex items-center gap-2 group"
            onClick={() => onTaskEdit({})}
          >
            <svg className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Add New Task
          </button>
        </div>
      </div>
      {/* Kanban Columns */}
      <div className="w-full max-w-full overflow-x-auto md:overflow-x-visible pb-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 min-h-[400px] md:min-h-[600px] items-stretch">
          {columns.map((status) => (
            <Column
              key={status}
              status={status}
              tasks={getTasksByStatus(status)}
              onTaskDrop={onTaskDrop}
              onTaskEdit={onTaskEdit}
              onTaskDelete={onTaskDelete}
              onSmartAssign={onSmartAssign}
              onTaskClick={onTaskClick}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              draggedOver={draggedOverColumn === status}
              canDrop={canDropInColumn(status)}
              isDragging={isDragging}
              socket={socket}
            />
          ))}
        </div>
        {/* Swipe hint for mobile */}
        <div className="block md:hidden text-center text-xs text-gray-400 mt-2 select-none">
          <span>← Swipe to see more columns →</span>
        </div>
      </div>
      {/* Drag Instructions */}
      {isDragging && (
        <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-lg text-center">
          <p className="text-primary-700 font-medium">
            💡 Tip: Drag tasks between columns to update their status
          </p>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard; 