import React, { useState, useContext } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { AppContext } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Trash2, Edit2, Plus, X, Search, GraduationCap, Users } from 'lucide-react';

const emptyForm = { id: null, regNo: '', name: '', gender: 'Male', year: '2nd Year', section: 'Single', department: 'Mechanical' };

const ManageStudents = () => {
  const { students, addStudent, updateStudent, deleteStudent, showToast } = useContext(AppContext);

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

  const departments = [
    'Mechanical',
    'Automobile',
    'Civil',
    'Electrical and Electronic',
    'Electronics and Communication',
    'Computer',
    'Communication and Computer Networking',
  ];
  const years = ['2nd Year', '3rd Year'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateStudent(formData.id, formData);
      showToast('Student updated successfully');
    } else {
      addStudent(formData);
      showToast('Student added successfully');
    }
    setFormData(emptyForm);
    setIsEditing(false);
    setShowForm(false);
  };

  const handleEdit = (student) => {
    setFormData(student);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this student?')) {
      deleteStudent(id);
      showToast('Student deleted successfully', 'success');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowForm(false);
  };

  const filtered = students.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.regNo.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || s.department === deptFilter;
    const matchYear = yearFilter === 'All' || s.year === yearFilter;
    return matchSearch && matchDept && matchYear;
  });

  return (
    <PageWrapper title="Manage Students">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">All Students</h2>
            <p className="text-sm text-slate-400">{students.length} total students across all departments</p>
          </div>
        </div>
        {!showForm && (
          <Button
            onClick={() => { setShowForm(true); setIsEditing(false); setFormData(emptyForm); }}
            className="bg-violet-600 hover:bg-violet-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" /> Add New Student
          </Button>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {departments.map(dept => {
          const count = students.filter(s => s.department === dept).length;
          const colors = {
            'Mechanical':                         'bg-orange-50 text-orange-700 border-orange-200',
            'Automobile':                         'bg-yellow-50 text-yellow-700 border-yellow-200',
            'Civil':                              'bg-teal-50 text-teal-700 border-teal-200',
            'Electrical and Electronic':          'bg-amber-50 text-amber-700 border-amber-200',
            'Electronics and Communication':      'bg-purple-50 text-purple-700 border-purple-200',
            'Computer':                           'bg-blue-50 text-blue-700 border-blue-200',
            'Communication and Computer Networking': 'bg-green-50 text-green-700 border-green-200',
          };
          return (
            <div key={dept} className={`rounded-xl border px-4 py-3 text-center ${colors[dept]}`}>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs font-semibold mt-0.5">{dept}</p>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <Card className="mb-6 border-violet-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {isEditing ? <><Edit2 className="w-4 h-4 text-amber-500" /> Edit Student</> : <><Plus className="w-4 h-4 text-violet-600" /> Add New Student</>}
              </CardTitle>
              <button onClick={handleCancel} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Reg No</label>
                  <Input value={formData.regNo} onChange={e => setFormData({...formData, regNo: e.target.value})} required placeholder="e.g. 24MECH001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Student Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Department</label>
                  <Select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value, section: e.target.value === 'Computer' ? 'A' : 'Single'})}>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Gender</label>
                  <Select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Year</label>
                  <Select value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Section</label>
                  <Select value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})}>
                    {(formData.department === 'Computer' ? ['A', 'B'] : ['Single']).map(s => (
                      <option key={s} value={s}>{s === 'Single' ? 'Single Class' : `Section ${s}`}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="flex gap-3 mt-5 pt-4 border-t border-slate-100">
                <Button type="submit" className={`${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-violet-600 hover:bg-violet-700'} flex items-center gap-2`}>
                  {isEditing ? <><Edit2 className="w-4 h-4" /> Update Student</> : <><Plus className="w-4 h-4" /> Add Student</>}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Student Directory Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              Student Directory ({filtered.length})
            </CardTitle>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name or reg no..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 w-48"
                />
              </div>
              {/* Dept Filter */}
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
              >
                <option value="All">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {/* Year Filter */}
              <select
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
              >
                <option value="All">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Reg No</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Dept</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Sec</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                      No students found matching your filters.
                    </td>
                  </tr>
                ) : filtered.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-violet-50/40 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 font-medium">{student.regNo}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{student.name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-xs font-semibold">
                        {student.department}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{student.year}</td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">
                        {student.section}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        student.gender === 'Male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                      }`}>
                        {student.gender}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEdit(student)}
                        title="Edit Student"
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors mr-1"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        title="Delete Student"
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
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
    </PageWrapper>
  );
};

export default ManageStudents;
