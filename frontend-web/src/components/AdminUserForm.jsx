import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MdAdd, MdBadge } from 'react-icons/md';
import { useCreateUser } from '../hooks/useUsers';

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

const AdminUserForm = () => {
  const createUser = useCreateUser();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      name: form.name,
      email: form.email,
      age: Number(form.age),
      address: form.address,
      phone: form.phone,
      registrationYear: Number(form.registrationYear),
      userType: 'STAFF',
      role: 'TECHNICIAN',
      username: form.username,
      password: form.password,
      profession: form.profession,
    };

    try {
      const response = await createUser.mutateAsync(payload);
      const created = response?.data;
      setForm(initialForm);
      setSuccess(created?.username ? `Technician ${created.username} created successfully` : 'Technician created successfully');
    } catch (mutationError) {
      setError(mutationError.response?.data?.message || 'Failed to create technician');
    }
  };

  return (
    <section className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/40 p-5">
      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200 mb-4">Create technician</h2>

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
          <input name="profession" value={form.profession} onChange={handleChange} required placeholder="Profession" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
          <input name="email" type="email" value={form.email} onChange={handleChange} required placeholder="Email" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
          <input name="age" type="number" min="16" max="100" value={form.age} onChange={handleChange} required placeholder="Age" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
          <input name="phone" value={form.phone} onChange={handleChange} required placeholder="Phone" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
          <input name="username" value={form.username} onChange={handleChange} required placeholder="Username" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
          <input name="password" type="password" value={form.password} onChange={handleChange} required minLength={4} placeholder="Password" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />
        </div>

        <input name="address" value={form.address} onChange={handleChange} required placeholder="Address" className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />

        <input name="registrationYear" type="number" value={form.registrationYear} onChange={handleChange} required className="w-full rounded-xl border border-slate-200 dark:border-slate-600/50 bg-white dark:bg-slate-700/50 px-3 py-2.5 text-sm" />

        <motion.button
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={createUser.isPending}
          className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-slate-800 to-slate-700 dark:from-indigo-500 dark:to-indigo-600 px-4 py-2.5 text-sm font-semibold text-white"
        >
          <MdAdd className="text-lg" />
          {createUser.isPending ? 'Creating...' : 'Create Technician'}
        </motion.button>
      </form>

      <div className="mt-4 rounded-xl bg-slate-50 dark:bg-slate-700/30 p-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-start gap-2">
          <MdBadge className="text-base mt-0.5" />
          <p>Technician accounts are created by admins and stored in the shared campus database.</p>
        </div>
      </div>
    </section>
  );
};

export default AdminUserForm;
