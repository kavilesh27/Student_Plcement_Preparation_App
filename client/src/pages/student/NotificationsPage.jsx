import React, { useState, useEffect } from 'react';
import {
  Bell,
  CheckCircle2,
  Calendar,
  Building,
  Sparkles,
  Award,
  Layers
} from 'lucide-react';
import { notificationAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const res = await notificationAPI.getAll();
      if (res.data.success) {
        setNotifications(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markRead('mark-all');
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <LoadingSpinner text="Fetching your placement alerts & deadlines..." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Bell className="w-6 h-6 text-indigo-600" />
            <span>Placement Notifications & Alerts</span>
          </h1>
          <p className="text-xs text-slate-500">
            Upcoming recruitment deadlines, daily test assignments, and faculty intervention notes.
          </p>
        </div>

        <button
          onClick={handleMarkAllRead}
          className="text-xs font-bold text-indigo-600 hover:underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs divide-y divide-slate-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">No notifications yet.</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`p-5 flex items-start space-x-4 transition-colors ${
                !n.isRead ? 'bg-indigo-50/30' : 'hover:bg-slate-50/60'
              }`}
            >
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
                <Bell className="w-5 h-5" />
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-slate-900 text-sm">{n.title}</h3>
                  <span className="text-[11px] text-slate-400">
                    {new Date(n.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
