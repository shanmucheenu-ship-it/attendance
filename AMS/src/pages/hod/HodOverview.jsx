import React, { useContext } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { AppContext } from '../../context/AppContext';
import { StatCard } from '../../components/shared/StatCard';
import { Users, TrendingUp, UserX, UserCheck, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { BarChart } from '../../components/charts/BarChart';

const HodOverview = () => {
  const { auth, students, attendance, clearSubmissions, showToast, approveSubmission, rejectSubmission } = useContext(AppContext);
  const deptStudents = students.filter(s => s.department === auth.user.department);
  const totalStudents = deptStudents.length;

  const today = new Date().toISOString().split('T')[0];

  // Get all submissions for this department
  const deptSubmissions = attendance.submittedSessions.filter(s => s.department === auth.user.department);
  
  // Pending submissions
  const pendingSubmissions = deptSubmissions.filter(s => s.status === 'Pending');
  
  // Approved submissions today
  const approvedToday = deptSubmissions.filter(s => s.status === 'Approved' && s.date === today);

  // Dynamic calculations for HOD overview stats today
  let todayAbsent = 0;
  let submittedClassesStudentsCount = 0;

  approvedToday.forEach(sub => {
    todayAbsent += sub.absenteesCount;
    // Calculate size of the specific class (Year + Section) in this department
    const classSize = students.filter(
      st => st.department === auth.user.department && st.year === sub.year && st.section === sub.section
    ).length;
    submittedClassesStudentsCount += classSize;
  });

  const todayPresent = Math.max(0, submittedClassesStudentsCount - todayAbsent);
  const percent = submittedClassesStudentsCount > 0 
    ? Math.round((todayPresent / submittedClassesStudentsCount) * 100) 
    : 100;

  const getYearPercent = (yearStr) => {
    const yearSubs = approvedToday.filter(s => s.year === yearStr);
    if (yearSubs.length === 0) return 100; // Default to 100%
    
    let yearAbsent = 0;
    let yearTotal = 0;
    
    yearSubs.forEach(sub => {
      yearAbsent += sub.absenteesCount;
      const classSize = students.filter(
        st => st.department === auth.user.department && st.year === sub.year && st.section === sub.section
      ).length;
      yearTotal += classSize;
    });
    
    return yearTotal > 0 ? Math.round(((yearTotal - yearAbsent) / yearTotal) * 100) : 100;
  };

  const chartData = [
    { name: '2nd Year', 'Attendance %': getYearPercent('2nd Year') },
    { name: '3rd Year', 'Attendance %': getYearPercent('3rd Year') }
  ];

  return (
    <PageWrapper title={`${auth.user.department} Department HOD Dashboard`}>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Dept Enrolled" value={totalStudents} icon={Users} colorClass="bg-blue-100 text-blue-600" />
        <StatCard title="Today Present (Approved)" value={todayPresent} icon={UserCheck} colorClass="bg-green-100 text-green-600" />
        <StatCard title="Today Absent (Approved)" value={todayAbsent} icon={UserX} colorClass="bg-red-100 text-red-600" />
        <StatCard title="Approved Attendance %" value={`${percent}%`} icon={TrendingUp} colorClass="bg-amber-100 text-amber-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Analytics Chart */}
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader>
            <CardTitle>Today's Approved Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={chartData} xKey="name" yKey="Attendance %" />
          </CardContent>
        </Card>

        {/* Pending Approvals List */}
        <Card className="lg:col-span-2 shadow-sm border-amber-100">
          <CardHeader className="bg-amber-50/50 flex flex-row items-center justify-between">
            <CardTitle className="text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              Pending Attendance Requests ({pendingSubmissions.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {pendingSubmissions.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center italic">No pending attendance requests to review.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-2.5">Date</th>
                      <th className="px-4 py-2.5">Class</th>
                      <th className="px-4 py-2.5 text-center">Absentees</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingSubmissions.map(sub => (
                      <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-4 py-3 font-semibold text-slate-700">{sub.date}</td>
                        <td className="px-4 py-3 text-slate-600">{sub.year} - Section {sub.section}</td>
                        <td className="px-4 py-3 text-center font-bold text-red-600 text-base">{sub.absenteesCount}</td>
                        <td className="px-4 py-3 text-right space-x-2">
                          <button 
                            onClick={() => { approveSubmission(sub.id); showToast('Attendance request approved!'); }}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors shadow-sm"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => { rejectSubmission(sub.id); showToast('Attendance request rejected!', 'error'); }}
                            className="bg-red-50 hover:bg-red-100 text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors border border-red-200"
                          >
                            Reject
                          </button>
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

      {/* History Card */}
      <Card className="shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle>Approved / Rejected Requests History</CardTitle>
          {deptSubmissions.filter(s => s.status !== 'Pending').length > 0 && (
            <button 
              onClick={() => {
                if(window.confirm('Clear all submission history for your department?')) {
                  clearSubmissions(auth.user.department);
                  showToast('History cleared', 'success');
                }
              }}
              className="text-red-500 hover:text-red-700 transition-colors text-xs font-medium"
            >
              Reset History
            </button>
          )}
        </CardHeader>
        <CardContent>
          {deptSubmissions.filter(s => s.status !== 'Pending').length === 0 ? (
            <p className="text-sm text-slate-400 py-4 text-center italic">No processed submissions history found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                  <tr>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Class</th>
                    <th className="px-4 py-2 text-center">Absentees</th>
                    <th className="px-4 py-2 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deptSubmissions
                    .filter(s => s.status !== 'Pending')
                    .sort((a, b) => new Date(b.date) - new Date(a.date))
                    .map(sub => (
                      <tr key={sub.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-4 py-3 text-slate-500">{sub.date}</td>
                        <td className="px-4 py-3 font-semibold text-slate-700">{sub.year} - {sub.section}</td>
                        <td className="px-4 py-3 text-center font-semibold text-slate-700">{sub.absenteesCount}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                            sub.status === 'Approved' 
                              ? 'bg-green-50 text-green-700 border-green-200' 
                              : 'bg-red-50 text-red-700 border-red-200'
                          }`}>
                            {sub.status === 'Approved' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                            {sub.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

    </PageWrapper>
  );
};

export default HodOverview;
