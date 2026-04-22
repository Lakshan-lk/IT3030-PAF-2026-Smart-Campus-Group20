import React from 'react';
import AdminUserList from '../components/AdminUserList';

const AdminStaffPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50 tracking-tight">Staff</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">All staff records are shown here.</p>
      </div>
      <AdminUserList type="STAFF" />
    </div>
  );
};

export default AdminStaffPage;
