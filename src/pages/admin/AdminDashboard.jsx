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
  const [selectedDeptDetails, setSelectedDeptDetails] = useState(null);
  const [activeTab, setActiveTab] = useState('2nd Year');
  const [printData, setPrintData] = useState(null);
  const [modalDate, setModalDate] = useState(new Date().toISOString().split('T')[0]);
  const [historyView, setHistoryView] = useState(null);

  const today = new Date().toISOString().split('T')[0];

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

  const handlePrint = (dept, year, section) => {
    const dStudents = students.filter(s => s.department === dept);
    const deptSubs = attendance.submittedSessions.filter(
      s => s.status === 'Approved' && s.date === today && s.department === dept
    );
    
    let rows = [];
    const years = ['2nd Year', '3rd Year'];
    const sections = dept === 'Computer' ? ['A', 'B'] : ['Single'];
    
    if (year === 'All' && section === 'All') {
      years.forEach(y => {
        sections.forEach(sec => {
          const total = dStudents.filter(s => s.year === y && s.section === sec).length;
          const sub = deptSubs.find(s => s.year === y && s.section === sec);
          const absent = sub ? Number(sub.absenteesCount) : 0;
          const percent = total > 0 ? Math.round(((total - absent) / total) * 100) : 100;
          rows.push({ class: `${y} - Section ${sec}`, total, absent, percent });
        });
      });
    } else {
      const total = dStudents.filter(s => s.year === year && s.section === section).length;
      const sub = deptSubs.find(s => s.year === year && s.section === section);
      const absent = sub ? Number(sub.absenteesCount) : 0;
      const percent = total > 0 ? Math.round(((total - absent) / total) * 100) : 100;
      rows.push({ class: `${year} - Section ${section}`, total, absent, percent });
    }
    
    setPrintData({ dept, year, section, rows, date: new Date().toLocaleDateString() });
    
    setTimeout(() => {
      window.print();
    }, 200);
  };

  const getDetailedStats = (dept) => {
    if (!dept) return null;
    const dStudents = students.filter(s => s.department === dept);
    const deptSubs = forwardedSubmissions.filter(s => s.department === dept);
    
    const years = ['2nd Year', '3rd Year'];
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
  
  const deptStats = depts.map(d => {
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
    
    return { name: d, total: dTotal, present: dPresent, absent: dAbsent };
  });

  const overallPercent = totalStudents > 0 ? Math.round((totalPresent / totalStudents) * 100) : 100;

  const getColTotal = (year, section) => {
    let sum = 0;
    let hasData = false;
    depts.forEach(d => {
      const val = getSubAbsent(d, year, section);
      if (typeof val === 'number') {
        sum += val;
        hasData = true;
      }
    });
    return hasData ? sum : '-';
  };

  const getDeptTotal = (deptName) => {
    let sum = 0;
    let hasData = false;
    const years = ['2nd Year', '3rd Year'];
    const sections = deptName === 'Computer' ? ['A', 'B'] : ['Single'];
    
    years.forEach(y => {
      sections.forEach(s => {
        const val = getSubAbsent(deptName, y, s);
        if (typeof val === 'number') {
          sum += val;
          hasData = true;
        }
      });
    });
    return hasData ? sum : '-';
  };

  const getGrandTotal = () => {
    let sum = 0;
    let hasData = false;
    depts.forEach(d => {
      const val = getDeptTotal(d);
      if (typeof val === 'number') {
        sum += val;
        hasData = true;
      }
    });
    return hasData ? sum : '-';
  };

  // Analytics wave chart filters
  const [filterDept, setFilterDept] = useState('All');
  const [filterYearSec, setFilterYearSec] = useState('All');
  const [timeFilter, setTimeFilter] = useState('Weekly');

  // Compute trend data based on filters and real approved submissions
  const getDatesForWeek = () => {
    const current = new Date();
    const week = [];
    const first = current.getDate() - current.getDay() + 1; // Monday
    for (let i = 0; i < 6; i++) {
      const next = new Date(current.getTime());
      next.setDate(first + i);
      week.push(next.toISOString().split('T')[0]);
    }
    return week;
  };

  let xLabels;
  if (timeFilter === 'Weekly') {
    xLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  } else {
    xLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  }

  const waveData = xLabels.map((label, index) => {
    let filteredSubs = [];
    
    if (timeFilter === 'Weekly') {
      const weekDates = getDatesForWeek();
      const dateStr = weekDates[index];
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
        return weekIndex === index;
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

    const pct = totalStrength > 0 
      ? Math.max(0, Math.round(((totalStrength - dayAbsent) / totalStrength) * 100))
      : 100;

    return {
      label: label,
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
    const years = ['2nd Year', '3rd Year'];
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
        <StatCard title="Total Approved Absentees (Today)" value={totalAbsent} icon={UserX} colorClass="bg-red-100 text-red-600" />
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
                <option value="2nd Year All">2nd Year (All Sections)</option>
                <option value="3rd Year All">3rd Year (All Sections)</option>
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
                {['2nd Year', '3rd Year'].map(year => (
                  <button
                    key={year}
                    onClick={() => setActiveTab(year)}
                    className={`flex-1 py-2 text-sm font-semibold border-b-2 transition-colors ${
                      activeTab === year 
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

      {/* Printable Report Section */}
      <div id="printable-report" className="hidden print:block absolute inset-0 bg-white z-[9999] p-8 text-black min-h-screen">
        {printData && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center border-b-2 border-black pb-4 mb-6">
              <h1 className="text-2xl font-bold uppercase text-slate-800">Sri Ramakrishna Polytechnic College</h1>
              <h2 className="text-xl font-semibold mt-2">Department of {printData.dept}</h2>
              <h3 className="text-lg mt-1 font-medium text-slate-600">Daily Absentee Summary Report</h3>
            </div>

            <div className="flex justify-between mb-6 text-sm font-bold">
              <div>Class: {printData.year === 'All' ? 'Entire Department (All Classes)' : `${printData.year} - Section ${printData.section}`}</div>
              <div>Date: {printData.date}</div>
            </div>

            <table className="w-full text-left border-collapse mb-12 border border-black">
              <thead>
                <tr>
                  <th className="border border-black p-2 bg-gray-100 text-center">Class / Section</th>
                  <th className="border border-black p-2 bg-gray-100 text-center">Total Strength</th>
                  <th className="border border-black p-2 bg-gray-100 text-center">Absentees Count</th>
                  <th className="border border-black p-2 bg-gray-100 text-center">Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {printData.rows.length > 0 ? (
                  printData.rows.map((row, idx) => (
                    <tr key={idx}>
                      <td className="border border-black p-2 text-center font-semibold">{row.class}</td>
                      <td className="border border-black p-2 text-center">{row.total}</td>
                      <td className="border border-black p-2 text-center font-bold text-red-600">{row.absent}</td>
                      <td className="border border-black p-2 text-center">{row.percent}%</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="border border-black p-8 text-center italic text-gray-500">No absentees to report today.</td>
                  </tr>
                )}
              </tbody>
            </table>

            <div className="flex justify-between mt-32 pt-8">
              <div className="text-center">
                <div className="border-t border-black w-48 mx-auto pt-2 font-bold">HOD Signature</div>
              </div>
              <div className="text-center">
                <div className="border-t border-black w-48 mx-auto pt-2 font-bold">Principal Signature</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageWrapper>
  );
};

export default AdminDashboard;
