import React, { useState, useEffect } from 'react';
import { Menu, Bell, Search, Shield, GraduationCap, CheckCircle2, User, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { notificationAPI } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onMenuClick }) {
  const { user, role, theme, logout } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await notificationAPI.getAll();
        if (res.data.success) {
          setNotifications(res.data.data.slice(0, 5));
          setUnreadCount(res.data.unreadCount || 0);
        }
      } catch (err) {
        // silent fail for notification poll
      }
    };
    fetchNotifications();
  }, [role]);

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markRead('mark-all');
      setUnreadCount(0);
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 lg:px-8 flex items-center justify-between">
      {/* Left: Mobile hamburger & Search */}
      <div className="flex items-center space-x-3 flex-1 max-w-md">
        <button
          onClick={onMenuClick}
          className="p-2 -ml-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="relative w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search drives, coding questions, topics..."
            className="w-full pl-9 pr-4 py-1.5 bg-slate-100/80 border border-transparent focus:border-slate-300 focus:bg-white text-xs rounded-xl transition-all outline-none"
          />
        </div>
      </div>

      {/* Right: Authenticated Role Badge, Notifications, User Avatar */}
      <div className="flex items-center space-x-3">
        {/* Strict Role Indicator Badge using Theme Colors */}
        <div className={`flex items-center space-x-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${theme.classes.badgeRole}`}>
          {role === 'admin' ? (
            <Shield className="w-3.5 h-3.5" />
          ) : (
            <GraduationCap className="w-3.5 h-3.5" />
          )}
          <span>{theme.roleLabel}</span>
        </div>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 py-3 z-50">
              <div className="px-4 pb-2 border-b border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">Notifications</span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] font-medium hover:underline text-slate-600"
                  >
                    Mark all read
                  </button>
                )}
              </div>

              <div className="divide-y divide-slate-50 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">No new notifications</div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif._id}
                      className={`p-3 text-xs hover:bg-slate-50 transition-colors ${
                        !notif.isRead ? 'bg-slate-50/80 font-medium' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-slate-800">{notif.title}</span>
                        {!notif.isRead && (
                          <span
                            className="w-2 h-2 rounded-full shrink-0 mt-1"
                            style={{ backgroundColor: theme.colors.primary }}
                          />
                        )}
                      </div>
                      <p className="text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className={`w-9 h-9 rounded-xl ${theme.classes.avatarBg} font-bold flex items-center justify-center text-xs shadow-xs hover:opacity-90 transition-opacity`}
          >
            {user?.name?.charAt(0) || 'U'}
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in">
              <div className="px-4 py-3 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'User'}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full border ${theme.classes.badgeRole}`}>
                  {theme.roleLabel}
                </span>
              </div>

              {role === 'student' && (
                <div className="py-1">
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      navigate('/student/profile');
                    }}
                    className="w-full px-4 py-2 text-left text-xs text-slate-700 hover:bg-slate-50 flex items-center space-x-2"
                  >
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>View Profile & Portfolio</span>
                  </button>
                </div>
              )}

              <div className="border-t border-slate-100 pt-1">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
