import React, { useState, useContext } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { AppContext } from '../../context/AppContext';
import { Card, CardContent } from '../../components/ui/Card';
import { Select } from '../../components/ui/Select';
import { ArrowLeft, CalendarCheck, Users, BarChart2, Award, Search } from 'lucide-react';

const AttendanceHistory = ({ initialFilters, onBack }) => {
  const { attendance } = useContext(AppContext);

  const departments = [
    'Mechanical',
    'Automobile',
    'Civil',
    'Electrical and Electronic',
    'Electronics and Communication',
    'Computer',
    'Communication and Computer Networking',
  ];
  const years = ['All', '1st Year', '2nd Year', '3rd Year'];
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const calendarYears = ['2026', '2025', '2024'];

  // Local state for filters - defaults to Computer (CSE), 3rd Year (III Year), Section A
  const [filterDept, setFilterDept] = useState(initialFilters?.department || departments[5]);
  const [filterYear, setFilterYear] = useState(initialFilters?.year || '3rd Year');
  const [filterSection, setFilterSection] = useState(initialFilters?.section || (initialFilters?.department && initialFilters.department !== 'Computer' ? 'Single' : 'A'));
  
  const currentMonthIdx = new Date().getMonth();
  const currentYearStr = new Date().getFullYear().toString();

  const [filterMonth, setFilterMonth] = useState(initialFilters?.month !== undefined ? initialFilters.month : currentMonthIdx);
  const [filterCalYear, setFilterCalYear] = useState(initialFilters?.calYear || currentYearStr);

  // Trigger search / recalculations
  const [searchParams, setSearchParams] = useState({
    department: filterDept,
    year: filterYear,
    section: filterSection,
    month: Number(initialFilters?.month !== undefined ? initialFilters.month : currentMonthIdx),
    calYear: initialFilters?.calYear || currentYearStr
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearchParams({
      department: filterDept,
      year: filterYear,
      section: filterSection,
      month: Number(filterMonth),
      calYear: filterCalYear
    });
  };

  // Helper function to map database department names to display names (abbreviations)
  const getDeptDisplayName = (dept) => {
    if (dept === 'Computer') return 'CSE';
    if (dept === 'Electronics and Communication') return 'ECE';
    if (dept === 'Electrical and Electronic') return 'EEE';
    if (dept === 'Communication and Computer Networking') return 'CCN';
    return dept;
  };

  // Helper function to map database year names to Roman numeral formats
  const getYearDisplayName = (yr) => {
    if (yr === 'All') return 'All Years';
    if (yr === '1st Year') return 'I Year';
    if (yr === '2nd Year') return 'II Year';
    if (yr === '3rd Year') return 'III Year';
    return yr;
  };

  const today = new Date().toISOString().split('T')[0];
  const getDaysInMonth = (monthIdx, yr) => new Date(yr, monthIdx + 1, 0).getDate();
  const getDayName = (dateObj) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[dateObj.getDay()];
  };

  // Generate calendar dates for the grid
  const daysInMonth = getDaysInMonth(searchParams.month, Number(searchParams.calYear));
  const datesList = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const dateObj = new Date(Number(searchParams.calYear), searchParams.month, i);
    const dayName = getDayName(dateObj);
    
    // Format date string as YYYY-MM-DD
    const yyyy = searchParams.calYear;
    const mm = String(searchParams.month + 1).padStart(2, '0');
    const dd = String(i).padStart(2, '0');
    const dateStr = `${yyyy}-${mm}-${dd}`;

    const isFuture = dateStr > today;

    // Helper to get approved absentees for a specific class (Year + Section)
    const getApprovedCount = (yearStr, sectionStr) => {
      const sub = attendance.submittedSessions.find(
        s => s.status === 'Approved' &&
             s.date === dateStr &&
             s.department === searchParams.department &&
             s.year === yearStr &&
             s.section === sectionStr
      );
      return sub ? Number(sub.absenteesCount) : '-';
    };

    // Build the dynamic rows configuration
    const rowsToRender = [];
    if (searchParams.department === 'Computer') {
      if (searchParams.year === 'All' && searchParams.section === 'All') {
        rowsToRender.push({ label: 'I Year Sec A', year: '1st Year', section: 'A' });
        rowsToRender.push({ label: 'I Year Sec B', year: '1st Year', section: 'B' });
        rowsToRender.push({ label: 'II Year Sec A', year: '2nd Year', section: 'A' });
        rowsToRender.push({ label: 'II Year Sec B', year: '2nd Year', section: 'B' });
        rowsToRender.push({ label: 'III Year Sec A', year: '3rd Year', section: 'A' });
        rowsToRender.push({ label: 'III Year Sec B', year: '3rd Year', section: 'B' });
        rowsToRender.push({ label: 'Total Absentees', isTotalRow: true });
      } else if (searchParams.year === 'All') {
        rowsToRender.push({ label: 'I Year', year: '1st Year', section: searchParams.section });
        rowsToRender.push({ label: 'II Year', year: '2nd Year', section: searchParams.section });
        rowsToRender.push({ label: 'III Year', year: '3rd Year', section: searchParams.section });
        rowsToRender.push({ label: 'Total Absentees', isTotalRow: true });
      } else if (searchParams.section === 'All') {
        rowsToRender.push({ label: 'Sec A', year: searchParams.year, section: 'A' });
        rowsToRender.push({ label: 'Sec B', year: searchParams.year, section: 'B' });
        rowsToRender.push({ label: 'Total Absentees', isTotalRow: true });
      } else {
        rowsToRender.push({ label: 'No. of Absentees', year: searchParams.year, section: searchParams.section });
      }
    } else {
      if (searchParams.year === 'All') {
        rowsToRender.push({ label: 'I Year', year: '1st Year', section: 'Single' });
        rowsToRender.push({ label: 'II Year', year: '2nd Year', section: 'Single' });
        rowsToRender.push({ label: 'III Year', year: '3rd Year', section: 'Single' });
        rowsToRender.push({ label: 'Total Absentees', isTotalRow: true });
      } else {
        rowsToRender.push({ label: 'No. of Absentees', year: searchParams.year, section: 'Single' });
      }
    }

    // Populate day values for each row
    const valuesForDay = {};
    let totalForDay = 0;
    let hasAnyData = false;

    rowsToRender.forEach(row => {
      if (row.isTotalRow) return;
      const count = getApprovedCount(row.year, row.section);
      valuesForDay[row.label] = count;
      if (typeof count === 'number') {
        totalForDay += count;
        hasAnyData = true;
      }
    });

    const hasTotalRow = rowsToRender.some(row => row.isTotalRow);
    if (hasTotalRow) {
      valuesForDay['Total Absentees'] = hasAnyData ? totalForDay : '-';
    }

    let absentValue;
    if (hasTotalRow) {
      absentValue = valuesForDay['Total Absentees'];
    } else {
      absentValue = valuesForDay['No. of Absentees'];
    }

    datesList.push({
      dayNumber: i,
      dayName,
      dateStr,
      values: valuesForDay,
      absent: absentValue,
      isFuture
    });
  }

  // Calculate bottom metrics (excluding Sundays from working days)
  const workingDays = datesList.filter(d => !d.isFuture && d.dayName !== 'Sun');
  const totalWorkingDaysCount = workingDays.length;
  
  let totalAbsentees = 0;
  let maxAbsentCount = 0;
  let maxAbsentDates = [];

  datesList.forEach(d => {
    if (typeof d.absent === 'number') {
      totalAbsentees += d.absent;
      
      if (d.absent > maxAbsentCount) {
        maxAbsentCount = d.absent;
        maxAbsentDates = [d.dayNumber];
      } else if (d.absent === maxAbsentCount && maxAbsentCount > 0) {
        maxAbsentDates.push(d.dayNumber);
      }
    }
  });

  const averageAbsentees = totalWorkingDaysCount > 0 
    ? (totalAbsentees / totalWorkingDaysCount).toFixed(2)
    : '0.00';

  const getDaySuffix = (day) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1:  return 'st';
      case 2:  return 'nd';
      case 3:  return 'rd';
      default: return 'th';
    }
  };

  const formattedMaxDates = maxAbsentDates.map(d => `${d}${getDaySuffix(d)}`).join(', ');

  return (
    <PageWrapper title="Attendance History">
      
      {/* Top Header Title & Back Button */}
      <div className="flex flex-row items-center justify-between mb-6">
        <div className="flex items-center gap-2.5 text-[#0f5132]">
          <CalendarCheck className="w-8 h-8 text-[#0f5132]" />
          <h1 className="text-xl font-black tracking-wide uppercase">Attendance History</h1>
        </div>
        <button 
          onClick={onBack} 
          className="flex items-center gap-1.5 px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 bg-white rounded-lg font-semibold text-sm shadow-sm transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      </div>

      {/* Filters Form Container */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/60 shadow-sm mb-6">
        <form onSubmit={handleSearch} className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 flex-1">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Department</label>
              <Select value={filterDept} onChange={e => setFilterDept(e.target.value)}>
                {departments.map(d => (
                  <option key={d} value={d}>{getDeptDisplayName(d)}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Year</label>
              <Select value={filterYear} onChange={e => setFilterYear(e.target.value)}>
                {years.map(y => (
                  <option key={y} value={y}>{getYearDisplayName(y)}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Section</label>
              <Select value={filterSection} onChange={e => setFilterSection(e.target.value)}>
                {(filterDept === 'Computer' ? ['All', 'A', 'B'] : ['Single']).map(s => (
                  <option key={s} value={s}>{s === 'All' ? 'All Sections' : (s === 'Single' ? 'Single Class' : `Section ${s}`)}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Month</label>
              <Select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}>
                {months.map((m, idx) => (
                  <option key={m} value={idx}>{m}</option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Year</label>
              <Select value={filterCalYear} onChange={e => setFilterCalYear(e.target.value)}>
                {calendarYears.map(cy => (
                  <option key={cy} value={cy}>{cy}</option>
                ))}
              </Select>
            </div>
          </div>

          <div className="shrink-0 pt-1 lg:pt-0">
            <button 
              type="submit" 
              className="w-full lg:w-auto h-10 bg-[#064e3b] hover:bg-[#043327] text-white flex items-center justify-center gap-1.5 px-6 rounded-lg font-bold text-sm shadow-sm transition-colors cursor-pointer border-none"
            >
              <Search className="w-4 h-4" /> Search
            </button>
          </div>
        </form>
      </div>

      {/* Grid Sheet Attendance Card */}
      <Card className="mb-6 shadow-sm border-slate-200/60 overflow-hidden bg-white">
        <CardContent className="p-0">
          
          {/* Header Title inside card */}
          <div className="p-4 border-b border-slate-200 bg-[#f4faf7] flex items-center justify-center gap-2 font-bold text-[#0f5132] text-base">
            <CalendarCheck className="w-5 h-5" />
            <span>
              {getDeptDisplayName(searchParams.department)} - {getYearDisplayName(searchParams.year)} {searchParams.section === 'All' ? 'All Sections' : `Section ${searchParams.section}`} | {months[searchParams.month]} {searchParams.calYear}
            </span>
          </div>

          {/* Scrolling Grid */}
          <div className="overflow-x-auto custom-scrollbar pb-4">
            <table className="w-full text-left text-sm border-collapse min-w-[1000px] border-spacing-0">
              <tbody>
                
                {/* Date Row */}
                <tr className="bg-slate-50/40 text-slate-700 text-xs font-bold border-b border-slate-200">
                  <td className="px-4 py-3 font-bold border-r border-slate-200 bg-slate-50 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Date</td>
                  {datesList.map(d => (
                    <td key={d.dayNumber} className="p-2.5 text-center border-r border-slate-200 min-w-[2.2rem] font-bold text-slate-800">{d.dayNumber}</td>
                  ))}
                </tr>

                {/* Day Row */}
                <tr className="text-slate-600 text-xs font-semibold border-b border-slate-200">
                  <td className="px-4 py-3 font-bold border-r border-slate-200 bg-slate-50 sticky left-0 z-10 shadow-[2px_0_5px_rgba(0,0,0,0.02)]">Day</td>
                  {datesList.map(d => {
                    const isWeekend = d.dayName === 'Sat' || d.dayName === 'Sun';
                    return (
                      <td key={d.dayNumber} className={`p-2.5 text-center border-r border-slate-200 min-w-[2.2rem] font-semibold ${
                        isWeekend ? 'text-red-500 font-bold' : 'text-slate-700'
                      }`}>
                        {d.dayName}
                      </td>
                    );
                  })}
                </tr>

                {/* Absent Counts Rows */}
                {(() => {
                  const rowsToRender = [];
                  if (searchParams.year === 'All' && searchParams.section === 'All') {
                    rowsToRender.push({ label: 'I Year Sec A' });
                    rowsToRender.push({ label: 'I Year Sec B' });
                    rowsToRender.push({ label: 'II Year Sec A' });
                    rowsToRender.push({ label: 'II Year Sec B' });
                    rowsToRender.push({ label: 'III Year Sec A' });
                    rowsToRender.push({ label: 'III Year Sec B' });
                    rowsToRender.push({ label: 'Total Absentees', isTotal: true });
                  } else if (searchParams.year === 'All') {
                    rowsToRender.push({ label: 'I Year' });
                    rowsToRender.push({ label: 'II Year' });
                    rowsToRender.push({ label: 'III Year' });
                    rowsToRender.push({ label: 'Total Absentees', isTotal: true });
                  } else if (searchParams.section === 'All') {
                    rowsToRender.push({ label: 'Sec A' });
                    rowsToRender.push({ label: 'Sec B' });
                    rowsToRender.push({ label: 'Total Absentees', isTotal: true });
                  } else {
                    rowsToRender.push({ label: 'No. of Absentees' });
                  }

                  return rowsToRender.map(row => {
                    const isTotal = row.isTotal;
                    const trClass = isTotal 
                      ? 'text-slate-900 bg-emerald-50/20 text-sm font-black border-b border-slate-200' 
                      : 'text-slate-700 text-sm border-b border-slate-200';
                    const tdLabelClass = isTotal
                      ? 'px-4 py-3.5 font-bold border-r border-slate-200 bg-emerald-50/40 sticky left-0 z-10 text-xs text-emerald-800 shadow-[2px_0_5px_rgba(0,0,0,0.02)]'
                      : 'px-4 py-3 font-semibold border-r border-slate-200 bg-slate-50 sticky left-0 z-10 text-xs text-slate-500 shadow-[2px_0_5px_rgba(0,0,0,0.02)]';
                    const tdValueClass = (val) => {
                      if (val === '-') return 'text-slate-400 font-normal';
                      return isTotal ? 'text-emerald-900 text-base font-black' : 'text-slate-800 font-bold';
                    };

                    return (
                      <tr key={row.label} className={trClass}>
                        <td className={tdLabelClass}>{row.label}</td>
                        {datesList.map(d => {
                          const val = d.values[row.label];
                          return (
                            <td key={d.dayNumber} className={`p-2.5 text-center border-r border-slate-200 min-w-[2.2rem] ${tdValueClass(val)}`}>
                              {val}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>

        </CardContent>
      </Card>

      {/* Bottom Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in duration-300 delay-100">
        
        {/* Total Working Days */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Working Days</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{totalWorkingDaysCount}</h3>
          </div>
          <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700">
            <CalendarCheck className="w-6 h-6" />
          </div>
        </div>

        {/* Total Absentees */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Absentees</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{totalAbsentees}</h3>
          </div>
          <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700">
            <Users className="w-6 h-6" />
          </div>
        </div>

        {/* Average Absentees */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Average Absentees</p>
            <h3 className="text-3xl font-extrabold text-slate-800 mt-2">{averageAbsentees}</h3>
          </div>
          <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700">
            <BarChart2 className="w-6 h-6" />
          </div>
        </div>

        {/* Highest Absentee Day */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Highest Absentee Day</p>
            <div className="mt-2">
              <h3 className="text-3xl font-extrabold text-slate-800">{maxAbsentCount}</h3>
              {maxAbsentCount > 0 && (
                <p className="text-[11px] text-slate-400 font-bold mt-1">
                  on {formattedMaxDates} {months[searchParams.month].substring(0, 3)}
                </p>
              )}
            </div>
          </div>
          <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-700">
            <Award className="w-6 h-6" />
          </div>
        </div>

      </div>

    </PageWrapper>
  );
};

export default AttendanceHistory;
