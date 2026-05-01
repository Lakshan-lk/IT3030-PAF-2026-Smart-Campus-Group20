export function normalizeUsername(username = '') {
  return username.trim().toLowerCase();
}

export function getHomeRouteForRole(role) {
  if (role === 'admin') {
    return '/admin/overview';
  }

  if (role === 'technician') {
    return '/technician/tickets';
  }

  return '/';
}

export function canAccessPath(role, pathname = '') {
  if (!pathname || pathname === '/login') {
    return false;
  }

  if (pathname.startsWith('/admin')) {
    return role === 'admin';
  }

  if (pathname.startsWith('/technician')) {
    return role === 'technician';
  }

  return role === 'user';
}

export function toSessionUser(user = {}) {
  return {
    id: user.id,
    username: user.username || user.name || user.email?.split('@')[0] || 'user',
    name: user.name || user.username || 'Campus User',
    email: user.email || '',
    role: user.role || 'user',
    provider: user.provider || 'local',
    profileImageUrl: user.profileImageUrl || '',
    department: user.department || '',
    designation: user.designation || '',
    profession: user.profession || '',
    userType: user.userType || null,
  };
}
