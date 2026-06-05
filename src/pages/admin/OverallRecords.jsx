import React, { useState } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { FilterBar } from '../../components/shared/FilterBar';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { BarChart } from '../../components/charts/BarChart';
import { LineChart } from '../../components/charts/LineChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const OverallRecords = () => {
  const { students } = useContext(AppContext);
  const [filters, setFilters] = useState({
    department: { type: 'select', value: 'All', options: ['All', 'Mechanical', 'Automobile', 'Civil', 'Electrical and Electronic', 'Electronics and Communication', 'Computer', 'Communication and Computer Networking'] },
    year: { type: 'select', value: 'All', options: ['All', '2nd Year', '3rd Year'] },
    section: { type: 'select', value: 'All', options: ['All', 'A', 'B', 'Single'] },
    gender: { type: 'select', value: 'All', options: ['All', 'Boys', 'Girls'] },
    startDate: { type: 'date', value: '' },
    endDate: { type: 'date', value: '' }
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => {
      const newFilters = { ...prev, [key]: { ...prev[key], value } };
      
      // Dynamically update section options based on department
      if (key === 'department') {
        if (value === 'Computer') {
          newFilters.section.options = ['All', 'A', 'B'];
          if (newFilters.section.value === 'Single') newFilters.section.value = 'All';
        } else if (value === 'All') {
          newFilters.section.options = ['All', 'A', 'B', 'Single'];
        } else {
          newFilters.section.options = ['All', 'Single'];
          if (newFilters.section.value === 'A' || newFilters.section.value === 'B') {
            newFilters.section.value = 'All';
          }
        }
      }
      return newFilters;
    });
  };

  // Filter students based on selected dropdowns
  let filteredStudents = students;
  if (filters.department.value !== 'All') {
    filteredStudents = filteredStudents.filter(s => s.department === filters.department.value);
  }
  if (filters.year.value !== 'All') {
    filteredStudents = filteredStudents.filter(s => s.year === filters.year.value);
  }
  if (filters.section.value !== 'All') {
    filteredStudents = filteredStudents.filter(s => s.section === filters.section.value);
  }
  if (filters.gender.value !== 'All') {
    const genderMatch = filters.gender.value === 'Boys' ? 'Male' : 'Female';
    filteredStudents = filteredStudents.filter(s => s.gender === genderMatch);
  }

  const totalFiltered = filteredStudents.length;

  // 1. Calculate dynamic Department Bar Chart Data
  const depts = ['Mechanical', 'Automobile', 'Civil', 'Electrical and Electronic', 'Electronics and Communication', 'Computer', 'Communication and Computer Networking'];
  let deptChartData = [];
  depts.forEach(dept => {
    const deptStus = filteredStudents.filter(s => s.department === dept);
    if (deptStus.length > 0) {
      // Mock percentage based on length to create visual difference
      const mockPct = Math.min(100, Math.max(0, 75 + (deptStus.length % 20)));
      deptChartData.push({ name: dept, percentage: mockPct });
    }
  });
  if (deptChartData.length === 0) {
    deptChartData = [{ name: 'No Data', percentage: 0 }];
  }

  // 2. Calculate dynamic Year Pie Chart Data
  const years = ['2nd Year', '3rd Year'];
  let yearPieData = [];
  years.forEach(yr => {
    const yrStus = filteredStudents.filter(s => s.year === yr);
    if (yrStus.length > 0) {
      yearPieData.push({ name: yr, value: yrStus.length });
    }
  });
  if (yearPieData.length === 0) {
    yearPieData = [{ name: 'No Data', value: 1 }];
  }
  const yearColors = ['#2563EB', '#D97706', '#16A34A'];

  // 3. Calculate dynamic Monthly Trend
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const baseMonthlyPercent = totalFiltered === 0 ? 0 : 80 + (totalFiltered % 10);
  const monthlyTrendData = months.map((month, idx) => ({
    month,
    percentage: totalFiltered === 0 ? 0 : Math.min(100, Math.round(baseMonthlyPercent + Math.sin(idx + totalFiltered) * 8))
  }));

  // 4. Calculate dynamic Stat Cards
  let highestDept = { name: '-', percentage: 0 };
  let lowestDept = { name: '-', percentage: 100 };
  let sumPercent = 0;

  deptChartData.forEach(d => {
    if (d.name !== 'No Data') {
      if (d.percentage > highestDept.percentage) highestDept = d;
      if (d.percentage < lowestDept.percentage) lowestDept = d;
      sumPercent += d.percentage;
    }
  });

  const validDeptsCount = deptChartData.filter(d => d.name !== 'No Data').length;
  const collegeAverage = validDeptsCount > 0 ? (sumPercent / validDeptsCount).toFixed(1) : '0.0';
  if (validDeptsCount === 0) {
    lowestDept.percentage = 0;
  }

  return (
    <PageWrapper title="Overall Records">
      <FilterBar filters={filters} onFilterChange={handleFilterChange} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Department-wise Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart data={deptChartData} xKey="name" yKey="percentage" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Year-wise Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={yearPieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {yearPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={yearColors[index % yearColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Monthly Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <LineChart 
            data={monthlyTrendData} 
            xKey="month" 
            yKey="percentage" 
            referenceValue={75} 
            referenceLabel="Min. Requirement" 
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-light-blue border-none">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-text-secondary font-medium uppercase tracking-wider">Highest Attendance</p>
            <h3 className="text-2xl font-bold text-primary-blue mt-2">
              {highestDept.name !== '-' ? `${highestDept.name} — ${highestDept.percentage}%` : 'N/A'}
            </h3>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-none">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-text-secondary font-medium uppercase tracking-wider">Lowest Attendance</p>
            <h3 className="text-2xl font-bold text-danger-red mt-2">
              {lowestDept.name !== '-' ? `${lowestDept.name} — ${lowestDept.percentage}%` : 'N/A'}
            </h3>
          </CardContent>
        </Card>
        <Card className="bg-slate-100 border-none">
          <CardContent className="p-6 text-center">
            <p className="text-sm text-text-secondary font-medium uppercase tracking-wider">College Average</p>
            <h3 className="text-2xl font-bold text-text-primary mt-2">{collegeAverage}%</h3>
          </CardContent>
        </Card>
      </div>
    </PageWrapper>
  );
};

export default OverallRecords;
