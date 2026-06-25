import React, { useState, useContext } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { AppContext } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Eye, Search, GraduationCap, CheckCircle2, XCircle, Clock, Calendar, Percent, X } from 'lucide-react';

const HodManageStudents = () => {
  const { auth, students, studentRequests, detailedSessions, attendance, approveStudentRequest, rejectStudentRequest } = useContext(AppContext);
  
  const hodDept = auth.user.department;
  const deptStudents = students.filter(s => s.department === hodDept);

  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');

  // View Data Modal State
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);

  const isComputer = hodDept === 'Computer';
  const years = ['All', '1st Year', '2nd Year', '3rd Year'];
  const sections = isComputer ? ['All', 'A', 'B'] : ['All', 'Single'];

  // Filter requests for HOD's department
  const pendingRequests = studentRequests.filter(r => r.department === hodDept && r.status === 'Pending');

  const filteredStudents = deptStudents.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.regNo.toLowerCase().includes(search.toLowerCase());
    const matchYear = yearFilter === 'All' || s.year === yearFilter;
    const matchSection = sectionFilter === 'All' || s.section === sectionFilter;
    return matchSearch && matchYear && matchSection;
  });

  const openViewModal = (student) => {
    setSelectedStudent(student);
    setShowViewModal(true);
  };

  const getAttendanceStats = (student) => {
    if (!student) return { workingDays: 0, absentDays: 0, presentDays: 0, percentage: 100, leaveDates: [] };

    const classSessions = attendance.submittedSessions.filter(s => 
      s.department === student.department && 
      s.year === student.year && 
      s.section === student.section && 
      s.status === 'Approved'
    );
    const workingDays = classSessions.length;

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
    <PageWrapper title="Student Requests & Directory">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-800">
            Department: {hodDept}
          </h2>
          <p className="text-sm text-slate-400">{deptStudents.length} students enrolled</p>
        </div>
      </div>

      {/* Pending Student Add/Delete Requests */}
      <section className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-bold text-slate-800">Pending Student Change Requests ({pendingRequests.length})</h3>
        </div>

        {pendingRequests.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
            <CardContent className="p-8 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-emerald-400 opacity-60" />
              <p className="font-semibold text-slate-600">No Pending Requests</p>
              <p className="text-xs">All student addition or deletion requests have been processed.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingRequests.map(req => (
              <Card key={req.id} className="border-l-4 border-l-amber-500 shadow-sm">
                <CardHeader className="bg-slate-50/50 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    req.requestType === 'ADD' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-rose-50 text-rose-700 border border-rose-100'
                  }`}>
                    {req.requestType === 'ADD' ? 'Addition Request' : 'Removal Request'}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {req.createdAt ? new Date(req.createdAt).toLocaleDateString() : ''}
                  </span>
                </CardHeader>
                <CardContent className="pt-4 space-y-3">
                  <div>
                    <div className="text-sm font-bold text-slate-800">{req.name}</div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">{req.regNo} ({req.year} - {req.section})</div>
                  </div>

                  {req.requestType === 'DELETE' && (
                    <div className="p-2.5 bg-rose-50/40 border border-rose-100 rounded-lg text-xs text-rose-800">
                      <strong className="block text-rose-900 mb-0.5">Reason for Removal:</strong>
                      {req.reason}
                    </div>
                  )}

                  <div className="flex gap-2 justify-end pt-2 border-t border-slate-50">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => rejectStudentRequest(req.id)}
                      className="text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" /> Reject
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={() => approveStudentRequest(req.id)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Directory Section */}
      <section>
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <CardTitle>Department Directory ({filteredStudents.length})</CardTitle>
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
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
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
                  {filteredStudents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                        No students found matching your filters.
                      </td>
                    </tr>
                  ) : filteredStudents.map((student, idx) => (
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
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openViewModal(student)}
                          className="text-xs px-2.5 py-1 text-indigo-600 border-indigo-200 hover:bg-indigo-50 font-bold flex items-center gap-1 shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" /> View Data
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

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

export default HodManageStudents;
