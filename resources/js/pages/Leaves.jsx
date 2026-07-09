import React, { useState, useEffect } from 'react';
import Layout from '../layouts/Layout';
import api from '../api/axios';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import DataTable from '../components/DataTable';
import { Plus } from 'lucide-react';

const leaveSchema = z.object({
  start_date: z.string().min(1, 'Start date is required'),
  end_date: z.string().min(1, 'End date is required'),
  reason: z.string().optional(),
});

export default function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user.roles?.some(r => ['admin', 'hr', 'employer'].includes(r.name));

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(leaveSchema)
  });

  const fetchLeaveTypes = async () => {
    try {
      const { data } = await api.get('/leave-types');
      setLeaveTypes(data);
    } catch (err) { console.error(err); }
  };

  const fetchLeaves = async () => {
    try {
      const endpoint = isAdmin ? '/leaves/all' : '/leaves';
      const { data } = await api.get(endpoint);
      setLeaves(data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchLeaves();
    fetchLeaveTypes();
  }, []);

  const onSubmit = async (data) => {
    try {
      await api.post('/leaves', data);
      fetchLeaves();
      setShowForm(false);
      reset();
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/leaves/${id}/status`, { status });
      fetchLeaves();
    } catch (err) { console.error(err); }
  };

  const columns = [
    ...(isAdmin ? [{
      accessorKey: 'user.name',
      header: 'Employee',
      cell: info => {
        return (
          <div className="flex items-center gap-3">
            <img src={`https://ui-avatars.com/api/?name=${info.getValue()}&background=random`} alt="avatar" className="w-8 h-8 rounded-full" />
            <span className="font-semibold text-slate-800">{info.getValue()}</span>
          </div>
        );
      }
    }] : []),
    {
      accessorKey: 'leave_type.name',
      header: 'Type',
      cell: info => <span className="font-medium text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md text-xs tracking-wide">{info.getValue() || 'N/A'}</span>
    },
    { accessorKey: 'start_date', header: 'Start Date', cell: info => <span className="text-slate-600">{info.getValue()}</span> },
    { accessorKey: 'end_date', header: 'End Date', cell: info => <span className="text-slate-600">{info.getValue()}</span> },
    { accessorKey: 'reason', header: 'Reason', cell: info => <span className="text-slate-500 max-w-[200px] truncate block" title={info.getValue()}>{info.getValue()}</span> },
    {
      accessorKey: 'status',
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        const colors = {
          approved: 'bg-green-100 text-green-700',
          rejected: 'bg-red-100 text-red-700',
          pending: 'bg-yellow-100 text-yellow-700',
        };
        return (
          <span className={`px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider ${colors[status] || colors.pending}`}>
            {status}
          </span>
        );
      }
    },
    ...(isAdmin ? [{
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        row.original.status === 'pending' ? (
          <div className="flex gap-2 justify-end">
            <button 
              onClick={() => updateStatus(row.original.id, 'approved')}
              className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded font-medium transition-colors"
            >
              Approve
            </button>
            <button 
              onClick={() => updateStatus(row.original.id, 'rejected')}
              className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded font-medium transition-colors"
            >
              Reject
            </button>
          </div>
        ) : null
      )
    }] : [])
  ];

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Management</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <span>Main Menu</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">Leaves</span>
          </div>
        </div>
        
        {!isAdmin && (
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            {showForm ? 'Cancel' : <><Plus size={18} /> Apply for Leave</>}
          </button>
        )}
      </div>

      {showForm && !isAdmin && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <h2 className="text-lg font-semibold text-slate-800 mb-4">New Leave Request</h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
                <input 
                  type="date" 
                  {...register('start_date')} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-sky-500 outline-none transition-all"
                />
                {errors.start_date && <p className="text-red-500 text-xs mt-1">{errors.start_date.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
                <input 
                  type="date" 
                  {...register('end_date')} 
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-sky-500 outline-none transition-all"
                />
                {errors.end_date && <p className="text-red-500 text-xs mt-1">{errors.end_date.message}</p>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Reason (Optional)</label>
              <textarea 
                {...register('reason')} 
                rows="3"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:border-sky-500 outline-none transition-all resize-none"
                placeholder="Brief reason for your leave..."
              />
            </div>
            <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
              Submit Request
            </button>
          </form>
        </div>
      )}

      <DataTable data={leaves} columns={columns} title={isAdmin ? "All Leave Requests" : "My Leave Requests"} />
    </Layout>
  );
}

