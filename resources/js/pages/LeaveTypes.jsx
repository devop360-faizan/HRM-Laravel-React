import React, { useState, useEffect } from 'react';
import Layout from '../layouts/Layout';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import { SkeletonTable } from '../components/Skeleton';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import Swal from 'sweetalert2';

export default function LeaveTypes() {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', days_allowed: '' });

  const fetchLeaveTypes = async () => {
    try {
      const { data } = await api.get('/leave-types');
      setLeaveTypes(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchLeaveTypes(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/leave-types/${editingId}`, formData);
      } else {
        await api.post('/leave-types', formData);
      }
      setFormData({ name: '', days_allowed: '' });
      setShowForm(false);
      setEditingId(null);
      fetchLeaveTypes();
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Leave Policy ${editingId ? 'updated' : 'created'} successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) { 
      console.error(err);
      Swal.fire('Error', 'Something went wrong', 'error');
    }
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name, days_allowed: item.days_allowed });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      try {
        await api.delete(`/leave-types/${id}`);
        fetchLeaveTypes();
        Swal.fire('Deleted!', 'The leave policy has been deleted.', 'success');
      } catch (err) { 
        console.error(err);
        Swal.fire('Error', 'Failed to delete policy', 'error');
      }
    }
  };

  const columns = [
    { accessorKey: 'id', header: 'ID', cell: info => <span className="text-slate-500">#{info.getValue()}</span> },
    { accessorKey: 'name', header: 'Leave Type Name', cell: info => <span className="font-semibold text-slate-800">{info.getValue()}</span> },
    { accessorKey: 'days_allowed', header: 'Days Allowed per Year', cell: info => <span className="text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs font-semibold">{info.getValue()} Days</span> },
    {
      id: 'actions',
      header: 'Actions',
      cell: info => {
        const item = info.row.original;
        return (
          <div className="flex gap-2 justify-end">
            <button onClick={() => handleEdit(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={16} /></button>
            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
          </div>
        );
      }
    }
  ];

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Leave Policies</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <span>Administration</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">Leave Types</span>
          </div>
        </div>
        <button 
          onClick={() => {
            setEditingId(null); 
            setFormData({ name: '', days_allowed: '' });
            setShowForm(true);
          }}
          className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Add Leave Type
        </button>
      </div>

      <Modal 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        title={editingId ? 'Edit Policy' : 'Create New Policy'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Policy Name</label>
            <input required type="text" placeholder="e.g. Annual Leave" className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Days Allowed</label>
            <input required type="number" className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none" value={formData.days_allowed} onChange={e => setFormData({...formData, days_allowed: e.target.value})} />
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
              {editingId ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {loading ? <SkeletonTable /> : <DataTable data={leaveTypes} columns={columns} title="Configured Leave Types" searchable={true} />}
    </Layout>
  );
}

