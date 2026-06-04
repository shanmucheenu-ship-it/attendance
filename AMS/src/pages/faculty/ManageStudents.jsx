import React, { useState, useContext } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { AppContext } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Eye, Search, GraduationCap } from 'lucide-react';

const StudentDetails = () => {
  const { auth, students } = useContext(AppContext);
  const deptStudents = students.filter(s => s.department === auth.user.department);
  const [search, setSearch] = useState('');
  const [yearFilter, setYearFilter] = useState('All');
  const [sectionFilter, setSectionFilter] = useState('All');

  const isComputer = auth.user.department === 'Computer';
  const years = ['All', '2nd Year', '3rd Year'];
  const sections = isComputer ? ['All', 'A', 'B'] : ['All', 'Single'];

  const filtered = deptStudents.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.regNo.toLowerCase().includes(search.toLowerCase());
    const matchYear = yearFilter === 'All' || s.year === yearFilter;
    const matchSection = sectionFilter === 'All' || s.section === sectionFilter;
    return matchSearch && matchYear && matchSection;
  });

  return (
    <PageWrapper title="Student Details">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
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
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-200">
          <Eye className="w-3.5 h-3.5" /> View Only
        </span>
      </div>

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
                  <th className="px-4 py-3">Department</th>
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
                    <td className="px-4 py-3 text-slate-600">{student.department}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Footer note */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-400">
            <Eye className="w-3.5 h-3.5" />
            <span>You have <strong>view-only</strong> access to student records. Contact Super Admin to add, edit, or delete students.</span>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
};

export default StudentDetails;
