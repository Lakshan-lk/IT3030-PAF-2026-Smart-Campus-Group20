import React from 'react';
import AdminUserForm from '../components/AdminUserForm';

const AdminCreateUserPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50 tracking-tight">Create User</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add a new Student or Staff profile.</p>
      </div>
      <AdminUserForm />
    </div>
  );
};

export default AdminCreateUserPage;
