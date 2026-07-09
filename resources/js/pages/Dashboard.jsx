import React, { useState, useEffect } from 'react';
import Layout from '../layouts/Layout';
import api from '../api/axios';
import { Upload, CheckCircle, LogOut, Clock as ClockIcon, TrendingUp, Users, UserPlus, Clock, CircleDollarSign, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LabelList } from 'recharts';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

export default function Dashboard() {
  const [analytics, setAnalytics] = useState({
    employee_status: { full_time: 0, contract: 0, probation: 0 },
    overview: { total_employees: 0, new_joinees: 0, today_late: 0, today_present: 0, today_absent: 0, pending_leaves: 0 },
    leave_distribution: [],
    attendance_trend: [],
    department_distribution: [],
    late_arrivals: [],
    pending_approvals: []
  });
  
  const [currentTime, setCurrentTime] = useState(new Date());

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user?.roles?.some(r => ['admin', 'hr', 'employer'].includes(r.name));

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAnalytics = async () => {
    if (!isAdmin) return;
    try {
      const response = await api.get('/dashboard/analytics');
      setAnalytics(response.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user?.id]);

  const handleCheckIn = async () => {
    try {
      await api.post('/attendances/check-in');
      Swal.fire('Checked In', 'Your check-in time has been recorded.', 'success');
    } catch (err) {
      Swal.fire('Notice', err.response?.data?.message || 'Failed to check in', 'warning');
    }
  };

  const handleCheckOut = async () => {
    try {
      await api.post('/attendances/check-out');
      Swal.fire('Checked Out', 'Your check-out time has been recorded.', 'success');
    } catch (err) {
      Swal.fire('Notice', err.response?.data?.message || 'Failed to check out', 'warning');
    }
  };

  const COLORS = ['#0284c7', '#22c55e', '#3b82f6', '#eab308', '#ef4444'];

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">HR Dashboard</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <span>Dashboard</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">HR Dashboard</span>
          </div>
        </div>
      </div>

      {isAdmin && (
        <div className="space-y-6">
          {/* Top Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Employee Status & Type */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Employee Status & Type</h3>
                <Link to="/employees" className="text-xs font-medium bg-slate-100 px-3 py-1 rounded text-slate-600 hover:bg-slate-200">View All</Link>
              </div>
              
              <div className="w-full h-8 flex rounded-sm overflow-hidden mb-6">
                <div style={{ width: `${(analytics.employee_status.full_time / Math.max(analytics.overview.total_employees, 1)) * 100}%` }} className="bg-sky-500 h-full border-r border-white"></div>
                <div style={{ width: `${(analytics.employee_status.contract / Math.max(analytics.overview.total_employees, 1)) * 100}%` }} className="bg-slate-400 h-full border-r border-white"></div>
                <div style={{ width: `${(analytics.employee_status.probation / Math.max(analytics.overview.total_employees, 1)) * 100}%` }} className="bg-slate-200 h-full"></div>
              </div>
              
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <p className="text-2xl font-bold text-slate-800">{analytics.employee_status.full_time}</p>
                  <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-4 bg-sky-500 rounded-sm"></span> Full-Time
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{analytics.employee_status.contract}</p>
                  <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-4 bg-slate-400 rounded-sm"></span> Contract
                  </p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-slate-800">{analytics.employee_status.probation}</p>
                  <p className="text-xs text-slate-500 flex items-center justify-center gap-1">
                    <span className="w-1.5 h-4 bg-slate-200 rounded-sm"></span> Probation
                  </p>
                </div>
              </div>
            </div>

            {/* Overview Statistics */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Overview Statistics</h3>
                <Link to="/attendance" className="text-xs font-medium border border-slate-200 px-3 py-1 rounded text-slate-600 flex items-center gap-1 hover:bg-slate-50 transition-colors">
                   View Attendance
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center p-3 rounded-lg border border-slate-100 hover:border-sky-200 transition-colors">
                  <div className="p-3 bg-sky-50 rounded-lg text-sky-500 mr-4">
                    <Users size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-medium mb-1">Total Employees</p>
                    <div className="flex items-end justify-between">
                      <p className="text-xl font-bold text-slate-800">{analytics.overview.total_employees}</p>
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">+10% <TrendingUp size={10} /></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-3 rounded-lg border border-slate-100 hover:border-sky-200 transition-colors">
                  <div className="p-3 bg-blue-50 rounded-lg text-blue-500 mr-4">
                    <UserPlus size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-medium mb-1">New Joinees</p>
                    <div className="flex items-end justify-between">
                      <p className="text-xl font-bold text-slate-800">{analytics.overview.new_joinees}</p>
                      <span className="text-[10px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">+22% <TrendingUp size={10} /></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-3 rounded-lg border border-slate-100 hover:border-sky-200 transition-colors">
                  <div className="p-3 bg-slate-800 rounded-lg text-white mr-4">
                    <Clock size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-medium mb-1">Late Arrivals Today</p>
                    <div className="flex items-end justify-between">
                      <p className="text-xl font-bold text-slate-800">{analytics.overview.today_late}</p>
                      <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">-16% <TrendingUp size={10} className="rotate-180" /></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-3 rounded-lg border border-slate-100 hover:border-sky-200 transition-colors">
                  <div className="p-3 bg-purple-50 rounded-lg text-purple-500 mr-4">
                    <CircleDollarSign size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-slate-500 font-medium mb-1">Pending Leaves</p>
                    <div className="flex items-end justify-between">
                      <p className="text-xl font-bold text-slate-800">{analytics.overview.pending_leaves}</p>
                      <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded flex items-center gap-0.5">Review</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Second Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Leave Type Distribution */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-slate-800">Leave Type Distribution</h3>
                <button className="text-xs font-medium border border-slate-200 px-2 py-1 rounded text-slate-600">Monthly</button>
              </div>
              <div className="h-48 flex items-center justify-center">
                {analytics.leave_distribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={analytics.leave_distribution}
                        cx="30%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {analytics.leave_distribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                      <Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-slate-400 text-sm">No leave data</p>
                )}
              </div>
            </div>

            {/* Attendance Trend */}
            <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Attendance Trend</h3>
                <button className="text-xs font-medium border border-slate-200 px-3 py-1 rounded text-slate-600">Weekly</button>
              </div>
              
              <div className="flex items-center gap-6 mb-4 border-b border-slate-100 pb-4">
                <div>
                  <span className="text-2xl font-bold text-slate-800 mr-2">{analytics.overview.today_present}</span>
                  <span className="text-xs text-slate-500 font-medium">On-Time</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-slate-800 mr-2">{analytics.overview.today_late}</span>
                  <span className="text-xs text-slate-500 font-medium">Late</span>
                </div>
                <div>
                  <span className="text-2xl font-bold text-slate-800 mr-2">{analytics.overview.today_absent}</span>
                  <span className="text-xs text-slate-500 font-medium">Absent</span>
                </div>
                <div className="ml-auto flex gap-3 text-xs font-medium">
                  <span className="flex items-center gap-1 text-slate-600"><div className="w-2 h-2 rounded bg-sky-500"></div> Present</span>
                  <span className="flex items-center gap-1 text-slate-600"><div className="w-2 h-2 rounded bg-slate-800"></div> Late</span>
                  <span className="flex items-center gap-1 text-slate-600"><div className="w-2 h-2 rounded bg-sky-300"></div> Absent</span>
                </div>
              </div>

              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[...analytics.attendance_trend].reverse()} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                    <Bar dataKey="present" stackId="a" fill="#0284c7" barSize={12} radius={[0, 0, 2, 2]} />
                    <Bar dataKey="late" stackId="a" fill="#1e293b" barSize={12} />
                    <Bar dataKey="absent" stackId="a" fill="#fdba74" barSize={12} radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Third Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Late Arrivals Today */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Late Arrivals Today</h3>
                <button className="text-xs font-medium border border-slate-200 px-2 py-1 rounded text-slate-600">Today</button>
              </div>
              
              <div className="space-y-4 flex-1 overflow-auto max-h-72 pr-2">
                {analytics.late_arrivals.length > 0 ? (
                  analytics.late_arrivals.map((late, i) => (
                    <div key={i} className="flex justify-between items-center p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-colors">
                      <div className="flex items-center gap-3">
                        <img src={late.avatar ? `/storage/${late.avatar}` : `https://ui-avatars.com/api/?name=${late.name}&background=random`} className="w-10 h-10 rounded-full object-cover border border-slate-200" alt="avatar" />
                        <div>
                          <p className="font-bold text-sm text-slate-800">{late.name}</p>
                          <p className="text-xs text-slate-500">{late.designation}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm text-slate-800">{late.time}</p>
                        <p className="text-xs font-bold text-red-500 bg-red-50 inline-block px-1.5 py-0.5 rounded mt-0.5">+{late.minutes_late} Min</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    No late arrivals today!
                  </div>
                )}
              </div>
            </div>

            {/* Department Distribution */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Top Departments</h3>
                <Link to="/departments" className="text-xs font-medium bg-slate-100 px-3 py-1 rounded text-slate-600 hover:bg-slate-200">View All</Link>
              </div>
              <div className="h-72">
                {analytics.department_distribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics.department_distribution.slice(0, 5)} margin={{ top: 20, right: 0, left: -20, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} interval={0} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#64748b' }} />
                      <RechartsTooltip cursor={{fill: '#f8fafc'}} />
                      <Bar dataKey="value" fill="#fb923c" barSize={30} radius={[4, 4, 0, 0]}>
                        <LabelList dataKey="value" position="top" fill="#64748b" fontSize={12} />
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    No data available
                  </div>
                )}
              </div>
            </div>

            {/* Pending Approvals */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-slate-800">Pending Approvals</h3>
                <Link to="/leaves" className="text-xs font-medium bg-slate-100 px-3 py-1 rounded text-slate-600 hover:bg-slate-200">View All</Link>
              </div>
              
              <div className="space-y-4 flex-1 overflow-auto max-h-72 pr-2">
                {analytics.pending_approvals.length > 0 ? (
                  analytics.pending_approvals.map((req, i) => (
                    <div key={i} className="flex flex-col p-3 rounded-lg hover:bg-slate-50 border border-slate-100 transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <img src={req.avatar ? `/storage/${req.avatar}` : `https://ui-avatars.com/api/?name=${req.name}&background=random`} className="w-8 h-8 rounded-full border border-slate-200" alt="avatar" />
                          <p className="font-bold text-sm text-slate-800">{req.name}</p>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{req.type}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
                        <span className="flex items-center gap-1"><Calendar size={12}/> {req.start_date} - {req.end_date}</span>
                        <span className="flex items-center gap-1"><Clock size={12}/> {req.days} days</span>
                      </div>
                      <div className="flex gap-2 mt-auto">
                        <button className="flex-1 bg-sky-500 hover:bg-sky-600 text-white text-xs font-medium py-1.5 rounded transition-colors">Approve</button>
                        <button className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium py-1.5 rounded transition-colors">Decline</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="h-full flex items-center justify-center text-sm text-slate-400">
                    No pending approvals!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900 text-white p-8 rounded-2xl shadow-lg border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-sky-400 to-sky-600"></div>
            <ClockIcon size={48} className="text-sky-500 mb-4 opacity-80" />
            <h2 className="text-5xl font-mono font-bold tracking-wider mb-2">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </h2>
            <p className="text-slate-400 font-medium tracking-wide uppercase text-sm">
              {currentTime.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Welcome back, {user.name}!</h2>
            <p className="text-slate-500 mb-8">Record your daily attendance easily. Please make sure to check in when you arrive and check out when you leave.</p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleCheckIn}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <CheckCircle size={24} /> Check In Now
              </button>
              <button 
                onClick={handleCheckOut}
                className="flex-1 flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-4 rounded-xl font-bold text-lg transition-all transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                <LogOut size={24} /> Check Out
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

