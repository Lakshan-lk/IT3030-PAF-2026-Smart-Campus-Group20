import React, { useMemo, useState } from 'react';
import { MdSearch, MdSchool, MdWork } from 'react-icons/md';
import { useUsers } from '../hooks/useUsers';

const AdminUserList = ({ type }) => {
  const { data: users = [], isLoading } = useUsers();
  const [query, setQuery] = useState('');

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    return users
      .filter((user) => user.userType === type)
      .filter((user) => {
        if (!q) return true;
        return [user.name, user.email, user.universityId, user.department, user.course]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(q));
      });
  }, [users, type, query]);

  return (
    <section className="bg-white/80 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 dark:border-slate-700/40 overflow-hidden">
      <div className="p-5 border-b border-slate-100 dark:border-slate-700/40 flex items-center justify-between gap-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">{type === 'STUDENT' ? 'Students' : 'Staff'} list</h2>
        <div className="relative w-64 max-w-full">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${type === 'STUDENT' ? 'students' : 'staff'}...`}
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
      ) : filteredUsers.length === 0 ? (
        <div className="p-12 text-center text-sm text-slate-500 dark:text-slate-400">
          No {type === 'STUDENT' ? 'students' : 'staff'} found.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-700/40">
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">UNI ID</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Name</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Email</th>
                <th className="p-4 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="border-b border-slate-50 dark:border-slate-700/20">
                  <td className="p-4 text-sm font-mono text-slate-700 dark:text-slate-200">{user.universityId || '-'}</td>
                  <td className="p-4 text-sm font-semibold text-slate-700 dark:text-slate-200">
                    <div className="inline-flex items-center gap-2">
                      {type === 'STUDENT' ? <MdSchool className="text-amber-500" /> : <MdWork className="text-sky-500" />}
                      {user.name}
                    </div>
                  </td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">{user.email}</td>
                  <td className="p-4 text-sm text-slate-600 dark:text-slate-300">
                    {type === 'STUDENT'
                      ? `${user.course || '-'}${user.yearOfStudy ? `, Year ${user.yearOfStudy}` : ''}`
                      : `${user.department || '-'}${user.designation ? `, ${user.designation}` : ''}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default AdminUserList;
