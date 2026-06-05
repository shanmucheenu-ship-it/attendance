import React, { useContext } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { AppContext } from '../../context/AppContext';
import { StatCard } from '../../components/shared/StatCard';
import { Users, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { BarChart } from '../../components/charts/BarChart';

const FacultyDashboard = () => {
  const { auth, students } = useContext(AppContext);
  const deptStudents = students.filter(s => s.department === auth.user.department);

  const totalStudents = deptStudents.length;
  const secondYear = deptStudents.filter(s => s.year === '2nd Year').length;
  const thirdYear = deptStudents.filter(s => s.year === '3rd Year').length;

  const chartData = [
    { name: '2nd Year', Students: secondYear },
    { name: '3rd Year', Students: thirdYear }
  ];

  return (
    <PageWrapper title="Faculty Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total Students" value={totalStudents} icon={Users} colorClass="bg-blue-100 text-blue-600" />
        <StatCard title="2nd Year" value={secondYear} icon={GraduationCap} colorClass="bg-purple-100 text-purple-600" />
        <StatCard title="3rd Year" value={thirdYear} icon={TrendingUp} colorClass="bg-pink-100 text-pink-600" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Students Distribution in {auth.user.department}</CardTitle>
        </CardHeader>
        <CardContent>
          <BarChart data={chartData} xKey="name" yKey="Students" />
        </CardContent>
      </Card>
    </PageWrapper>
  );
};

export default FacultyDashboard;
