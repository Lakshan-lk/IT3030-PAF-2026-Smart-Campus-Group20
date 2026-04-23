import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MdAdd, MdDelete, MdEdit, MdEngineering, MdManageAccounts, MdSearch } from 'react-icons/md';
import { useCreateUser, useDeleteUser, useUpdateUser, useUsers } from '../hooks/useUsers';

const initialForm = {
  name: '',
  email: '',
  age: '',
  address: '',
  phone: '',
  registrationYear: new Date().getFullYear(),
  username: '',
  password: '',
  profession: '',
};

const AdminUsersPage = () => {
  const { data: users = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();
  const [form, setForm] = useState(initialForm);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);

  const technicians = useMemo(
    () => users.filter((user) => user.role?.toUpperCase() === 'TECHNICIAN'),
    [users]
  );

  const filteredTechnicians = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return technicians;
    return technicians.filter((user) =>
      [user.name, user.email, user.username, user.profession, user.universityId]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [technicians, query]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      age: Number(form.age),
      address: form.address.trim(),
      phone: form.phone.trim(),
      registrationYear: Number(form.registrationYear),
      userType: 'STAFF',
      role: 'TECHNICIAN',
      username: form.username.trim(),
      password: form.password,
      profession: form.profession.trim(),
    };

    try {
      const response = editingId
        ? await updateUser.mutateAsync({ id: editingId, data: payload })
        : await createUser.mutateAsync(payload);
      const created = response?.data;
      resetForm();
      setSuccess(
        created?.username
          ? `Technician ${created.username} ${editingId ? 'updated' : 'created'} in the shared database.`
          : `Technician ${editingId ? 'updated' : 'created'} successfully.`
      );
    } catch (mutationError) {
      setError(mutationError.response?.data?.message || `Failed to ${editingId ? 'update' : 'create'} technician`);
    }
  };

  const handleEdit = (user) => {
    setError('');
    setSuccess('');
    setEditingId(user.id);
    setForm({
      name: user.name || '',
      email: user.email || '',
      age: user.age?.toString() || '',
      address: user.address || '',
      phone: user.phone || '',
      registrationYear: user.registrationYear || new Date().getFullYear(),
      username: user.username || '',
      password: '',
      profession: user.profession || '',
    });
  };

  const handleDelete = async (user) => {
    const confirmed = window.confirm(`Delete technician ${user.username || user.name}?`);
    if (!confirmed) return;

    setError('');
    setSuccess('');

    try {
      await deleteUser.mutateAsync(user.id);
      if (editingId === user.id) {
        resetForm();
      }
      setSuccess(`Technician ${user.username || user.name} deleted successfully.`);
    } catch (mutationError) {
      setError(mutationError.response?.data?.message || 'Failed to delete technician');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Admin dashboard</p>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50 tracking-tight">Technician Management</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Only admins should create technician accounts. These records are stored in the shared Supabase PostgreSQL database used by the whole project.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.95fr] gap-6">
        <section className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/40 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700/40 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center dark:bg-slate-100 dark:text-slate-900">
                <MdManageAccounts className="text-xl" />
              </div>
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Saved technicians</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">{technicians.length} technician accounts in the global database</p>
              </div>
            </div>

            <div className="relative w-72 max-w-full">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search technicians..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 pl-10 pr-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse" />
              ))}
            </div>
          ) : filteredTechnicians.length === 0 ? (
            <div className="p-10 text-center">
              <MdEngineering className="mx-auto text-5xl text-slate-300 dark:text-slate-600 mb-3" />
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">No technician accounts found</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Create the first technician account from the admin form.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/40">
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Username</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Profession</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Contact</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTechnicians.map((user) => (
                    <tr key={user.id} className="border-b border-slate-50 dark:border-slate-700/20">
                      <td className="p-4 text-sm font-mono text-slate-700 dark:text-slate-200">{user.username}</td>
                      <td className="p-4">
                        <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{user.universityId || 'No campus ID yet'}</div>
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{user.profession || '-'}</td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                        <div>{user.email}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{user.phone}</div>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(user)}
                            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-600 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                          >
                            <MdEdit />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(user)}
                            className="inline-flex items-center gap-1 rounded-lg border border-rose-200 dark:border-rose-800/40 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20"
                          >
                            <MdDelete />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/40 p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-4">
            {editingId ? 'Update technician' : 'Create technician'}
          </h2>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 dark:border-rose-800/40 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 rounded-xl border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Full name" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
              <input name="profession" value={form.profession} onChange={handleChange} required placeholder="Profession (e.g. Electrician)" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
              <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
              <input name="age" type="number" min="16" max="100" value={form.age} onChange={handleChange} required placeholder="Age" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
              <input name="registrationYear" type="number" min="2000" max="2099" value={form.registrationYear} onChange={handleChange} required placeholder="Registration year" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
              <input name="username" value={form.username} onChange={handleChange} required placeholder="Login username" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
              <input name="password" type="password" value={form.password} onChange={handleChange} minLength={4} required={!editingId} placeholder={editingId ? 'New password (leave blank to keep current)' : 'Login password'} className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
            </div>

            <input name="address" value={form.address} onChange={handleChange} required placeholder="Address" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={createUser.isPending || updateUser.isPending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 px-4 py-2.5 text-sm font-semibold text-white dark:from-cyan-600 dark:to-teal-600"
            >
              <MdAdd className="text-lg" />
              {createUser.isPending || updateUser.isPending
                ? (editingId ? 'Updating...' : 'Creating...')
                : (editingId ? 'Update Technician' : 'Create Technician')}
            </motion.button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
              >
                Cancel Editing
              </button>
            )}
          </form>
        </section>
      </div>
    </div>
  );
};

export default AdminUsersPage;
