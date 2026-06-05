import React, { useContext } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { AppContext } from '../../context/AppContext';
import { StatCard } from '../../components/shared/StatCard';
import { Users, UserPlus, UserCog, UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';

const SuperAdminDashboard = () => {
  const { users } = useContext(AppContext);

  const hodCount = users.filter(u => u.role === 'hod').length;
  const facultyCount = users.filter(u => u.role === 'faculty').length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const totalUsers = users.length;

  return (
    <PageWrapper title="Super Admin Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Accounts" value={totalUsers} icon={Users} colorClass="bg-blue-100 text-blue-600" />
        <StatCard title="Total HODs" value={hodCount} icon={UserCog} colorClass="bg-purple-100 text-purple-600" />
        <StatCard title="Total Faculties" value={facultyCount} icon={UserCheck} colorClass="bg-green-100 text-green-600" />
        <StatCard title="Total Admins" value={adminCount} icon={UserPlus} colorClass="bg-amber-100 text-amber-600" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Accounts Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Username</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-gray">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-text-primary">{user.name}</td>
                    <td className="px-4 py-3 text-text-secondary uppercase">{user.role}</td>
                    <td className="px-4 py-3 text-text-secondary">{user.department}</td>
                    <td className="px-4 py-3 text-text-secondary">{user.username}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
};

export default SuperAdminDashboard;
