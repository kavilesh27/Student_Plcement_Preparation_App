import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  ShieldCheck,
  Calendar,
  User,
  Activity,
  Layers,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { adminAPI } from '../../services/api';
import LoadingSpinner from '../../components/common/LoadingSpinner';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchLogs(currentPage);
  }, [currentPage]);

  const fetchLogs = async (page) => {
    setLoading(true);
    try {
      const res = await adminAPI.getAuditLogs({ page, limit: 15 });
      if (res.data.success) {
        setLogs(res.data.data);
        setCurrentPage(res.data.currentPage);
        setTotalPages(res.data.totalPages);
        setTotalCount(res.data.total);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Retrieving administrative activity audit logs..." />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Activity className="w-6 h-6 text-indigo-600" />
            <span>Administrative Audit Activity Logs</span>
          </h1>
          <p className="text-xs text-slate-500">
            Immutable tracking trail recording user creations, role alterations, company drive updates, and test assignments.
          </p>
        </div>

        <div className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-xl">
          Total Logs: {totalCount}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-3">Action Description</th>
                <th className="py-3 px-3">Target Entity</th>
                <th className="py-3 px-3">Audit Details</th>
                <th className="py-3 px-3">IP Address</th>
                <th className="py-3 px-4 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-slate-900 block">{log.actorName || 'System'}</span>
                    <span className="text-[10px] uppercase font-bold text-indigo-600">{log.actorRole || 'System'}</span>
                  </td>
                  <td className="py-3 px-3 font-semibold text-slate-800">
                    {log.action}
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-mono text-[10px]">
                      {log.targetType}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-[11px] text-slate-500 max-w-xs truncate font-mono">
                    {JSON.stringify(log.metadata || {})}
                  </td>
                  <td className="py-3 px-3 font-mono text-slate-400 text-[11px]">
                    {log.ipAddress || '127.0.0.1'}
                  </td>
                  <td className="py-3 px-4 text-right text-slate-500">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Page {currentPage} of {totalPages || 1}
          </span>
          <div className="flex items-center space-x-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => p - 1)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => p + 1)}
              className="p-1.5 bg-slate-100 hover:bg-slate-200 rounded-lg disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
