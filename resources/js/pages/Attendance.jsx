import React, { useState, useEffect } from 'react';
import Layout from '../layouts/Layout';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import { SkeletonTable, Skeleton } from '../components/Skeleton';
import { Upload, Clock, Filter, PieChart as PieChartIcon, List, CheckCircle, LogOut, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import AttendanceCalendar from '../components/AttendanceCalendar';
import Swal from 'sweetalert2';

export default function Attendance() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [attendances, setAttendances] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [manualForm, setManualForm] = useState({ user_id: '', date: '', status: 'present', check_in: '', check_out: '' });
  const [filters, setFilters] = useState({ month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user?.roles?.some(r => ['admin', 'hr', 'employer'].includes(r.name));

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? '/attendances/all' : '/attendances';
      const response = await api.get(endpoint, { params: filters });
      setAttendances(response.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchEmployees = async () => {
    if (!isAdmin) return;
    try {
      const response = await api.get('/employees');
      setEmployees(response.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchAttendance();
  }, [filters]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const handleManualAttendance = async (e) => {
    e.preventDefault();
    try {
      await api.post('/attendances/manual', manualForm);
      fetchAttendance();
      setManualForm({ user_id: '', date: '', status: 'present', check_in: '', check_out: '' });
      Swal.fire('Success', 'Attendance marked successfully', 'success');
    } catch (err) { 
      console.error(err); 
      Swal.fire('Error', 'Failed to mark attendance', 'error');
    }
  };

  const handleCheckIn = async () => {
    try {
      await api.post('/attendances/check-in');
      fetchAttendance();
      Swal.fire('Checked In', 'Your check-in time has been recorded.', 'success');
    } catch (err) {
      Swal.fire('Notice', err.response?.data?.message || 'Failed to check in', 'warning');
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.post('/attendances/check-out');
      fetchAttendance();
      Swal.fire('Checked Out', 'Your check-out time has been recorded.', 'success');
    } catch (err) {
      Swal.fire('Notice', err.response?.data?.message || 'Failed to check out', 'warning');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    setUploading(true);
    try {
      await api.post('/attendances/import', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchAttendance();
      setFile(null);
    } catch (err) { console.error(err); }
    finally { setUploading(false); }
  };

  const columns = [
    {
      accessorKey: isAdmin ? 'user.name' : 'date',
      header: isAdmin ? 'Employee' : 'Date',
      cell: info => {
        if (!isAdmin) return <span className="font-medium text-slate-700">{info.getValue()}</span>;
        return (
          <div className="flex items-center gap-3">
            <img src={`https://ui-avatars.com/api/?name=${info.getValue()}&background=random`} alt="avatar" className="w-8 h-8 rounded-full border border-slate-200" />
            <span className="font-semibold text-slate-800">{info.getValue()}</span>
          </div>
        );
      }
    },
    ...(isAdmin ? [{ accessorKey: 'date', header: 'Date', cell: info => <span className="text-slate-600">{info.getValue()}</span> }] : []),
    { 
      accessorKey: 'check_in', 
      header: 'Check In',
      cell: info => <div className="flex items-center gap-1.5 text-slate-600"><Clock size={14} className="text-slate-400" /> {info.getValue() || '--:--'}</div>
    },
    { 
      accessorKey: 'check_out', 
      header: 'Check Out',
      cell: info => <div className="flex items-center gap-1.5 text-slate-600"><Clock size={14} className="text-slate-400" /> {info.getValue() || '--:--'}</div>
    },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        const colors = {
          present: 'bg-green-100 text-green-700',
          absent: 'bg-red-100 text-red-700',
          late: 'bg-yellow-100 text-yellow-700',
          half_day: 'bg-sky-100 text-sky-700'
        };
        return (
          <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider ${colors[status] || colors.present}`}>
            {status.replace('_', ' ')}
          </span>
        );
      }
    }
  ];

  // Chart Data Preparation
  const statusCounts = attendances.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {});

  const chartData = [
    { name: 'Present', value: statusCounts['present'] || 0, color: '#22c55e' },
    { name: 'Absent', value: statusCounts['absent'] || 0, color: '#ef4444' },
    { name: 'Late', value: statusCounts['late'] || 0, color: '#eab308' },
    { name: 'Half Day', value: statusCounts['half_day'] || 0, color: '#0284c7' },
  ].filter(d => d.value > 0);

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Attendance Center</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <span>Main Menu</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">Attendance</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 mb-6">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'dashboard' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <PieChartIcon size={18} /> Dashboard View
        </button>
        <button 
          onClick={() => setActiveTab('list')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'list' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <List size={18} /> Register & Operations
        </button>
        <button 
          onClick={() => setActiveTab('calendar')}
          className={`flex items-center gap-2 px-6 py-3 font-medium text-sm transition-colors border-b-2 ${activeTab === 'calendar' ? 'border-sky-500 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
        >
          <Calendar size={18} /> Calendar View
        </button>
      </div>

      {/* Filters (Global to both tabs) */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Month</label>
          <select 
            value={filters.month} 
            onChange={e => setFilters({...filters, month: e.target.value})}
            className="border border-slate-200 px-3 py-2 rounded-lg bg-slate-50 focus:bg-white outline-none w-40"
          >
            {Array.from({length: 12}).map((_, i) => (
              <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Year</label>
          <select 
            value={filters.year} 
            onChange={e => setFilters({...filters, year: e.target.value})}
            className="border border-slate-200 px-3 py-2 rounded-lg bg-slate-50 focus:bg-white outline-none w-32"
          >
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div className="flex-1 flex justify-end">
          <div className="text-sm text-slate-500 flex items-center gap-2 bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">
            <Filter size={16} /> Filter active
          </div>
        </div>
      </div>

      {activeTab === 'dashboard' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[300px]">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 self-start">Attendance Overview</h3>
            {loading ? (
              <Skeleton className="w-48 h-48 rounded-full" />
            ) : chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={chartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400">No data available for this month.</p>
            )}
          </div>
          <div className="lg:col-span-2 grid grid-cols-2 gap-4">
             {chartData.map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-center">
                  <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">{stat.name}</p>
                  <p className="text-4xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                </div>
             ))}
          </div>
        </div>
      )}

      {activeTab === 'calendar' && (
        <div className="mb-6">
          <AttendanceCalendar />
        </div>
      )}

      {activeTab === 'list' && (
        <>
          {isAdmin && (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
              {/* Manual Entry */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Mark Attendance Manually</h2>
                <form onSubmit={handleManualAttendance} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Employee</label>
                    <select className="w-full border border-slate-200 px-3 py-2 rounded-lg bg-white focus:border-sky-500 outline-none" required value={manualForm.user_id} onChange={e => setManualForm({...manualForm, user_id: e.target.value})}>
                      <option value="">Select Employee...</option>
                      {employees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                    <input type="date" required className="w-full border border-slate-200 px-3 py-2 rounded-lg bg-white focus:border-sky-500 outline-none" value={manualForm.date} onChange={e => setManualForm({...manualForm, date: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Check In Time</label>
                    <input type="time" className="w-full border border-slate-200 px-3 py-2 rounded-lg bg-white focus:border-sky-500 outline-none" value={manualForm.check_in} onChange={e => setManualForm({...manualForm, check_in: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Check Out Time</label>
                    <input type="time" className="w-full border border-slate-200 px-3 py-2 rounded-lg bg-white focus:border-sky-500 outline-none" value={manualForm.check_out} onChange={e => setManualForm({...manualForm, check_out: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                    <select className="w-full border border-slate-200 px-3 py-2 rounded-lg bg-white focus:border-sky-500 outline-none" required value={manualForm.status} onChange={e => setManualForm({...manualForm, status: e.target.value})}>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                      <option value="half_day">Half Day</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-5">
                    <button type="submit" className="w-full bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors">
                      Submit Attendance
                    </button>
                  </div>
                </form>
              </div>

              {/* Bulk Import */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">Bulk Import (Excel/CSV)</h2>
                <form onSubmit={handleUpload} className="flex flex-col gap-4">
                  <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center flex flex-col items-center justify-center bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer relative">
                    <Upload className="text-slate-400 mb-3" size={32} />
                    <p className="text-sm font-medium text-slate-700">Click to select file or drag and drop</p>
                    <p className="text-xs text-slate-500 mt-1">.xlsx, .xls, .csv</p>
                    <input 
                      type="file" 
                      accept=".xlsx,.xls,.csv" 
                      onChange={e => setFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                  {file && (
                    <div className="text-sm text-blue-600 font-medium">Selected: {file.name}</div>
                  )}
                  <button 
                    type="submit"
                    disabled={!file || uploading}
                    className="w-full bg-slate-800 hover:bg-slate-900 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {uploading ? 'Processing...' : 'Upload & Import Data'}
                  </button>
                </form>
              </div>
            </div>
          )}

          {!isAdmin && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 mb-6 text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold text-slate-800 mb-2">Self-Service Attendance</h2>
              <p className="text-slate-500 mb-8">Record your daily attendance easily. Please make sure to check in when you arrive and check out when you leave.</p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={handleCheckIn}
                  className="flex-1 max-w-xs flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  <CheckCircle size={24} /> Check In Now
                </button>
                <button 
                  onClick={handleCheckOut}
                  className="flex-1 max-w-xs flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
                >
                  <LogOut size={24} /> Check Out
                </button>
              </div>
            </div>
          )}

          {loading ? <SkeletonTable /> : <DataTable data={attendances} columns={columns} title="Attendance Register Logs" searchable={true} />}
        </>
      )}

    </Layout>
  );
}

