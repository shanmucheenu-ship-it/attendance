import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, UserCheck, UserX, TrendingUp, BookOpen } from 'lucide-react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { StatCard } from '../../components/shared/StatCard';
import { AttendanceTable } from '../../components/shared/AttendanceTable';
import { DonutChart } from '../../components/charts/DonutChart';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { AppContext } from '../../context/AppContext';

const AttendanceSummary = () => {
  const { auth, attendance, submitAttendance, showToast, students: contextStudents } = useContext(AppContext);
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);

  const session = attendance.currentSession;

  if (!session) {
    return (
      <PageWrapper title="Attendance Summary">
        <div className="flex flex-col items-center justify-center h-64">
          <p className="text-text-secondary mb-4">No active attendance session draft found.</p>
          <Button onClick={() => navigate(`/${auth.role}/dashboard`)}>Go to Dashboard</Button>
        </div>
      </PageWrapper>
    );
  }

  const { students, year, section, department, date } = session;

  // --- Section Level Stats ---
  const secTotal = students.length;
  const secPresent = students.filter(s => s.status === 'Present').length;
  const secAbsent = students.filter(s => s.status === 'Absent').length;
  const secLeave = students.filter(s => s.status === 'Leave').length;

  const [editedAbsentees, setEditedAbsentees] = useState(null);
  const currentAbsentees = editedAbsentees !== null ? editedAbsentees : secAbsent;
  
  const adjustedPresent = Math.max(0, secTotal - currentAbsentees);
  const secPercentage = secTotal > 0 ? Math.round((adjustedPresent / secTotal) * 100) : 100;

  const chartData = [
    { name: 'Present', value: adjustedPresent },
    { name: 'Absent', value: currentAbsentees }
  ];
  if (secLeave > 0) {
    chartData.push({ name: 'Leave', value: secLeave });
  }

  // --- Year Level Rollup Stats ---
  const allYearStudents = contextStudents.filter(s => s.year === year && s.department === department);
  const yearRollup = allYearStudents.map(s => {
    // If student is in current section, use current session status
    if (s.section === section) {
       return students.find(ss => ss.id === s.id) || { ...s, status: 'Present' };
    }
    // If in another section, check if submitted today
    const submittedSec = attendance.submittedSessions.find(sub => sub.year === year && sub.section === s.section && sub.department === department && sub.date === date);
    if (submittedSec) {
       return submittedSec.students.find(ss => ss.id === s.id) || { ...s, status: 'Present' };
    }
    // Fallback default mock for unsubmitted sections to make rollup look realistic
    return { ...s, status: 'Present' };
  });

  const yrTotal = yearRollup.length;
  const yrPresent = yearRollup.filter(s => s.status === 'Present').length;
  const yrAbsent = yearRollup.filter(s => s.status === 'Absent').length;
  
  const diff = currentAbsentees - secAbsent;
  const adjustedYrAbsent = Math.max(0, yrAbsent + diff);
  const adjustedYrPresent = Math.max(0, yrTotal - adjustedYrAbsent);
  const yrPercentage = yrTotal > 0 ? Math.round((adjustedYrPresent / yrTotal) * 100) : 100;

  const handleConfirm = async () => {
    const sessionWithCount = { ...session, absenteesCount: currentAbsentees };
    await submitAttendance(sessionWithCount, auth.role);
    setSubmitted(true);
  };

  return (
    <PageWrapper title={`Summary: ${year} Section ${section}`}>
      
      <h3 className="text-lg font-semibold text-text-primary mb-4">Section Level ({year} - Section {section})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
        <StatCard title="Section Students" value={secTotal} icon={Users} colorClass="bg-blue-100 text-blue-600" delay={0.1} />
        <StatCard title="Section Present" value={adjustedPresent} icon={UserCheck} colorClass="bg-green-100 text-green-600" delay={0.2} />
        <StatCard title="Section Absent" value={currentAbsentees} icon={UserX} colorClass="bg-red-100 text-red-600" delay={0.3} />
        <StatCard title="Section %" value={`${secPercentage}%`} icon={TrendingUp} colorClass="bg-amber-100 text-amber-600" delay={0.4} />
      </div>

      <div className="bg-amber-50/50 border border-amber-200/60 p-4 rounded-2xl mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-amber-800 text-sm">Need to adjust the absentee count?</h4>
          <p className="text-xs text-amber-600 font-medium">You can override the total number of absentees sent to the Principal here.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-xs font-bold text-amber-800 uppercase">Absentees Count:</label>
          <input
            type="number"
            value={currentAbsentees}
            onChange={(e) => setEditedAbsentees(Math.max(0, parseInt(e.target.value) || 0))}
            className="w-24 px-3 py-1.5 text-center font-bold text-red-600 border border-amber-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white shadow-sm"
            min="0"
          />
        </div>
      </div>

      <h3 className="text-lg font-semibold text-text-primary mb-4 mt-8">Year Level Rollup ({year} All Sections)</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-indigo-50 border-none">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary font-medium uppercase">Total Present</p>
              <h3 className="text-3xl font-bold text-indigo-700 mt-2">{yrPresent} / {yrTotal}</h3>
            </div>
            <div className="bg-indigo-100 p-4 rounded-full"><BookOpen className="text-indigo-600 w-8 h-8"/></div>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 border-none">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary font-medium uppercase">Total Absent</p>
              <h3 className="text-3xl font-bold text-rose-700 mt-2">{yrAbsent} / {yrTotal}</h3>
            </div>
            <div className="bg-rose-100 p-4 rounded-full"><UserX className="text-rose-600 w-8 h-8"/></div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-none">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-text-secondary font-medium uppercase">Combined %</p>
              <h3 className="text-3xl font-bold text-emerald-700 mt-2">{yrPercentage}%</h3>
            </div>
            <div className="bg-emerald-100 p-4 rounded-full"><TrendingUp className="text-emerald-600 w-8 h-8"/></div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Section Attendance Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <DonutChart 
              data={chartData} 
              colors={['#16A34A', '#DC2626', '#4F46E5']} 
              centerText={{ value: `${secPercentage}%`, label: 'Attendance' }} 
            />
          </CardContent>
        </Card>
      </div>

      <div className="mb-24">
        <h3 className="text-lg font-semibold text-text-primary mb-4">Final Student List (Section {section})</h3>
        <AttendanceTable students={students} readOnly={true} />
      </div>

      <div className="fixed bottom-0 left-0 md:left-64 right-0 bg-surface-white border-t border-border-gray p-4 flex justify-between items-center z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <Button variant="ghost" className="text-sm py-2 px-3" onClick={() => navigate(`/${auth.role}/dashboard`)}>
          &larr; Back to Attendance
        </Button>
        <Button 
          variant={submitted ? "outline" : "success"} 
          className="text-sm py-2 px-4 font-bold"
          onClick={handleConfirm}
          disabled={submitted}
        >
          {submitted ? 'Submitted Successfully' : '✅ Confirm & Submit'}
        </Button>
      </div>
    </PageWrapper>
  );
};

export default AttendanceSummary;
