import React, { useState, useContext } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { AppContext } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Eye, Search, GraduationCap, Edit, Plus, Trash2, X, Info, Calendar, Percent, UserMinus, AlertCircle } from 'lucide-react';

const FacultyManageStudents = () => {
  const { auth, students, detailedSessions, attendance, submitStudentRequest, showToast } = useContext(AppContext);
  const deptStudents = students.filter(s => s.department === auth.user.department);
  
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');

  // Edit Members State
  const [isEditMode, setIsEditMode] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [addForm, setAddForm] = useState({ regNo: '', name: '', gender: 'Male', year: '1st Year', section: 'Single' });

  // Delete Reason Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [deleteReason, setDeleteReason] = useState('');

  // View Data Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const isComputer = auth.user.department === 'Computer';
  const years = ['All', '1st Year', '2nd Year', '3rd Year'];
  const sections = isComputer ? ['All', 'A', 'B'] : ['All', 'Single'];

  const filtered = deptStudents.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.regNo.toLowerCase().includes(search.toLowerCase());
    const matchYear = yearFilter === 'All' || s.year === yearFilter;
    const matchSection = sectionFilter === 'All' || s.section === sectionFilter;
    return matchSearch && matchYear && matchSection;
  });

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!addForm.regNo.trim() || !addForm.name.trim()) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    // Submit Add Student Request to HOD
    submitStudentRequest({
      requestType: 'ADD',
      regNo: addForm.regNo.toUpperCase(),
      name: addForm.name.toUpperCase(),
      gender: addForm.gender,
      year: addForm.year,
      section: addForm.section,
      department: auth.user.department,
      reason: 'New admission / enrollment'
    });

    // Reset Form
    setAddForm({ regNo: '', name: '', gender: 'Male', year: '2nd Year', section: isComputer ? 'A' : 'Single' });
    setShowAddForm(false);
  };

  const openDeleteModal = (student) => {
    setStudentToDelete(student);
    setDeleteReason('');
    setShowDeleteModal(true);
  };

  const handleDeleteSubmit = (e) => {
    e.preventDefault();
    if (!deleteReason.trim()) {
      showToast('Please enter a reason for removal', 'error');
      return;
    }

    // Submit Delete Student Request to HOD
    submitStudentRequest({
      requestType: 'DELETE',
      regNo: studentToDelete.regNo,
      name: studentToDelete.name,
      gender: studentToDelete.gender,
      year: studentToDelete.year,
      section: studentToDelete.section,
      department: studentToDelete.department,
      reason: deleteReason
    });

    setShowDeleteModal(false);
    setStudentToDelete(null);
    setDeleteReason('');
  };

  const openViewModal = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  // Calculations for attendance details of selected student
  const getAttendanceStats = (student) => {
    if (!student) return { workingDays: 0, absentDays: 0, presentDays: 0, percentage: 100, leaveDates: [] };

    // Total working days for this class
    const classSessions = attendance.submittedSessions.filter(s => 
      s.department === student.department && 
      s.year === student.year && 
      s.section === student.section && 
      s.status === 'Approved'
    );
    const workingDays = classSessions.length;

    // Absent days from detailed session history
    const absentSessions = detailedSessions.filter(s => 
      s.department === student.department && 
      s.year === student.year && 
      s.section === student.section && 
      s.status === 'Approved' && 
      s.absenteesList.some(abs => abs.regNo === student.regNo)
    );
    const absentDays = absentSessions.length;
    const presentDays = Math.max(0, workingDays - absentDays);

    const percentage = workingDays > 0 
      ? Math.round((presentDays / workingDays) * 100 * 100) / 100 
      : 100;

    const leaveDates = absentSessions.map(s => s.date).sort((a, b) => new Date(b) - new Date(a));

    return { workingDays, absentDays, presentDays, percentage, leaveDates };
  };

  const stats = getAttendanceStats(selectedStudent);

  return (
    <PageWrapper title="Student Details">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Department: {auth.user.department}
            </h2>
            <p className="text-sm text-slate-400">{deptStudents.length} students enrolled</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => setIsEditMode(!isEditMode)}
            className={`flex items-center gap-2 ${
              isEditMode 
                ? 'bg-amber-600 hover:bg-amber-700 text-white' 
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            }`}
          >
            {isEditMode ? (
              <>
                <Eye className="w-4 h-4" /> Exit Edit Mode
              </>
            ) : (
              <>
                <Edit className="w-4 h-4" /> Edit Members
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Edit Members Banner / Add Student Section */}
      {isEditMode && (
        <Card className="mb-6 border-dashed border-amber-300 bg-amber-50/20 shadow-sm animate-in fade-in duration-200">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h4 className="font-bold text-amber-900">Member Edit Mode Active</h4>
                  <p className="text-sm text-amber-700">
                    Additions or removals require approval from the Department HOD.
                  </p>
                </div>
              </div>
              {!showAddForm && (
                <Button 
                  onClick={() => setShowAddForm(true)} 
                  className="bg-amber-600 hover:bg-amber-700 text-white flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Request Add Student
                </Button>
              )}
            </div>

            {/* Add Student Form */}
            {showAddForm && (
              <form onSubmit={handleAddSubmit} className="mt-6 p-4 border border-amber-200 rounded-xl bg-white space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <h5 className="font-bold text-slate-800 flex items-center gap-2">
                    <Plus className="w-4 h-4 text-indigo-600" /> Request Student Add
                  </h5>
                  <button 
                    type="button" 
                    onClick={() => setShowAddForm(false)} 
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4.5 h-4.5" />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Reg No</label>
                    <Input 
                      value={addForm.regNo} 
                      onChange={e => setAddForm({ ...addForm, regNo: e.target.value })} 
                      required 
                      placeholder="e.g. 25COMP001"
                      className="text-sm py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Full Name</label>
                    <Input 
                      value={addForm.name} 
                      onChange={e => setAddForm({ ...addForm, name: e.target.value })} 
                      required 
                      placeholder="Full Name"
                      className="text-sm py-1.5"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                    <Select 
                      value={addForm.gender} 
                      onChange={e => setAddForm({ ...addForm, gender: e.target.value })}
                      className="text-sm py-1.5"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Year</label>
                    <Select 
                      value={addForm.year} 
                      onChange={e => setAddForm({ ...addForm, year: e.target.value })}
                      className="text-sm py-1.5"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                    </Select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Section</label>
                    <Select 
                      value={addForm.section} 
                      onChange={e => setAddForm({ ...addForm, section: e.target.value })}
                      className="text-sm py-1.5"
                    >
                      {(isComputer ? ['A', 'B'] : ['Single']).map(s => (
                        <option key={s} value={s}>{s === 'Single' ? 'Single Class' : `Section ${s}`}</option>
                      ))}
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" size="sm" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    Send Request to HOD
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Student Directory Card */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle>Student Directory ({filtered.length})</CardTitle>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name or reg no..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-300 w-48"
                />
              </div>
              {/* Year Filter */}
              <select
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {years.map(y => <option key={y} value={y}>{y === 'All' ? 'All Years' : y}</option>)}
              </select>
              {/* Section Filter */}
              <select
                value={sectionFilter}
                onChange={e => setSectionFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
              >
                {sections.map(s => <option key={s} value={s}>{s === 'All' ? 'All Sections' : (s === 'Single' ? 'Single Class' : `Section ${s}`)}</option>)}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Reg No</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Section</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                      No students found matching your filters.
                    </td>
                  </tr>
                ) : filtered.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-indigo-50/40 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 font-medium">{student.regNo}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{student.name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        student.gender === 'Male'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-pink-50 text-pink-700'
                      }`}>
                        {student.gender}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{student.year}</td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">
                        {student.section}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewModal(student)}
                          className="text-xs px-2.5 py-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-bold flex items-center gap-1 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Data
                        </Button>
                        
                        {isEditMode && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openDeleteModal(student)}
                            className="text-xs px-2.5 py-1 text-rose-600 border-rose-200 hover:bg-rose-50 font-bold flex items-center gap-1 shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5 mr-1" /> Remove
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Footer note */}
          {!isEditMode && (
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
              <Info className="w-3.5 h-3.5" />
              <span>You have <strong>view-only</strong> access to student records by default. Click "Edit Members" at the top to submit student additions or deletions to HOD.</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Reason Modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-150">
            <CardHeader className="bg-gradient-to-r from-rose-50 to-red-50/50 border-b border-rose-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-rose-800 flex items-center gap-2 text-base font-bold">
                  <UserMinus className="w-5 h-5 text-rose-600" />
                  Remove Student
                </CardTitle>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="text-rose-400 hover:text-rose-600 hover:bg-rose-100/50 p-1.5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <div className="text-xs text-slate-400 font-semibold uppercase">Student to Remove</div>
                <div className="text-slate-800 font-bold mt-0.5">{studentToDelete.name}</div>
                <div className="text-xs text-slate-500 font-mono mt-0.5">{studentToDelete.regNo} ({studentToDelete.year} - {studentToDelete.section})</div>
              </div>

              <form onSubmit={handleDeleteSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Reason for removal <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows="3"
                    value={deleteReason}
                    onChange={e => setDeleteReason(e.target.value)}
                    placeholder="Provide a detailed reason for student removal (e.g. Long absent, Discontinued, Transferred)..."
                    className="w-full p-2.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-rose-300 focus:border-rose-400 resize-none"
                  ></textarea>
                </div>
                <div className="flex gap-2 justify-end pt-2 border-t border-slate-100">
                  <Button type="button" variant="outline" onClick={() => setShowDeleteModal(false)} className="text-slate-600">
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                    Submit Request to HOD
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* View Data Modal */}
      {showViewModal && selectedStudent && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-xl shadow-2xl animate-in zoom-in-95 duration-150 border-indigo-100">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50/50 border-b border-indigo-100">
              <div className="flex items-center justify-between">
                <CardTitle className="text-indigo-800 flex items-center gap-2 text-base font-bold">
                  <GraduationCap className="w-5 h-5 text-indigo-600" />
                  Attendance Summary: {selectedStudent.name}
                </CardTitle>
                <button 
                  onClick={() => setShowViewModal(false)}
                  className="text-indigo-400 hover:text-indigo-600 hover:bg-indigo-100/50 p-1.5 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-500 font-mono mt-1">
                Reg No: {selectedStudent.regNo} | {selectedStudent.year} - Sec {selectedStudent.section}
              </p>
            </CardHeader>
            <CardContent className="pt-5 space-y-5">
              {/* Widgets Row */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-slate-400 flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" /> Working Days
                  </div>
                  <div className="text-xl font-bold text-slate-700 mt-1">{stats.workingDays}</div>
                </div>
                <div className="bg-rose-50/55 border border-rose-100/50 rounded-xl p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-rose-500 flex items-center justify-center gap-1">
                    <Calendar className="w-3 h-3 text-rose-400" /> Days Absent
                  </div>
                  <div className="text-xl font-bold text-rose-600 mt-1">{stats.absentDays}</div>
                </div>
                <div className="bg-indigo-50/50 border border-indigo-100/40 rounded-xl p-3 text-center">
                  <div className="text-[10px] uppercase font-bold text-indigo-500 flex items-center justify-center gap-1">
                    <Percent className="w-3 h-3 text-indigo-400" /> Percentage
                  </div>
                  <div className="text-xl font-bold text-indigo-600 mt-1">{stats.percentage}%</div>
                </div>
              </div>

              {/* Formula Pattern Box */}
              <div className="p-4 bg-gradient-to-r from-indigo-50/30 to-blue-50/20 border border-indigo-100/50 rounded-xl">
                <h6 className="text-xs font-bold text-indigo-800 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                  <Percent className="w-3.5 h-3.5 text-indigo-600" /> Attendance Percentage Formula Pattern
                </h6>
                <div className="font-mono text-xs text-slate-600 bg-white border border-slate-100 p-3 rounded-lg space-y-2">
                  <div>
                    <span className="text-indigo-600 font-semibold">Formula:</span> ((Working Days - Days Absent) / Working Days) * 100
                  </div>
                  <div className="border-t border-slate-100 pt-2">
                    <span className="text-emerald-600 font-semibold">Calculation:</span> (({stats.workingDays} - {stats.absentDays}) / {stats.workingDays}) * 100
                  </div>
                  <div>
                    <span className="text-emerald-600 font-semibold">Result:</span> {stats.percentage}%
                  </div>
                </div>
              </div>

              {/* Leave Dates History */}
              <div>
                <h6 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">
                  Leave Dates / Absent Dates ({stats.leaveDates.length})
                </h6>
                {stats.leaveDates.length === 0 ? (
                  <div className="p-6 text-center text-slate-400 text-sm bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    Perfect attendance! No leave dates recorded.
                  </div>
                ) : (
                  <div className="max-h-40 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-50 bg-white">
                    {stats.leaveDates.map((d, index) => (
                      <div key={index} className="flex justify-between items-center px-4 py-2.5 text-sm hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span className="font-semibold text-slate-700">{d}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-full text-xs font-medium">
                          Absent
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-1">
                <Button onClick={() => setShowViewModal(false)} className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm">
                  Close Summary
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

    </PageWrapper>
  );
};

export default FacultyManageStudents;
