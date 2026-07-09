import React, { useState, useEffect } from 'react';
import Layout from '../layouts/Layout';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import { Plus } from 'lucide-react';

export default function Settings() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [holidays, setHolidays] = useState([]);
  const [leaveForm, setLeaveForm] = useState({ name: '', days_allowed: '' });
  const [holidayForm, setHolidayForm] = useState({ name: '', date: '', description: '' });

  const fetchSettings = async () => {
    try {
      const [leavesRes, holidaysRes] = await Promise.all([
        api.get('/leave-types'),
        api.get('/holidays')
      ]);
      setLeaveTypes(leavesRes.data);
      setHolidays(holidaysRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleAddLeaveType = async (e) => {
    e.preventDefault();
    try {
      await api.post('/leave-types', leaveForm);
      setLeaveForm({ name: '', days_allowed: '' });
      fetchSettings();
    } catch (err) { console.error(err); }
  };

  const handleAddHoliday = async (e) => {
    e.preventDefault();
    try {
      await api.post('/holidays', holidayForm);
      setHolidayForm({ name: '', date: '', description: '' });
      fetchSettings();
    } catch (err) { console.error(err); }
  };

  const leaveColumns = [
    { accessorKey: 'name', header: 'Leave Type', cell: info => <span className="font-medium text-slate-800">{info.getValue()}</span> },
    { accessorKey: 'days_allowed', header: 'Days Allowed', cell: info => <span className="text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs font-semibold">{info.getValue()} Days / Year</span> }
  ];

  const holidayColumns = [
    { accessorKey: 'name', header: 'Holiday Name', cell: info => <span className="font-medium text-slate-800">{info.getValue()}</span> },
    { accessorKey: 'date', header: 'Date', cell: info => <span className="text-slate-600">{new Date(info.getValue()).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}</span> },
    { accessorKey: 'description', header: 'Description' }
  ];

  return (
    <Layout>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">System Settings</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <span>Administration</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">Leave Types & Holidays</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Leave Types Section */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Add Leave Type</h2>
            <form onSubmit={handleAddLeaveType} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="w-full">
                <label className="block text-sm font-medium text-slate-700 mb-1">Type Name</label>
                <input required type="text" placeholder="e.g. Sick Leave" className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none" value={leaveForm.name} onChange={e => setLeaveForm({...leaveForm, name: e.target.value})} />
              </div>
              <div className="w-full sm:w-32">
                <label className="block text-sm font-medium text-slate-700 mb-1">Days</label>
                <input required type="number" placeholder="Days" className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none" value={leaveForm.days_allowed} onChange={e => setLeaveForm({...leaveForm, days_allowed: e.target.value})} />
              </div>
              <button className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap h-[42px]">
                Add Type
              </button>
            </form>
          </div>
          
          <DataTable data={leaveTypes} columns={leaveColumns} title="Configured Leave Types" searchable={false} />
        </div>

        {/* Holidays Section */}
        <div className="flex flex-col gap-6">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold text-slate-800 mb-4">Add Public Holiday</h2>
            <form onSubmit={handleAddHoliday} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Holiday Name</label>
                <input required type="text" placeholder="e.g. New Year" className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none" value={holidayForm.name} onChange={e => setHolidayForm({...holidayForm, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
                <input required type="date" className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none" value={holidayForm.date} onChange={e => setHolidayForm({...holidayForm, date: e.target.value})} />
              </div>
              <div className="sm:col-span-2 flex items-end gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                  <input type="text" placeholder="Holiday description" className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none" value={holidayForm.description} onChange={e => setHolidayForm({...holidayForm, description: e.target.value})} />
                </div>
                <button className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors whitespace-nowrap h-[42px]">
                  Add Holiday
                </button>
              </div>
            </form>
          </div>

          <DataTable data={holidays} columns={holidayColumns} title="Holiday Calendar" searchable={true} />
        </div>

      </div>
    </Layout>
  );
}

