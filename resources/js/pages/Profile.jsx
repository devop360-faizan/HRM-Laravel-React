import React, { useState, useEffect } from 'react';
import Layout from '../layouts/Layout';
import api from '../api/axios';
import { Mail, Briefcase, Building, Calendar, Edit2, Upload, PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { Skeleton } from '../components/Skeleton';

export default function Profile() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || {});
  const [employeeData, setEmployeeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ about_me: '' });
  const [avatarUploading, setAvatarUploading] = useState(false);

  const isAdmin = user?.roles?.some(r => ['admin', 'hr', 'employer'].includes(r.name));

  const fetchProfile = async () => {
    try {
      const { data } = await api.get(`/employees/${user.id}`);
      setEmployeeData(data);
      setFormData({ about_me: data.employee.profile?.about_me || '' });
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fd = new FormData();
    fd.append('avatar', file);
    setAvatarUploading(true);

    try {
      const { data } = await api.post('/profile/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      // Update local storage
      const updatedUser = { ...user, avatar: data.avatar_url };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      fetchProfile();
    } catch (err) { console.error(err); } finally { setAvatarUploading(false); }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/profile/update', formData);
      setEditing(false);
      fetchProfile();
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <Layout>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-[400px] w-full" />
          <Skeleton className="h-[400px] w-full lg:col-span-2" />
        </div>
      </Layout>
    );
  }

  const { employee, attendance_stats } = employeeData || {};
  const chartData = [
    { name: 'Present', value: attendance_stats?.present || 0, color: '#22c55e' },
    { name: 'Absent', value: attendance_stats?.absent || 0, color: '#ef4444' },
    { name: 'Late', value: attendance_stats?.late || 0, color: '#eab308' },
    { name: 'Half Day', value: attendance_stats?.half_day || 0, color: '#0284c7' },
  ].filter(d => d.value > 0);

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <span>Main Menu</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">My Profile</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center relative overflow-hidden">
          <div className="w-full h-24 bg-gradient-to-r from-sky-400 to-sky-500 absolute top-0 left-0"></div>
          
          <div className="relative w-32 h-32 mb-4 mt-8 group">
            <img 
              src={employee?.avatar ? `/storage/${employee.avatar}` : `https://ui-avatars.com/api/?name=${employee?.name}&background=random`} 
              className="w-full h-full rounded-full object-cover border-4 border-white shadow-md relative z-10" 
              alt="avatar" 
            />
            <label className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-20">
              <Upload className="text-white" size={24} />
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={avatarUploading} />
            </label>
            {avatarUploading && (
              <div className="absolute inset-0 bg-white/80 rounded-full flex items-center justify-center z-30">
                <div className="w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          <h2 className="text-xl font-bold text-slate-900">{employee?.name}</h2>
          <p className="text-sky-600 font-medium mb-1">{employee?.profile?.designation?.name || 'No Designation'}</p>
          <div className="flex gap-2 items-center text-sm text-slate-500 mb-6">
            <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{employee?.profile?.employee_id}</span>
          </div>

          <div className="w-full space-y-4">
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Mail size={16} className="text-slate-400" /> {employee?.email}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Building size={16} className="text-slate-400" /> {employee?.profile?.department?.name || 'No Department'}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Calendar size={16} className="text-slate-400" /> Joined {employee?.profile?.join_date ? new Date(employee.profile.join_date).toLocaleDateString() : 'N/A'}
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-600">
              <Briefcase size={16} className="text-slate-400" /> {employee?.roles?.[0]?.name}
            </div>
          </div>
        </div>

        {/* Right Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* About */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-slate-900">About Me</h3>
              <button 
                onClick={() => setEditing(!editing)}
                className="text-slate-400 hover:text-sky-500 transition-colors"
              >
                <Edit2 size={18} />
              </button>
            </div>
            
            {editing ? (
              <form onSubmit={handleProfileUpdate}>
                <textarea 
                  className="w-full border border-slate-200 rounded-lg p-3 outline-none focus:border-sky-500 min-h-[120px] mb-3 text-slate-700"
                  value={formData.about_me}
                  onChange={e => setFormData({ ...formData, about_me: e.target.value })}
                  placeholder="Tell us about yourself..."
                ></textarea>
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setEditing(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 text-sm bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors">Save Changes</button>
                </div>
              </form>
            ) : (
              <p className="text-slate-600 leading-relaxed text-sm">
                {employee?.profile?.about_me || 'You have not added an about me section yet. Click the edit icon to add one.'}
              </p>
            )}
          </div>

          {/* Attendance Chart */}
          {!isAdmin && (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <PieChartIcon size={20} className="text-sky-500" /> My Current Month Attendance
              </h3>
              {chartData.length > 0 ? (
                <div className="flex flex-col md:flex-row items-center">
                  <div className="w-full md:w-1/2 h-64">
                    <ResponsiveContainer width="100%" height="100%">
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
                  </div>
                  <div className="w-full md:w-1/2 grid grid-cols-2 gap-4 mt-6 md:mt-0 p-4">
                    {chartData.map((stat, i) => (
                      <div key={i} className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col justify-center items-center">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{stat.name}</p>
                        <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                  No attendance records found for the current month.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

