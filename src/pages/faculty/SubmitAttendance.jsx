import React, { useState, useContext } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { AppContext } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Send, CheckCircle2, AlertCircle, Clock, Calendar, Trash2 } from 'lucide-react';

const SubmitAttendance = () => {
  const { auth, submitAttendance, attendance, deleteSubmission, showToast } = useContext(AppContext);

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
  const [selectedDept, setSelectedDept] = useState(auth.user?.department || departments[0]);
  const [selectedYear, setSelectedYear] = useState('');

  const isComputer = auth.user?.department === 'Computer' || selectedDept === 'Computer';
  const sections = isComputer ? ['A', 'B'] : ['Single'];

  const [selectedSection, setSelectedSection] = useState(isComputer ? '' : 'Single');
  const [absenteesCount, setAbsenteesCount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [deleteConfirmSession, setDeleteConfirmSession] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDept || !selectedYear || !selectedSection || absenteesCount === '') {
      showToast('Please fill all fields', 'error');
      return;
    }

    const count = Number(absenteesCount);
    if (isNaN(count) || count < 0) {
      showToast('Number of absentees must be a valid positive number', 'error');
      return;
    }

    const sessionData = {
      date,
      department: selectedDept,
      year: selectedYear,
      section: selectedSection,
      absenteesCount: count,
      submittedBy: auth.user?.username || 'faculty',
    };

    await submitAttendance(sessionData, 'faculty');

    // Reset input fields
    setAbsenteesCount('');
    setSelectedYear('');
    setSelectedSection('');
  };

  // Filter submissions to show this faculty's department history
  const history = attendance.submittedSessions
    .filter(s => s.department === selectedDept)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <PageWrapper title="Submit Attendance">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Submission Form Card */}
        <Card className="lg:col-span-1 shadow-md border-indigo-100">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50/50">
            <CardTitle className="text-indigo-800 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              New Attendance Submission
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              
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

              {/* Conditional Absentees Count Field */}
              {selectedYear && selectedSection && (
                <div className="pt-2 border-t border-slate-100 animate-in fade-in slide-in-from-top-3 duration-200">
                  <label className="block text-sm font-bold text-slate-800 mb-1.5">
                    Number of Absentees
                  </label>
                  <Input 
                    type="number" 
                    min="0"
                    placeholder="Enter total absentees count"
                    value={absenteesCount} 
                    onChange={e => setAbsenteesCount(e.target.value)} 
                    required 
                    className="w-full border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-300 text-lg font-bold"
                  />
                  
                  <Button type="submit" className="w-full mt-4 bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2 py-3 rounded-xl shadow-sm">
                    <Send className="w-4 h-4" /> Submit Request
                  </Button>
                </div>
              )}

            </form>
          </CardContent>
        </Card>

        {/* History/Status Card */}
        <Card className="lg:col-span-2 shadow-md">
          <CardHeader>
            <CardTitle>Attendance Submission History ({selectedDept})</CardTitle>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <Clock className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-medium">No submission history found for this department.</p>
                <p className="text-xs mt-1">Submit attendance on the left to see requests here.</p>
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs sticky top-0 z-10">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Year / Section</th>
                      <th className="px-4 py-3 text-center">Absentees Count</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-50/55 transition-colors">
                        <td className="px-4 py-3 font-medium text-slate-700">{item.date}</td>
                        <td className="px-4 py-3 text-slate-600">{item.year} - Section {item.section}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-800 text-base">{item.absenteesCount}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                            item.status === 'Approved' ? 'bg-green-50 text-green-700 border border-green-200' :
                            item.status === 'Rejected' ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          }`}>
                            {item.status === 'Approved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                            {item.status === 'Rejected' && <AlertCircle className="w-3.5 h-3.5" />}
                            {item.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                            {item.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          {item.status === 'Pending' ? (
                            <button
                              onClick={() => setDeleteConfirmSession(item)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors inline-flex items-center justify-center"
                              title="Delete Submission"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-slate-400 font-medium">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

      </div>

      {/* Custom Confirmation Modal */}
      {deleteConfirmSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all duration-300 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-100 transform transition-all scale-100 duration-300 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="bg-red-50 p-2 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">Confirm Deletion</h3>
            </div>
            
            <p className="text-slate-600 text-sm mb-6 leading-relaxed">
              Are you sure you want to delete the pending attendance submission for <span className="font-semibold text-slate-800">{deleteConfirmSession.year} - Section {deleteConfirmSession.section}</span>? This action cannot be undone.
            </p>
            
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setDeleteConfirmSession(null)}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const idToDelete = deleteConfirmSession.id;
                  setDeleteConfirmSession(null);
                  await deleteSubmission(idToDelete);
                }}
                className="px-5 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors shadow-sm"
              >
                Delete Request
              </button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default SubmitAttendance;
