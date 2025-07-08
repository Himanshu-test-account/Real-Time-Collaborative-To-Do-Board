import React from "react";

const actionIcons = {
  create: (
    <span className="inline-flex items-center justify-center w-7 h-7 bg-green-100 text-green-600 rounded-full mr-3">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
    </span>
  ),
  update: (
    <span className="inline-flex items-center justify-center w-7 h-7 bg-blue-100 text-blue-600 rounded-full mr-3">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v16h16V4H4zm4 4h8v8H8V8z" /></svg>
    </span>
  ),
  delete: (
    <span className="inline-flex items-center justify-center w-7 h-7 bg-red-100 text-red-600 rounded-full mr-3">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
    </span>
  ),
  default: (
    <span className="inline-flex items-center justify-center w-7 h-7 bg-gray-200 text-gray-500 rounded-full mr-3">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /></svg>
    </span>
  ),
};

const ActivityLog = ({ actions }) => {
  return (
    <div className="activity-log p-6 bg-gradient-to-br from-white via-blue-50 to-purple-50 rounded-2xl shadow-2xl border border-gray-100 max-w-md mx-auto">
      <div className="flex items-center mb-5 gap-2">
        <svg className="w-7 h-7 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <h3 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 bg-clip-text text-transparent tracking-tight">Activity Log</h3>
      </div>
      <div className="relative pl-4 border-l-2 border-primary-200 max-h-72 overflow-y-auto">
        {actions && actions.length > 0 ? (
          actions.map((action, idx) => {
            const icon = actionIcons[action.actionType?.toLowerCase()] || actionIcons.default;
            return (
              <div key={action._id} className="mb-6 last:mb-0 flex items-start group">
                <div className="absolute -left-4 mt-1">{icon}</div>
                <div className="ml-6">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary-700 group-hover:underline">{action.user}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-primary-100 text-primary-600 font-semibold capitalize">{action.actionType}</span>
                  </div>
                  <div className="text-sm text-secondary-700 mt-1">
                    {action.description || ''}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {new Date(action.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-sm text-gray-400">No recent activity.</div>
        )}
      </div>
    </div>
  );
};

export default ActivityLog; 