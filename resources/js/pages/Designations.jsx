import React, { useState, useEffect } from 'react';
import Layout from '../layouts/Layout';
import api from '../api/axios';
import DataTable from '../components/DataTable';
import { SkeletonTable } from '../components/Skeleton';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import Modal from '../components/Modal';
import Swal from 'sweetalert2';

export default function Designations() {
  const [designations, setDesignations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ name: '', department_id: '' });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [desigRes, deptRes] = await Promise.all([
        api.get('/designations'),
        api.get('/departments')
      ]);
      setDesignations(desigRes.data);
      setDepartments(deptRes.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/designations/${editingId}`, formData);
      } else {
        await api.post('/designations', formData);
      }
      fetchData();
      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', department_id: '' });
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: `Designation ${editingId ? 'updated' : 'created'} successfully.`,
        timer: 2000,
        showConfirmButton: false
      });
    } catch (err) { 
      console.error(err);
      Swal.fire('Error', 'Something went wrong', 'error');
    }
  };

  const handleEdit = (designation) => {
    setFormData({ name: designation.name, department_id: designation.department_id || '' });
    setEditingId(designation.id);
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
        await api.delete(`/designations/${id}`);
        fetchData();
        Swal.fire('Deleted!', 'The designation has been deleted.', 'success');
      } catch (err) { 
        console.error(err);
        Swal.fire('Error', 'Failed to delete designation', 'error');
      }
    }
  };

  const columns = [
    { accessorKey: 'id', header: 'ID', cell: info => <span className="text-slate-500">#{info.getValue()}</span> },
    { accessorKey: 'name', header: 'Designation Name', cell: info => <span className="font-medium text-slate-800">{info.getValue()}</span> },
    { accessorKey: 'department.name', header: 'Department', cell: info => info.getValue() || 'N/A' },
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
          <h1 className="text-2xl font-bold text-slate-900">Designations</h1>
          <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
            <span>Administration</span>
            <span>/</span>
            <span className="text-slate-900 font-medium">Designations</span>
          </div>
        </div>
        <button 
          onClick={() => {
            setEditingId(null); 
            setFormData({ name: '', department_id: '' });
            setShowForm(true);
          }} 
          className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <Plus size={18} /> Add Designation
        </button>
      </div>

      <Modal 
        isOpen={showForm} 
        onClose={() => setShowForm(false)} 
        title={editingId ? 'Edit Designation' : 'Add New Designation'}
        maxWidth="max-w-xl"
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Designation Name</label>
            <input required type="text" className="w-full border border-slate-200 px-3 py-2 rounded-lg focus:border-sky-500 outline-none" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <select required className="w-full border border-slate-200 px-3 py-2 rounded-lg bg-white focus:border-sky-500 outline-none" value={formData.department_id} onChange={e => setFormData({...formData, department_id: e.target.value})}>
              <option value="">Select Department</option>
              {departments.map(d => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="col-span-full flex justify-end gap-2 mt-2 pt-4 border-t border-slate-100">
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition-colors">
              Cancel
            </button>
            <button type="submit" className="bg-sky-500 hover:bg-sky-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors">
              {editingId ? 'Update' : 'Save'}
            </button>
          </div>
        </form>
      </Modal>

      {loading ? <SkeletonTable /> : <DataTable data={designations} columns={columns} title="All Designations" searchable={true} />}
    </Layout>
  );
}

