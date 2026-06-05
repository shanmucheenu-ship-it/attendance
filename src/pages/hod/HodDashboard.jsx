import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { FilterBar } from '../../components/shared/FilterBar';
import { AttendanceTable } from '../../components/shared/AttendanceTable';
import { Button } from '../../components/ui/Button';
import { AppContext } from '../../context/AppContext';

const HodDashboard = () => {
  const { auth, getSessionStudents, saveCurrentSession } = useContext(AppContext);
  const navigate = useNavigate();

  const isComputer = auth?.user?.department === 'Computer';
  const initialSection = isComputer ? 'A' : 'Single';

  const [filters, setFilters] = useState({
    year: { type: 'select', value: '2nd Year', options: ['All', '2nd Year', '3rd Year'] },
    section: { type: 'select', value: initialSection, options: isComputer ? ['All', 'A', 'B'] : ['Single'] },
    gender: { type: 'select', value: 'All', options: ['All', 'Male', 'Female'] },
    date: { type: 'date', value: new Date().toISOString().split('T')[0] },
    search: { type: 'search', value: '' }
  });

  const [students, setStudents] = useState([]);

  useEffect(() => {
    // Load students for current year, section, and department
    const baseStudents = getSessionStudents(filters.year.value, filters.section.value, auth.user.department);
    // eslint-disable-next-line
    setStudents(baseStudents);
    // eslint-disable-next-line
  }, [filters.year.value, filters.section.value]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: { ...prev[key], value }
    }));
  };

  const handleToggleAttendance = (id) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id) {
        let nextStatus = 'Present';
        if (s.status === 'Present') nextStatus = 'Absent';
        else if (s.status === 'Absent') nextStatus = 'Leave';
        else if (s.status === 'Leave') nextStatus = 'Present';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const handleReset = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'Present' })));
  };

  const handleMarkLeave = () => {
    setStudents(prev => prev.map(s => ({ ...s, status: 'Leave' })));
  };

  const handleSaveDraft = () => {
    saveCurrentSession({
      year: filters.year.value,
      section: filters.section.value,
      date: filters.date.value,
      department: auth.user.department,
      students: students
    });
  };

  const handleNext = () => {
    handleSaveDraft();
    navigate(`/${auth.role}/summary`);
  };

  // Filter students before displaying
  const displayedStudents = students.filter(s => {
    if (filters.gender.value !== 'All' && s.gender !== filters.gender.value) return false;
    if (filters.search.value) {
      const q = filters.search.value.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.regNo.toLowerCase().includes(q);
    }
    return true;
  });

  const presentCount = students.filter(s => s.status === 'Present').length;
  const absentCount = students.filter(s => s.status === 'Absent').length;
  const leaveCount = students.filter(s => s.status === 'Leave').length;
  const validTotal = presentCount + absentCount;
  const percent = validTotal > 0 ? Math.round((presentCount / validTotal) * 100) : (leaveCount > 0 ? 100 : 0);

  return (
    <PageWrapper title="Mark Attendance">
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      
      <div className="mt-6 mb-4 flex items-center justify-between bg-surface-white p-4 rounded-xl shadow-sm border border-border-gray">
        <span className="text-text-secondary font-medium">Showing {displayedStudents.length} students</span>
        <div className="flex space-x-6 font-semibold items-center">
          <span className="text-success-green">✅ Present: {presentCount}</span>
          <span className="text-danger-red">❌ Absent: {absentCount}</span>
          <span className="text-indigo-600">🏖️ Leave: {leaveCount}</span>
          <span className="text-primary-blue bg-blue-50 px-3 py-1 rounded-lg">📊 {percent}%</span>
        </div>
      </div>

      <AttendanceTable 
        students={displayedStudents} 
        onToggleAttendance={handleToggleAttendance} 
      />

      <div className="fixed bottom-0 left-60 right-0 bg-surface-white border-t border-border-gray p-4 flex justify-between items-center z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="space-x-3">
          <Button variant="ghost" className="text-danger-red hover:text-red-700 hover:bg-red-50" onClick={handleReset}>
            Reset to Present
          </Button>
          <Button variant="ghost" className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50" onClick={handleMarkLeave}>
            🏖️ Mark All Leave (Festival)
          </Button>
        </div>
        <div className="space-x-4">
          <Button variant="outline" onClick={handleSaveDraft}>Save Draft</Button>
          <Button onClick={handleNext}>Next: View Summary &rarr;</Button>
        </div>
      </div>
      <div className="h-20"></div> {/* Spacer for fixed bottom bar */}
    </PageWrapper>
  );
};

export default HodDashboard;
