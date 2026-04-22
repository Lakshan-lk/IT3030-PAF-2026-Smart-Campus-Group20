import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { MdAdd, MdBadge, MdSchool, MdWork, MdSearch } from 'react-icons/md';
import { useCreateUser, useUsers } from '../hooks/useUsers';

const initialForm = {
  name: '',
  email: '',
  age: '',
  address: '',
  phone: '',
  userType: 'STUDENT',
  registrationYear: 2025,
  course: '',
  yearOfStudy: '',
  department: '',
  designation: '',
};

const AdminUsersPage = () => {
  const { data: users = [], isLoading } = useUsers();
  const createUser = useCreateUser();
  const [form, setForm] = useState(initialForm);
  const [query, setQuery] = useState('');
  const [error, setError] = useState('');

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((user) =>
      [user.name, user.email, user.universityId, user.userType, user.department, user.course]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(q))
    );
  }, [users, query]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const payload = {
      name: form.name,
      email: form.email,
      age: Number(form.age),
      address: form.address,
      phone: form.phone,
      userType: form.userType,
      registrationYear: Number(form.registrationYear),
      course: form.userType === 'STUDENT' ? form.course : null,
      yearOfStudy: form.userType === 'STUDENT' ? Number(form.yearOfStudy) : null,
      department: form.userType === 'STAFF' ? form.department : null,
      designation: form.userType === 'STAFF' ? form.designation : null,
    };

    try {
      await createUser.mutateAsync(payload);
      setForm(initialForm);
    } catch (mutationError) {
      setError(mutationError.response?.data?.message || 'Failed to create user');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-50 tracking-tight">User Management</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create student/staff profiles with auto-generated UNI IDs.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.2fr_1fr] gap-6">
        <section className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/40 overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-slate-700/40 flex items-center justify-between gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">Registered users</h2>
            <div className="relative w-64 max-w-full">
              <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search users..."
                className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 pl-10 pr-3 py-2 text-sm text-slate-800 dark:text-slate-100 outline-none"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 rounded-xl bg-slate-100 dark:bg-slate-700/50 animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700/40">
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">UNI ID</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type</th>
                    <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-slate-50 dark:border-slate-700/20">
                      <td className="p-4 text-sm font-mono text-slate-700 dark:text-slate-200">{user.universityId || '-'}</td>
                      <td className="p-4 text-sm font-semibold text-slate-700 dark:text-slate-200">{user.name}</td>
                      <td className="p-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          user.userType === 'STAFF'
                            ? 'bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800/40'
                            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                        }`}>
                          {user.userType === 'STAFF' ? <MdWork /> : <MdSchool />}
                          {user.userType}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{user.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/40 p-5">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-4">Create user</h2>

          {error && (
            <div className="mb-4 rounded-xl border border-rose-200 dark:border-rose-800/40 bg-rose-50 dark:bg-rose-900/20 px-3 py-2 text-sm text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input name="name" value={form.name} onChange={handleChange} required placeholder="Full name" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
              <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
              <input name="age" type="number" min="16" max="100" value={form.age} onChange={handleChange} required placeholder="Age" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
              <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
            </div>

            <input name="address" value={form.address} onChange={handleChange} required placeholder="Address" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <select name="userType" value={form.userType} onChange={handleChange} className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm">
                <option value="STUDENT">Student</option>
                <option value="STAFF">Staff</option>
              </select>
              <input name="registrationYear" type="number" value={form.registrationYear} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
            </div>

            {form.userType === 'STUDENT' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name="course" value={form.course} onChange={handleChange} required placeholder="Course" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
                <input name="yearOfStudy" type="number" min="1" max="10" value={form.yearOfStudy} onChange={handleChange} required placeholder="Year of study" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input name="department" value={form.department} onChange={handleChange} required placeholder="Department" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
                <input name="designation" value={form.designation} onChange={handleChange} required placeholder="Designation" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
              </div>
            )}

            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={createUser.isPending}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 dark:from-indigo-500 dark:to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <MdAdd className="text-lg" />
              {createUser.isPending ? 'Creating...' : 'Create User'}
            </motion.button>
          </form>

          <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 p-3 text-xs text-slate-500 dark:text-slate-400">
            <div className="flex items-start gap-2">
              <MdBadge className="text-base mt-0.5" />
              <p>Generated ID format: <span className="font-mono">UNI + year(2) + type(20/10) + sequence(1110...)</span>.</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminUsersPage;
