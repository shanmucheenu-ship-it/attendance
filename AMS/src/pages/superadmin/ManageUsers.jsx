import React, { useState, useContext } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { AppContext } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Trash2, Edit2 } from 'lucide-react';

const ManageUsers = () => {
  const { users, addUser, updateUser, deleteUser, showToast } = useContext(AppContext);
  const [formData, setFormData] = useState({ id: null, name: '', department: 'Mechanical', username: '', password: '', role: 'faculty' });
  const [isEditing, setIsEditing] = useState(false);

  const departments = [
    'Mechanical',
    'Automobile',
    'Civil',
    'Electrical and Electronic',
    'Electronics and Communication',
    'Computer',
    'Communication and Computer Networking',
    'All'
  ];
  const roles = ['faculty', 'hod', 'admin'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateUser(formData.id, formData);
      showToast('User updated successfully');
    } else {
      addUser(formData);
      showToast('User added successfully');
    }
    setFormData({ id: null, name: '', department: 'Mechanical', username: '', password: '', role: 'faculty' });
    setIsEditing(false);
  };

  const handleEdit = (user) => {
    setFormData(user);
    setIsEditing(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      deleteUser(id);
      showToast('User deleted successfully', 'success');
    }
  };

  return (
    <PageWrapper title="Manage Users">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit User' : 'Create New User'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Name</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Full Name" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Role</label>
                <Select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
                  {roles.map(r => <option key={r} value={r}>{r.toUpperCase()}</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Department</label>
                <Select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}>
                  {departments.map(d => <option key={d} value={d}>{d}</option>)}
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Username</label>
                <Input value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} required placeholder="Username" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Password</label>
                <Input value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} required placeholder="Password" />
              </div>
              <div className="flex space-x-2 pt-2">
                <Button type="submit" className="w-full">{isEditing ? 'Update User' : 'Add User'}</Button>
                {isEditing && (
                  <Button type="button" variant="outline" onClick={() => { setIsEditing(false); setFormData({ id: null, name: '', department: 'Mechanical', username: '', password: '', role: 'faculty' }); }}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>User Directory</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Role</th>
                    <th className="px-4 py-3">Dept</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-gray">
                  {users.filter(u => u.role !== 'superadmin').map(user => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-text-primary">{user.name}</td>
                      <td className="px-4 py-3 text-text-secondary uppercase">{user.role}</td>
                      <td className="px-4 py-3 text-text-secondary">{user.department}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleEdit(user)} className="p-1 text-blue-600 hover:bg-blue-50 rounded">
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-1 text-red-600 hover:bg-red-50 rounded ml-2">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default ManageUsers;
