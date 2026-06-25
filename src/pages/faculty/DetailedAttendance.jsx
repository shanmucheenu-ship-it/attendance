import React, { useState, useContext, useEffect } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { AppContext } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Send, Clock, Users } from 'lucide-react';

const DetailedAttendance = () => {
  const { auth, students, detailedSessions, submitDetailedAttendance, showToast } = useContext(AppContext);

  const departments = [
    'Mechanical',
    'Automobile',
    'Civil',
    'Electrical and Electronic',
    'Electronics and Communication',
    'Computer',
    'Communication and Computer Networking',
  ];
  const years = ['1st Year', '2nd Year', '3rd Year'];
  
  const facultyDept = auth.user?.department || departments[0];
  const [selectedDept, setSelectedDept] = useState(facultyDept);
  const [selectedYear, setSelectedYear] = useState('');

  const isComputer = facultyDept === 'Computer' || selectedDept === 'Computer';
  const sections = isComputer ? ['A', 'B'] : ['Single'];

  const [selectedSection, setSelectedSection] = useState(isComputer ? '' : 'Single');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [attendanceList, setAttendanceList] = useState([]);

  // Fetch students when department, year, or section changes
  useEffect(() => {
    if (selectedDept && selectedYear && selectedSection) {
      const filteredStudents = students.filter(s => 
        s.department === selectedDept && 
        s.year === selectedYear && 
        s.section === selectedSection
      ).map(s => ({
        ...s,
        status: 'Present' // Default to Present
      }));
      const timer = setTimeout(() => {
        setAttendanceList(filteredStudents);
      }, 0);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setAttendanceList([]);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [selectedDept, selectedYear, selectedSection, students]);

  const toggleAttendance = (regNo) => {
    setAttendanceList(prev => 
      prev.map(student => 
        student.regNo === regNo 
          ? { ...student, status: student.status === 'Present' ? 'Absent' : 'Present' }
          : student
      )
    );
  };

  const absenteesCount = attendanceList.filter(s => s.status === 'Absent').length;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!selectedDept || !selectedYear || !selectedSection || attendanceList.length === 0) {
      showToast('Please fill all fields and ensure there are students.', 'error');
      return;
    }

    const absentees = attendanceList.filter(s => s.status === 'Absent').map(s => ({
      regNo: s.regNo,
      name: s.name,
      gender: s.gender
    }));

    const sessionData = {
      date,
      department: selectedDept,
      year: selectedYear,
      section: selectedSection,
      absenteesCount,
      absenteesList: absentees,
      submittedBy: auth.user?.username || 'faculty',
    };

    submitDetailedAttendance(sessionData);

    // Reset Form
    setSelectedYear('');
    setSelectedSection(isComputer ? '' : 'Single');
    setAttendanceList([]);
  };

  const history = detailedSessions
    .filter(s => s.department === selectedDept)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <PageWrapper title="Detailed Attendance">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Form & Table */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-md border-indigo-100">
            <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50/50">
              <CardTitle className="text-indigo-800 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-600" />
                Mark Detailed Attendance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Date</label>
                  <Input 
                    type="date" 
                    value={date} 
                    onChange={e => setDate(e.target.value)} 
                    required 
                    className="w-full focus:ring-2 focus:ring-indigo-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Department</label>
                  <Select 
                    value={selectedDept} 
                    onChange={e => {
                      const dept = e.target.value;
                      setSelectedDept(dept);
                      setSelectedSection(dept === 'Computer' ? '' : 'Single');
                    }}
                    className="w-full focus:ring-2 focus:ring-indigo-300"
                    disabled // usually faculty can only mark their own dept
                  >
                    {departments.map(d => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year</label>
                  <Select 
                    value={selectedYear} 
                    onChange={e => setSelectedYear(e.target.value)}
                    className="w-full focus:ring-2 focus:ring-indigo-300"
                  >
                    <option value="" disabled>Select Year</option>
                    {years.map(y => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </Select>
                </div>
                {isComputer && (
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Section</label>
                    <Select 
                      value={selectedSection} 
                      onChange={e => setSelectedSection(e.target.value)}
                      className="w-full focus:ring-2 focus:ring-indigo-300"
                    >
                      <option value="" disabled>Select Section</option>
                      {sections.map(s => (
                        <option key={s} value={s}>Section {s}</option>
                      ))}
                    </Select>
                  </div>
                )}
              </div>

              {selectedYear && selectedSection && (
                <div className="border border-slate-200 rounded-xl overflow-hidden animate-in fade-in">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 text-slate-600 uppercase text-xs font-semibold">
                        <tr>
                          <th className="px-4 py-3 border-b border-slate-200">Reg No</th>
                          <th className="px-4 py-3 border-b border-slate-200">Name</th>
                          <th className="px-4 py-3 border-b border-slate-200">Gender</th>
                          <th className="px-4 py-3 border-b border-slate-200 text-center">Attendance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 bg-white">
                        {attendanceList.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-4 py-8 text-center text-slate-500">
                              No students found for this selection.
                            </td>
                          </tr>
                        ) : (
                          attendanceList.map(student => (
                            <tr key={student.regNo} className="hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-medium text-slate-700">{student.regNo}</td>
                              <td className="px-4 py-3 text-slate-700">{student.name}</td>
                              <td className="px-4 py-3 text-slate-600">{student.gender}</td>
                              <td className="px-4 py-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => toggleAttendance(student.regNo)}
                                  className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors w-24 ${
                                    student.status === 'Present' 
                                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                      : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                                  }`}
                                >
                                  {student.status}
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                  
                  {attendanceList.length > 0 && (
                    <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-semibold text-slate-700">
                          Total Students: <span className="text-indigo-600">{attendanceList.length}</span>
                        </span>
                        <span className="text-sm font-semibold text-slate-700">
                          Total Absentees: <span className="text-rose-600">{absenteesCount}</span>
                        </span>
                      </div>
                      <Button 
                        onClick={handleSubmit}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 px-6 shadow-sm"
                      >
                        <Send className="w-4 h-4" /> Send to HOD
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Status Card */}
        <Card className="lg:col-span-1 shadow-md">
          <CardHeader>
            <CardTitle>Detailed Submission History</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No history found.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                {history.map((item) => (
                  <div key={item.id} className="p-3 border border-slate-100 rounded-xl bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="text-sm font-bold text-slate-800">{item.date}</div>
                        <div className="text-xs text-slate-500">{item.year} - Sec {item.section}</div>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        item.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                        item.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                        'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                    <div className="text-sm text-slate-700">
                      Absentees: <span className="font-bold text-rose-600">{item.absenteesCount}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

      </div>
    </PageWrapper>
  );
};

export default DetailedAttendance;
