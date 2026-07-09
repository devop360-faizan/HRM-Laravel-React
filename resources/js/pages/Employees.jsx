import React, { useState, useEffect } from 'react';
import Layout from '../layouts/Layout';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import { Skeleton, SkeletonTable } from '../components/Skeleton';
import { Plus, MoreVertical, ArrowLeft, Mail, Calendar, Briefcase, Building, PieChart as PieChartIcon, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import Modal from '../components/Modal';
import AttendanceCalendar from '../components/AttendanceCalendar';
import Swal from 'sweetalert2';

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'employee',
    designation_id: '', department_id: '', salary: '', 
    join_date: '', employment_status: 'probation', probation_end_date: ''
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, desigRes, deptRes] = await Promise.all([
        api.get('/employees'),
        api.get('/designations'),
        api.get('/departments')
      ]);
      setEmployees(empRes.data);
      setDesignations(desigRes.data);
      setDepartments(deptRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    try {
      await api.post('/employees', formData);
      fetchData();
      setShowAdd(false);
      setFormData({
        name: '', email: '', password: '', role: 'employee',
        designation_id: '', department_id: '', salary: '', 
        join_date: '', employment_status: 'probation', probation_end_date: ''
      });
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Employee registered successfully.',
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) { 
      console.error(err);
      Swal.fire('Error', 'Failed to register employee', 'error');
    }
  };

  const handleAction = async (employeeId, action, value = null) => {
    try {
      if (action === 'terminate') {
        const result = await Swal.fire({
          title: 'Terminate Employee?',
          text: "Are you sure you want to terminate this employee? This will stop their access.",
          icon: 'warning',
          showCancelButton: true,
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#94a3b8',
          confirmButtonText: 'Yes, Terminate'
        });
        if (result.isConfirmed) {
          await api.put(`/employees/${employeeId}`, { employment_status: 'terminated' });
          Swal.fire('Terminated!', 'Employee has been terminated.', 'success');
          fetchData();
        }
      } else if (action === 'extend_probation') {
        const { value: newDate } = await Swal.fire({
          title: 'Extend Probation',
          input: 'date',
          inputLabel: 'New Probation End Date',
          showCancelButton: true,
          inputValidator: (value) => {
            if (!value) return 'You need to choose a date!'
          }
        });
        if (newDate) {
          await api.put(`/employees/${employeeId}`, { probation_end_date: newDate, employment_status: 'probation' });
          Swal.fire('Extended!', 'Probation period extended.', 'success');
          fetchData();
        }
      } else if (action === 'make_permanent') {
        const result = await Swal.fire({
          title: 'Make Permanent?',
          text: "Are you sure you want to make this employee permanent?",
          icon: 'question',
          showCancelButton: true,
          confirmButtonColor: '#22c55e',
          cancelButtonColor: '#94a3b8',
          confirmButtonText: 'Yes, Make Permanent'
        });
        if (result.isConfirmed) {
          await api.put(`/employees/${employeeId}`, { employment_status: 'permanent' });
          Swal.fire('Success!', 'Employee is now permanent.', 'success');
          fetchData();
        }
      }
    } catch (err) {
      console.error(err);
      Swal.fire('Error', 'Failed to perform action', 'error');
    }
  };

  const viewEmployee = async (id) => {
    setProfileLoading(true);
    try {
      const { data } = await api.get(`/employees/${id}`);
      setSelectedEmployee(data);
    } catch (err) { console.error(err); } finally { setProfileLoading(false); }
  };

  const columns = [
    { 
      accessorKey: 'profile.employee_id', 
      header: 'Emp ID',
      cell: info => <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">{info.getValue() || 'N/A'}</span>
    },
    { 
      accessorKey: 'name', 
      header: 'Employee',
      cell: info => {
        const row = info.row.original;
        return (
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => viewEmployee(row.id)}>
            <img 
              src={row.avatar ? `/storage/${row.avatar}` : `https://ui-avatars.com/api/?name=${row.name}&background=random`} 
              alt="avatar" 
              className="w-8 h-8 rounded-full border border-slate-200 group-hover:border-sky-500 transition-colors object-cover" 
            />
            <div>
              <p className="font-semibold text-slate-800 leading-tight group-hover:text-sky-600 transition-colors">{row.name}</p>
              <p className="text-xs text-slate-500">{row.profile?.designation?.name || 'N/A'}</p>
            </div>
          </div>
        );
      }
    },
    { accessorKey: 'email', header: 'Email' },
    { 
      accessorKey: 'profile.department.name', 
      header: 'Department',
      cell: info => (
        <span className="text-slate-600 font-medium">
          {info.getValue() || 'N/A'}
        </span>
      )
    },
    { 
      accessorKey: 'profile.join_date', 
      header: 'Joining Date',
      cell: info => <span className="text-slate-600">{info.getValue()}</span>
    },
    {
      accessorKey: 'profile.employment_status',
      header: 'Status',
      cell: info => {
        const val = info.getValue() || 'unknown';
        const colors = {
          permanent: 'bg-green-100 text-green-700',
          probation: 'bg-yellow-100 text-yellow-700',
          terminated: 'bg-red-100 text-red-700'
        };
        return (
          <span className={`px-2.5 py-1 text-xs font-semibold rounded-md uppercase tracking-wider ${colors[val] || 'bg-slate-100 text-slate-700'}`}>
            {val}
          </span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: info => {
        const id = info.row.original.id;
        const status = info.row.original.profile?.employment_status;
        return (
          <div className="flex justify-end gap-2 items-center">
            <button 
              onClick={() => viewEmployee(id)} 
              title="View Profile"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors"
            >
              <Eye size={18} />
            </button>
            <button 
              onClick={() => {
                setSelectedEmployee({ id });
                setShowAttendanceModal(true);
              }} 
              title="View Attendance"
              className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              <Calendar size={18} />
            </button>
            {status !== 'terminated' && (
              <>
                <button 
                  onClick={() => handleAction(id, 'make_permanent')} 
                  title="Make Permanent"
                  className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors"
                >
                  <CheckCircle size={18} />
                </button>
                <button 
                  onClick={() => handleAction(id, 'extend_probation')} 
                  title="Extend Probation"
                  className="p-1.5 text-slate-400 hover:text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                >
                  <Clock size={18} />
                </button>
                <button 
                  onClick={() => handleAction(id, 'terminate')} 
                  title="Terminate"
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                >
                  <XCircle size={18} />
                </button>
              </>
            )}
          </div>
        );
      }
    }
  ];

  if (selectedEmployee && !showAttendanceModal) {
    const { employee, attendance_stats } = selectedEmployee;
    const chartData = [
      { name: 'Present', value: attendance_stats.present || 0, color: '#22c55e' },
      { name: 'Absent', value: attendance_stats.absent || 0, color: '#ef4444' },
      { name: 'Late', value: attendance_stats.late || 0, color: '#eab308' },
      { name: 'Half Day', value: attendance_stats.half_day || 0, color: '#0284c7' },
    ].filter(d => d.value > 0);

    return (
      <Layout>
        <button 
          onClick={() => setSelectedEmployee(null)}
          className="flex items-center gap-2 text-slate-500 hover:text-sky-600 mb-6 font-medium transition-colors"
        >
          <ArrowLeft size={18} /> Back to Directory
        </button>

        {profileLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Skeleton className="h-[400px] w-full" />
            <Skeleton className="h-[400px] w-full lg:col-span-2" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Profile Card */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4">
                <img src={employee.avatar ? `/storage/${employee.avatar}` : `https://ui-avatars.com/api/?name=${employee.name}&background=random`} className="w-full h-full rounded-full object-cover border-4 border-slate-50 shadow-md" alt="avatar" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{employee.name}</h2>
              <p className="text-sky-600 font-medium mb-1">{employee.profile?.designation?.name || 'No Designation'}</p>
              <div className="flex gap-2 items-center text-sm text-slate-500 mb-6">
                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-xs">{employee.profile?.employee_id}</span>
                <span className="uppercase text-[10px] font-bold tracking-wider px-2 py-0.5 rounded-full bg-green-100 text-green-700">{employee.profile?.employment_status}</span>
              </div>

              <div className="w-full space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Mail size={16} className="text-slate-400" /> {employee.email}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Building size={16} className="text-slate-400" /> {employee.profile?.department?.name || 'No Department'}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Calendar size={16} className="text-slate-400" /> Joined {new Date(employee.profile?.join_date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Briefcase size={16} className="text-slate-400" /> Role: {employee.roles?.[0]?.name}
                </div>
              </div>
            </div>

            {/* Right Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-3">About Me</h3>
                <p className="text-slate-600 leading-relaxed text-sm">
                  {employee.profile?.about_me || 'This employee has not added an about me section yet.'}
                </p>
              </div>

              {/* Attendance Chart */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <PieChartIcon size={20} className="text-sky-500" /> Current Month Attendance
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
            </div>
          </div>
        )}
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Employees Directory</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <span>Administration</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">Employees</span>
          </div>
        </div>
        <button 
          onClick={() => setShowAdd(true)} 
          className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Add Employee
        </button>
      </div>

      <Modal 
        isOpen={showAdd} 
        onClose={() => setShowAdd(false)} 
        title="Register New Employee"
        maxWidth="max-w-4xl"
      >
        <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
            <input required type="text" className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none" onChange={e => setFormData({...formData, name: e.target.value})} value={formData.name} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input required type="email" className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none" onChange={e => setFormData({...formData, email: e.target.value})} value={formData.email} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input required type="password" className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none" onChange={e => setFormData({...formData, password: e.target.value})} value={formData.password} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">System Role</label>
            <select className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none bg-white" onChange={e => setFormData({...formData, role: e.target.value})} value={formData.role}>
              <option value="employee">Employee</option>
              <option value="hr">HR</option>
              <option value="employer">Employer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <select required className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none bg-white" onChange={e => setFormData({...formData, department_id: e.target.value})} value={formData.department_id}>
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Designation</label>
            <select required className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none bg-white" onChange={e => setFormData({...formData, designation_id: e.target.value})} value={formData.designation_id}>
              <option value="">Select Designation</option>
              {designations
                .filter(d => !formData.department_id || d.department_id == formData.department_id)
                .map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Base Salary</label>
            <input required type="number" className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none" onChange={e => setFormData({...formData, salary: e.target.value})} value={formData.salary} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Joining Date</label>
            <input required type="date" className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none" onChange={e => setFormData({...formData, join_date: e.target.value})} value={formData.join_date} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Employment Status</label>
            <select className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none bg-white" onChange={e => setFormData({...formData, employment_status: e.target.value})} value={formData.employment_status}>
              <option value="probation">Probation</option>
              <option value="permanent">Permanent</option>
            </select>
          </div>

          {formData.employment_status === 'probation' && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Probation End Date</label>
              <input type="date" className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none" onChange={e => setFormData({...formData, probation_end_date: e.target.value})} value={formData.probation_end_date} />
            </div>
          )}
          
          <div className="col-span-full flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setShowAdd(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white px-8 py-2.5 rounded-lg font-medium transition-colors">
              Save Employee
            </button>
          </div>
        </form>
      </Modal>

      {loading ? <SkeletonTable /> : <DataTable data={employees} columns={columns} title="Active Employees" searchable={true} />}

      <Modal 
        isOpen={showAttendanceModal} 
        onClose={() => {
          setShowAttendanceModal(false);
          setSelectedEmployee(null);
        }} 
        title="Employee Attendance Calendar"
        maxWidth="max-w-4xl"
      >
        {selectedEmployee && <AttendanceCalendar employeeId={selectedEmployee.id} />}
      </Modal>
    </Layout>
  );
}

