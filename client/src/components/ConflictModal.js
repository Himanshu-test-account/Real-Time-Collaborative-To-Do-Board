import React from "react";

const ConflictModal = ({ open, localVersion, serverVersion, onMerge, onOverwrite, onClose, onSave, onDelete }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl">
        <h3 className="text-xl font-bold mb-2 text-red-600 flex items-center gap-2">
          <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12A9 9 0 113 12a9 9 0 0118 0z" /></svg>
          Conflict Detected
        </h3>
        <p className="mb-4 text-gray-600">Your changes conflict with the server version. Choose how to resolve:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="border rounded p-3 bg-gray-50">
            <h4 className="font-semibold mb-1 text-blue-700">Your Version</h4>
            <pre className="text-xs bg-blue-50 rounded p-2 overflow-x-auto">{JSON.stringify(localVersion, null, 2)}</pre>
          </div>
          <div className="border rounded p-3 bg-gray-50">
            <h4 className="font-semibold mb-1 text-green-700">Server Version</h4>
            <pre className="text-xs bg-green-50 rounded p-2 overflow-x-auto">{JSON.stringify(serverVersion, null, 2)}</pre>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 justify-end">
          <button onClick={onMerge} className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded font-semibold">Merge</button>
          <button onClick={onOverwrite} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-semibold">Overwrite</button>
          <button onClick={onSave} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded font-semibold">Save</button>
          <button onClick={onDelete} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-semibold">Delete</button>
          <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded font-semibold">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default ConflictModal; 