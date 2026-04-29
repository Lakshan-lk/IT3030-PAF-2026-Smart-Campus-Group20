import React, { useState, useRef, useEffect } from 'react';
import { MdNotifications, MdCheckCircle, MdError, MdPerson, MdBuild, MdDone, MdWarning } from 'react-icons/md';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useUnreadCount, useNotifications, useMarkAsRead, useMarkAllAsRead } from '../hooks/useNotifications';

const notificationIcons = {
  TICKET_CREATED: <MdBuild className="w-4 h-4" />,
  TICKET_ASSIGNED: <MdPerson className="w-4 h-4" />,
  TICKET_REJECTED: <MdError className="w-4 h-4" />,
  TICKET_RESOLVED: <MdCheckCircle className="w-4 h-4" />,
  TICKET_CLOSED: <MdDone className="w-4 h-4" />,
  COMMENT_ADDED: <MdPerson className="w-4 h-4" />,
};

const iconColors = {
  TICKET_CREATED: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400',
  TICKET_ASSIGNED: 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400',
  TICKET_REJECTED: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
  TICKET_RESOLVED: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400',
  TICKET_CLOSED: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400',
  COMMENT_ADDED: 'bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400',
};

const NotificationBell = () => {
  const { authUser } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const userId = authUser?.id;
  
  // Debug: force show userId 
  console.log('[NotificationBell] authUser:', authUser, 'userId:', userId);

  const { data: unreadCount = 0, error: unreadError } = useUnreadCount(userId);
  const { data: notifications = [], error: notifError } = useNotifications(userId);

  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = async (notification) => {
    if (!notification.isRead) {
      await markAsRead.mutateAsync(notification.id);
    }
  };

  const handleMarkAllRead = async () => {
    if (userId) {
      await markAllAsRead.mutateAsync(userId);
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
      >
        <MdNotifications className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden z-50"
          >
            <div className="flex items-center justify-between p-3 border-b border-slate-200 dark:border-slate-700">
              <h3 className="font-semibold text-slate-700 dark:text-slate-200">Notifications</h3>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-500 hover:text-blue-600 dark:text-blue-400"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* Debug info */}
            {(unreadError || notifError) && (
              <div className="p-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs">
                <MdWarning className="inline w-3 h-3 mr-1" />
                Error loading: {unreadError?.message || notifError?.message}
              </div>
            )}

            <div className="max-h-96 overflow-y-auto">
              {(!notifications || notifications.length === 0) ? (
                <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                  {userId ? 'No notifications yet' : 'Login to see notifications'}
                  {/* Debug: show userId for troubleshooting */}
                  {process.env.NODE_ENV === 'development' && userId === undefined && (
                    <div className="text-xs text-red-500 mt-2">
                      Debug: userId missing (authUser.id = {String(authUser?.id)})
                    </div>
                  )}
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`p-3 border-b border-slate-100 dark:border-slate-700/50 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors ${
                      !notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${iconColors[notification.type] || 'bg-slate-100 dark:bg-slate-700'}`}>
                        {notificationIcons[notification.type] || <MdNotifications className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${!notification.isRead ? 'font-semibold text-slate-700 dark:text-slate-200' : 'text-slate-600 dark:text-slate-300'}`}>
                          {notification.message}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {formatTime(notification.createdAt)}
                        </p>
                      </div>
                      {!notification.isRead && (
                        <div className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationBell;