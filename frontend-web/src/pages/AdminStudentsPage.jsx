import React from 'react';
import AdminUserList from '../components/AdminUserList';

const AdminStudentsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50 tracking-tight">Students</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">All student records are shown here.</p>
      </div>
      <AdminUserList type="STUDENT" />
    </div>
  );
};

export default AdminStudentsPage;
