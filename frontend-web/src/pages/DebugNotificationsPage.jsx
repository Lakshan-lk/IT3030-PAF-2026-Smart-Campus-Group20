import React from 'react';
import { useAllNotifications } from '../hooks/useNotifications';
import { useAuth } from '../context/AuthContext';

const DebugNotificationsPage = () => {
  const { authUser } = useAuth();
  const { data: allNotifications = [], error } = useAllNotifications();
  
  console.log('[DebugPage] authUser:', authUser);
  console.log('[DebugPage] allNotifications:', allNotifications);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Notification Debug</h1>
      
      <div className="mb-4 p-4 bg-slate-100 dark:bg-slate-800 rounded">
        <h2 className="font-bold mb-2">Current User:</h2>
        <pre className="text-sm overflow-x-auto">
          {JSON.stringify(authUser, null, 2)}
        </pre>
      </div>
      
      <div className="mb-4 p-4 bg-slate-100 dark:bg-slate-800 rounded">
        <h2 className="font-bold mb-2">API Response:</h2>
        {error && <p className="text-red-500">Error: {error.message}</p>}
        <p className="mb-2">Total: {allNotifications.length}</p>
        
        {allNotifications.length === 0 ? (
          <p className="text-yellow-500">No notifications in database</p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b">
                <th className="p-2">ID</th>
                <th className="p-2">User ID</th>
                <th className="p-2">Type</th>
                <th className="p-2">Message</th>
                <th className="p-2">Read</th>
                <th className="p-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {allNotifications.map(n => (
                <tr key={n.id} className="border-b">
                  <td className="p-2">{n.id}</td>
                  <td className="p-2">{n.userId}</td>
                  <td className="p-2">{n.type}</td>
                  <td className="p-2">{n.message}</td>
                  <td className="p-2">{n.isRead ? 'Yes' : 'No'}</td>
                  <td className="p-2">{n.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded">
        <h2 className="font-bold mb-2">Check these IDs match:</h2>
        <ul>
          <li>Your user ID (from authUser): <strong>{authUser?.id || 'MISSING!'}</strong></li>
          <li>User ID in notifications: check table above</li>
        </ul>
      </div>
    </div>
  );
};

export default DebugNotificationsPage;