import React, { useState, useEffect } from 'react';
import Layout from '../layouts/Layout';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import { SkeletonTable } from '../components/Skeleton';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import Swal from 'sweetalert2';

export default function Holidays() {
  const [holidays, setHolidays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', date: '', description: '' });

  const fetchHolidays = async () => {
    try {
      const { data } = await api.get('/holidays');
      setHolidays(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchHolidays(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/holidays/${editingId}`, formData);
      } else {
        await api.post('/holidays', formData);
      }
      setFormData({ name: '', date: '', description: '' });
      setShowForm(false);
      setEditingId(null);
      fetchHolidays();
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Holiday ${editingId ? 'updated' : 'created'} successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) { 
      console.error(err);
      Swal.fire('Error', 'Something went wrong', 'error');
    }
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name, date: item.date, description: item.description || '' });
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
        await api.delete(`/holidays/${id}`);
        fetchHolidays();
        Swal.fire('Deleted!', 'The holiday has been deleted.', 'success');
      } catch (err) { 
        console.error(err);
        Swal.fire('Error', 'Failed to delete holiday', 'error');
      }
    }
  };

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user?.roles?.some(r => ['admin', 'hr', 'employer'].includes(r.name));

  const columns = [
    { accessorKey: 'name', header: 'Holiday Name', cell: info => <span className="font-semibold text-slate-800">{info.getValue()}</span> },
    { accessorKey: 'date', header: 'Date', cell: info => <span className="text-slate-600">{new Date(info.getValue()).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span> },
    { accessorKey: 'description', header: 'Description', cell: info => <span className="text-slate-500">{info.getValue() || '-'}</span> },
    ...(isAdmin ? [{
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
    }] : [])
  ];

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Holiday Calendar</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <span>Main Menu</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">Holidays</span>
          </div>
        </div>
        {isAdmin && (
          <button 
            onClick={() => {
              setEditingId(null); 
              setFormData({ name: '', date: '', description: '' });
              setShowForm(true);
            }}
            className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={18} /> Add Holiday
          </button>
        )}
      </div>

      <Modal 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        title={editingId ? 'Edit Holiday' : 'Add Public Holiday'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Holiday Name</label>
            <input required type="text" className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Date</label>
            <input required type="date" className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
            <textarea className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
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

      {loading ? <SkeletonTable /> : <DataTable data={holidays} columns={columns} title="All Holidays" searchable={true} />}
    </Layout>
  );
}

