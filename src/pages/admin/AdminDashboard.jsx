import React, { useContext, useState } from 'react';
import { Users, UserX, PieChart, Download, X, Calendar, ClipboardList } from 'lucide-react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { StatCard } from '../../components/shared/StatCard';
import { WaveChart } from '../../components/charts/WaveChart';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { AppContext } from '../../context/AppContext';
import { downloadCSV } from '../../utils/exportCSV';
import AttendanceHistory from './AttendanceHistory';

const AdminDashboard = () => {
  const { students, attendance, showViewDataModal, setShowViewDataModal, sendAlert, showToast } = useContext(AppContext);
  const getLocalDateString = (d = new Date()) => {
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const today = getLocalDateString();

  const [selectedDeptDetails, setSelectedDeptDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('1st Year');
  const [modalDate, setModalDate] = useState(today);
  const [historyView, setHistoryView] = useState(null);

  // Get today's approved submissions
  const forwardedSubmissions = attendance.submittedSessions.filter(
    s => s.status === 'Approved' && s.date === today
  );

  const depts = [...new Set(students.map(s => s.department))];

  const getSubAbsent = (deptName, year, section) => {
    const sub = forwardedSubmissions.find(
      s => s.department === deptName && s.year === year && s.section === section
    );
    return sub ? Number(sub.absenteesCount) : '-';
  };

  const getDetailedStats = (dept) => {
    if (!dept) return null;
    const deptSubs = forwardedSubmissions.filter(s => s.department === dept);

    const years = ['1st Year', '2nd Year', '3rd Year'];
    const sections = dept === 'Computer' ? ['A', 'B'] : ['Single'];

    let stats = {};
    years.forEach(year => {
      stats[year] = [];
      sections.forEach(sec => {
        const sub = deptSubs.find(s => s.year === year && s.section === sec);
        const secAbsent = sub ? Number(sub.absenteesCount) : 0;
        stats[year].push({ section: sec, absent: secAbsent });
      });
    });
    return stats;
  };

  // Calculate stats based on actual approved attendance data
  let totalStudents = 0;
  let totalAbsent = 0;
  let totalPresent = 0;

  depts.forEach(d => {
    const dStudents = students.filter(s => s.department === d);
    const dTotal = dStudents.length;

    // Find approved submissions for this department today
    const deptSubs = forwardedSubmissions.filter(s => s.department === d);

    let dAbsent = 0;
    deptSubs.forEach(sub => {
      dAbsent += Number(sub.absenteesCount);
    });

    const dPresent = Math.max(0, dTotal - dAbsent);

    totalStudents += dTotal;
    totalAbsent += dAbsent;
    totalPresent += dPresent;
  });

  const overallPercent = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 100;

  // Analytics wave chart filters
  const [filterDept, setFilterDept] = useState('All');
  const [filterYearSec, setFilterYearSec] = useState('All');
  const [timeFilter, setTimeFilter] = useState('Weekly');

  // Compute trend data based on filters and real approved submissions
  const getDatesForWeek = () => {
    const current = new Date();
    const week = [];
    const day = current.getDay();
    const mondayDiff = day === 0 ? -6 : 1 - day;
    const monday = new Date(current.getTime());
    monday.setDate(current.getDate() + mondayDiff);

    for (let i = 0; i < 6; i++) {
      const next = new Date(monday.getTime());
      next.setDate(monday.getDate() + i);
      week.push(getLocalDateString(next));
    }
    return week;
  };

  const allWeeklyLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const weekDates = getDatesForWeek();

  // Dynamically filter labels and data up to today's date
  let filteredXLabels = [];
  if (timeFilter === 'Weekly') {
    allWeeklyLabels.forEach((label, index) => {
      const dateStr = weekDates[index];
      // Only include days up to today
      if (dateStr <= today) {
        filteredXLabels.push({ label, index, dateStr });
      }
    });
  } else {
    const todayDateObj = new Date();
    const currentWeekIndex = Math.floor((todayDateObj.getDate() - 1) / 7);
    const allMonthlyLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    allMonthlyLabels.forEach((label, index) => {
      // Only include weeks up to the current week of the month
      if (index <= currentWeekIndex) {
        filteredXLabels.push({ label, index });
      }
    });
  }

  const waveData = filteredXLabels.map((item) => {
    let filteredSubs;

    if (timeFilter === 'Weekly') {
      const dateStr = item.dateStr;
      filteredSubs = attendance.submittedSessions.filter(
        s => s.status === 'Approved' && s.date === dateStr
      );
    } else {
      const current = new Date();
      const year = current.getFullYear();
      const month = current.getMonth();
      filteredSubs = attendance.submittedSessions.filter(s => {
        if (s.status !== 'Approved') return false;
        const sDate = new Date(s.date);
        if (sDate.getFullYear() !== year || sDate.getMonth() !== month) return false;
        const day = sDate.getDate();
        const weekIndex = Math.floor((day - 1) / 7);
        return weekIndex === item.index;
      });
    }

    if (filterDept !== 'All') {
      filteredSubs = filteredSubs.filter(s => s.department === filterDept);
    }
    if (filterYearSec !== 'All') {
      const yearMatch = filterYearSec.slice(0, 8);

      if (filterYearSec.endsWith('All')) {
        filteredSubs = filteredSubs.filter(s => s.year === yearMatch);
      } else {
        const secMatch = filterYearSec.slice(-1);
        filteredSubs = filteredSubs.filter(s => s.year === yearMatch && s.section === secMatch);
      }
    }

    let dayAbsent = 0;
    let totalStrength = 0;

    filteredSubs.forEach(sub => {
      dayAbsent += Number(sub.absenteesCount);
      const size = students.filter(
        st => st.department === sub.department && st.year === sub.year && st.section === sub.section
      ).length;
      totalStrength += size;
    });

    // If attendance is not entered yet (totalStrength is 0), set it to null
    // so that the line graph stops at the last entered day and does not extend with 100%
    const pct = totalStrength > 0
      ? Math.max(0, Math.round(((totalStrength - dayAbsent) / totalStrength) * 100))
      : null;

    return {
      label: item.label,
      attendance: pct
    };
  });

  const handleExportCSV = () => {
    const headers = [
      "S.No",
      "Department",
      "1st Year",
      "2nd Year",
      "3rd Year",
      "Total Absentees",
      "Approved Records"
    ];

    const getCsvDeptName = (deptName) => {
      if (deptName === 'Computer') return 'Computer Science';
      if (deptName === 'Electronics and Communication') return 'Electronics & Communication';
      if (deptName === 'Electrical and Electronic') return 'Electrical & Electronics';
      if (deptName === 'Communication and Computer Networking') return 'Communication & Computer Networking';
      return deptName;
    };

    const getCsvSubAbsentTotal = (deptName, year) => {
      let sum = 0;
      let hasData = false;
      const sections = deptName === 'Computer' ? ['A', 'B'] : ['Single'];
      sections.forEach(sec => {
        const val = getSubAbsent(deptName, year, sec);
        if (typeof val === 'number') {
          sum += val;
          hasData = true;
        }
      });
      return hasData ? sum : 0;
    };

    const getApprovedRecordsCount = (deptName) => {
      return forwardedSubmissions.filter(s => s.department === deptName).length;
    };

    let sNo = 1;
    let total1st = 0;
    let total2nd = 0;
    let total3rd = 0;
    let totalAbs = 0;
    let totalApp = 0;

    const rows = depts.map(d => {
      const displayDept = getCsvDeptName(d);
      const val1st = getCsvSubAbsentTotal(d, '1st Year');
      const val2nd = getCsvSubAbsentTotal(d, '2nd Year');
      const val3rd = getCsvSubAbsentTotal(d, '3rd Year');
      const rowTotal = val1st + val2nd + val3rd;
      const approvedCount = getApprovedRecordsCount(d);

      total1st += val1st;
      total2nd += val2nd;
      total3rd += val3rd;
      totalAbs += rowTotal;
      totalApp += approvedCount;

      return [
        sNo++,
        displayDept,
        val1st,
        val2nd,
        val3rd,
        rowTotal,
        approvedCount
      ];
    });

    // Add Grand Total row
    rows.push([
      "",
      "Grand Total",
      total1st,
      total2nd,
      total3rd,
      totalAbs,
      totalApp
    ]);

    downloadCSV(headers, rows, 'system_absentee_report.csv');
  };

  // Filter approved records for selected modal date
  const approvedForDate = attendance.submittedSessions.filter(
    s => s.status === 'Approved' && s.date === modalDate
  );

  if (historyView) {
    return (
      <AttendanceHistory
        initialFilters={historyView}
        onBack={() => setHistoryView(null)}
      />
    );
  }

  // Restructured table rows and helper methods matching the wireframe
  const tableRows = [];
  depts.forEach(d => {
    if (d === 'Computer') {
      tableRows.push({ key: 'Computer-A', display: 'Computer A', dept: 'Computer', section: 'A' });
      tableRows.push({ key: 'Computer-B', display: 'Computer B', dept: 'Computer', section: 'B' });
    } else {
      let disp = d;
      if (d === 'Automobile') disp = 'AUTOMOBILE';
      else if (d === 'Civil') disp = 'CIVIL';
      else if (d === 'Mechanical') disp = 'MECHANICAL';
      else if (d === 'Electrical and Electronic') disp = 'EEE';
      else if (d === 'Electronics and Communication') disp = 'ECE';
      else if (d === 'Communication and Computer Networking') disp = 'CCN';
      tableRows.push({ key: d, display: disp, dept: d, section: 'Single' });
    }
  });

  const getRowTotal = (row) => {
    let sum = 0;
    let hasData = false;
    const years = ['1st Year', '2nd Year', '3rd Year'];
    years.forEach(y => {
      const val = getSubAbsent(row.dept, y, row.section);
      if (typeof val === 'number') {
        sum += val;
        hasData = true;
      }
    });
    return hasData ? sum : '-';
  };

  const getColTotalForYear = (year) => {
    let sum = 0;
    let hasData = false;
    tableRows.forEach(row => {
      const val = getSubAbsent(row.dept, year, row.section);
      if (typeof val === 'number') {
        sum += val;
        hasData = true;
      }
    });
    return hasData ? sum : '-';
  };

  const getGrandTotalNew = () => {
    let sum = 0;
    let hasData = false;
    tableRows.forEach(row => {
      const val = getRowTotal(row);
      if (typeof val === 'number') {
        sum += val;
        hasData = true;
      }
    });
    return hasData ? sum : '-';
  };

  const renderAbsentCell = (dept, year, section) => {
    const val = getSubAbsent(dept, year, section);
    if (typeof val === 'number') {
      if (val > 0) {
        return <span className="text-red-600 font-bold">{val}</span>;
      }
      return <span className="text-green-600 font-semibold">{val}</span>;
    }
    return <span className="text-slate-400 font-normal">{val}</span>;
  };

  return (
    <PageWrapper title="Principal (Admin) System Overview">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
        }
      `}</style>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Enrolled" value={totalStudents} icon={Users} colorClass="bg-blue-100 text-blue-600" />
        <StatCard title="Total Absentees Today" value={totalAbsent} icon={UserX} colorClass="bg-red-100 text-red-600" />
        <StatCard title="Overall Attendance (Today)" value={`${overallPercent}%`} icon={PieChart} colorClass="bg-green-100 text-green-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Department Breakdown Table */}
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle>Attendance Overview (Number of Absentees Today)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                  <tr className="border-b border-slate-100">
                    <th className="px-4 py-3.5 text-left align-middle border-r border-slate-100 font-bold">Department</th>
                    <th className="px-4 py-3.5 text-center align-middle border-r border-slate-100 font-bold">1st Year</th>
                    <th className="px-4 py-3.5 text-center align-middle border-r border-slate-100 font-bold">2nd Year</th>
                    <th className="px-4 py-3.5 text-center align-middle border-r border-slate-100 font-bold">3rd Year</th>
                    <th className="px-4 py-3.5 text-center align-middle border-r border-slate-100 font-bold bg-slate-100/50">Total Absentees</th>
                    <th className="px-4 py-3.5 text-center align-middle font-bold">History</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tableRows.map((row, idx) => {
                    const isEven = idx % 2 === 0;
                    const rowTotal = getRowTotal(row);
                    const hasSubmittedToday = forwardedSubmissions.some(
                      s => s.department === row.dept && s.section === row.section
                    );

                    return (
                      <tr key={row.key} className={isEven ? 'bg-white hover:bg-slate-50/20' : 'bg-slate-50/30 hover:bg-slate-50/50'}>
                        <td className="px-4 py-3 font-bold text-slate-800 border-r border-slate-100">{row.display}</td>
                        <td className="px-4 py-3 text-center border-r border-slate-100">
                          {renderAbsentCell(row.dept, '1st Year', row.section)}
                        </td>
                        <td className="px-4 py-3 text-center border-r border-slate-100">
                          {renderAbsentCell(row.dept, '2nd Year', row.section)}
                        </td>
                        <td className="px-4 py-3 text-center border-r border-slate-100">
                          {renderAbsentCell(row.dept, '3rd Year', row.section)}
                        </td>
                        <td className="px-4 py-3 text-center font-extrabold text-slate-900 border-r border-slate-100 bg-slate-100/30">
                          {rowTotal}
                        </td>
                        <td className="px-4 py-3 text-center flex items-center justify-center gap-2">
                          <button
                            onClick={() => { setHistoryView({ department: row.dept, year: 'All', section: row.section }); }}
                            className="text-xs font-semibold border border-indigo-200 text-indigo-700 bg-indigo-50/30 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
                          >
                            <Calendar className="w-3.5 h-3.5" /> View History
                          </button>
                          {!hasSubmittedToday && (
                            <button
                              onClick={() => {
                                sendAlert(row.dept, `Attendance for Section ${row.section} has not been submitted for today.`);
                                showToast(`Alert sent to ${row.dept} HOD`, 'success');
                              }}
                              className="text-xs font-semibold bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1.5 rounded-lg transition-colors shadow-sm flex items-center"
                            >
                              Send Alert
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {/* Total Row */}
                  <tr className="bg-slate-100/80 font-bold border-t-2 border-slate-200">
                    <td className="px-4 py-3 text-slate-800 border-r border-slate-100 font-extrabold">TOTAL</td>
                    <td className="px-4 py-3 text-center text-red-600 border-r border-slate-100 font-extrabold">
                      {getColTotalForYear('1st Year')}
                    </td>
                    <td className="px-4 py-3 text-center text-red-600 border-r border-slate-100 font-extrabold">
                      {getColTotalForYear('2nd Year')}
                    </td>
                    <td className="px-4 py-3 text-center text-red-600 border-r border-slate-100 font-extrabold">
                      {getColTotalForYear('3rd Year')}
                    </td>
                    <td className="px-4 py-3 text-center text-slate-900 border-r border-slate-100 font-black bg-slate-200/60">
                      {getGrandTotalNew()}
                    </td>
                    <td className="px-4 py-3"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Trend Filters */}
        <Card className="shadow-sm">
          <CardHeader className="flex flex-col space-y-4">
            <div className="flex items-center space-x-2">
              <select
                className="text-lg font-bold bg-transparent outline-none cursor-pointer text-slate-800 hover:text-indigo-600 transition-colors border-none p-0 focus:ring-0"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="Weekly" className="text-base font-medium">Weekly Analytics</option>
                <option value="Monthly" className="text-base font-medium">Monthly Analytics</option>
              </select>
            </div>
            <div className="flex flex-col space-y-3">
              <select
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-medium outline-none cursor-pointer"
                value={filterDept}
                onChange={(e) => setFilterDept(e.target.value)}
              >
                <option value="All">All Departments</option>
                {depts.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>

              <select
                className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 bg-slate-50 text-slate-700 font-medium outline-none cursor-pointer"
                value={filterYearSec}
                onChange={(e) => setFilterYearSec(e.target.value)}
              >
                <option value="All">All Classes</option>
                <option value="1st Year All">1st Year (All Sections)</option>
                <option value="2nd Year All">2nd Year (All Sections)</option>
                <option value="3rd Year All">3rd Year (All Sections)</option>
                <option value="1st Year A">1st Year A (Computer)</option>
                <option value="1st Year B">1st Year B (Computer)</option>
                <option value="2nd Year A">2nd Year A (Computer)</option>
                <option value="2nd Year B">2nd Year B (Computer)</option>
                <option value="3rd Year A">3rd Year A (Computer)</option>
                <option value="3rd Year B">3rd Year B (Computer)</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <WaveChart data={waveData} xKey="label" yKey="attendance" color="#4F46E5" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

        {/* Approved Submissions List */}
        <Card className="lg:col-span-2 shadow-sm border-indigo-100">
          <CardHeader className="bg-indigo-50/20">
            <CardTitle className="flex items-center space-x-2">
              <ClipboardList className="w-5 h-5 text-indigo-600" />
              <span>Today's Approved Submissions</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {forwardedSubmissions.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center italic">No approved attendance reports submitted today yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                    <tr>
                      <th className="px-4 py-2">Date</th>
                      <th className="px-4 py-2">Department</th>
                      <th className="px-4 py-2">Class</th>
                      <th className="px-4 py-2 text-center">Absentees Count</th>
                      <th className="px-4 py-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {forwardedSubmissions.map(sub => (
                      <tr key={sub.id} className="hover:bg-slate-50/50">
                        <td className="px-4 py-3 text-slate-500">{sub.date}</td>
                        <td className="px-4 py-3 font-semibold text-slate-800">{sub.department}</td>
                        <td className="px-4 py-3 text-slate-600">{sub.year} - Section {sub.section}</td>
                        <td className="px-4 py-3 text-center font-bold text-slate-800">{sub.absenteesCount}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex items-center rounded-full bg-green-50 text-green-700 px-2.5 py-0.5 text-xs font-semibold border border-green-200">
                            Approved
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

        {/* CSV Export Card */}
        <Card className="hover:border-indigo-400 transition-colors shadow-sm cursor-pointer" onClick={handleExportCSV}>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-600">
              <Download className="h-6 w-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-lg">Export Attendance Summary</h4>
              <p className="text-sm text-slate-400 mt-0.5">Download current data in CSV format</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- Detailed View Modal --- */}
      {selectedDeptDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">{selectedDeptDetails} - Absentees by Class</h3>
              <button
                onClick={() => setSelectedDeptDetails(null)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Tabs */}
              <div className="flex border-b border-slate-200 mb-4">
                {['1st Year', '2nd Year', '3rd Year'].map(year => (
                  <button
                    key={year}
                    onClick={() => setActiveTab(year)}
                    className={`flex-1 py-2 text-sm font-semibold border-b-2 transition-colors ${activeTab === year
                      ? 'border-indigo-600 text-indigo-600'
                      : 'border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300'
                      }`}
                  >
                    {year}
                  </button>
                ))}
              </div>

              {/* Content */}
              <div className="space-y-3">
                {getDetailedStats(selectedDeptDetails)?.[activeTab]?.map(item => (
                  <div key={item.section} className="flex justify-between items-center bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                    <span className="font-semibold text-slate-700">Section {item.section}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-slate-400 font-medium">Absentees:</span>
                      <span className="font-bold text-red-600 bg-red-50 border border-red-200 px-3 py-1 rounded-lg min-w-[2.2rem] text-center text-base">
                        {item.absent}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button
                onClick={() => setSelectedDeptDetails(null)}
                className="px-5 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 font-semibold transition-colors text-sm shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- ADDED FEATURE: View Data Modal --- */}
      {showViewDataModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-indigo-600" />
                View Approved Data by Date
              </h3>
              <button
                onClick={() => setShowViewDataModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6">
              {/* Date Input */}
              <div className="flex items-center space-x-3 mb-6 bg-slate-50 p-3.5 rounded-xl border border-slate-100 max-w-sm">
                <span className="text-sm font-semibold text-slate-600">Select Date:</span>
                <input
                  type="date"
                  value={modalDate}
                  onChange={(e) => setModalDate(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white font-medium"
                />
              </div>

              {/* Records Table */}
              <div className="overflow-x-auto max-h-[300px] border border-slate-100 rounded-xl">
                {approvedForDate.length === 0 ? (
                  <p className="text-sm text-slate-400 py-10 text-center italic">No approved attendance records found for {modalDate}.</p>
                ) : (
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 uppercase text-xs sticky top-0">
                      <tr>
                        <th className="px-4 py-3">Department</th>
                        <th className="px-4 py-3">Year</th>
                        <th className="px-4 py-3 text-center">Section</th>
                        <th className="px-4 py-3 text-center">Number of Absentees</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {approvedForDate.map(row => (
                        <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 font-semibold text-slate-700">{row.department}</td>
                          <td className="px-4 py-3 text-slate-600">{row.year}</td>
                          <td className="px-4 py-3 text-center text-slate-600">{row.section}</td>
                          <td className="px-4 py-3 text-center font-bold text-red-600 text-base">{row.absenteesCount}</td>
                        </tr>
                      ))}
                      {/* Total row in modal */}
                      <tr className="bg-slate-50 font-bold border-t border-slate-200">
                        <td colSpan="3" className="px-4 py-3 text-right text-slate-700 font-extrabold">Total Absentees:</td>
                        <td className="px-4 py-3 text-center font-extrabold text-red-600 text-base bg-red-50/55">
                          {approvedForDate.reduce((sum, item) => sum + Number(item.absenteesCount), 0)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 text-right">
              <button
                onClick={() => setShowViewDataModal(false)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors text-sm shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </PageWrapper>
  );
};

export default AdminDashboard;
