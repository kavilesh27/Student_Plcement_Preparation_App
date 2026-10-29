import React from 'react';
import {
  FileSpreadsheet,
  Download,
  FileText,
  Users,
  Building,
  AlertTriangle,
  CheckCircle2,
  Table
} from 'lucide-react';
import { staffAPI } from '../../services/api';

export default function StaffReports() {
  const reports = [
    {
      title: 'Institutional Placement Performance Report',
      description: 'Comprehensive roster of all students, test scores, CGPA, department, and placement readiness percentage.',
      icon: Users,
      color: 'indigo',
    },
    {
      title: 'Students Requiring Support (At-Risk Roster)',
      description: 'Filterable list of students scoring below cutoff thresholds or missing daily tests with weak topic analytics.',
      icon: AlertTriangle,
      color: 'amber',
    },
    {
      title: 'Company Eligibility Matrix',
      description: 'Student-by-company eligibility evaluation breakdown against recorded drive criteria.',
      icon: Building,
      color: 'emerald',
    },
    {
      title: 'Advanced Training Completion Summary',
      description: 'Curriculum completion percentages across Aptitude, DSA, C, C++, and Java placement courses.',
      icon: FileSpreadsheet,
      color: 'blue',
    },
  ];

  const handleDownload = (format) => {
    const url = staffAPI.exportReportUrl(format);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `placement_report.${format === 'excel' ? 'xlsx' : 'csv'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
          <FileSpreadsheet className="w-6 h-6 text-indigo-600" />
          <span>Placement Performance Analytics & Data Export</span>
        </h1>
        <p className="text-xs text-slate-500">
          Generate official placement audit reports and export tabular records in CSV and Microsoft Excel formats.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((rep, idx) => {
          const Icon = rep.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{rep.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">{rep.description}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleDownload('csv')}
                  className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center justify-center space-x-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export CSV</span>
                </button>
                <button
                  onClick={() => handleDownload('excel')}
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center space-x-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  <span>Export Excel</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
