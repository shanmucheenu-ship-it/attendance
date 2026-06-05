import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ClipboardList, BarChart2, LayoutDashboard, LogOut, Users, GraduationCap } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

export const Sidebar = ({ isOpen, setIsOpen }) => {
  const { auth, logout } = useContext(AppContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const superAdminLinks = [
    { name: 'Dashboard', path: '/superadmin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Users', path: '/superadmin/users', icon: Users },
    { name: 'Manage Students', path: '/superadmin/students', icon: GraduationCap },
  ];

  const adminLinks = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
  ];

  const hodLinks = [
    { name: 'Dashboard', path: '/hod/dashboard', icon: LayoutDashboard },
  ];

  const facultyLinks = [
    { name: 'Submit Attendance', path: '/faculty/submit', icon: ClipboardList },
    { name: 'Student Details', path: '/faculty/students', icon: GraduationCap },
  ];

  let links = [];
  if (auth.role === 'superadmin') links = superAdminLinks;
  else if (auth.role === 'admin') links = adminLinks;
  else if (auth.role === 'hod') links = hodLinks;
  else if (auth.role === 'faculty') links = facultyLinks;

  return (
    <aside
      className={`fixed left-0 top-0 h-screen w-64 bg-white border-r border-slate-100 shadow-[4px_0_24px_rgb(0,0,0,0.02)] flex flex-col z-40 transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className="p-6 flex items-center justify-center">
        <img src="https://srptc.ac.in/wp-content/uploads/2021/04/Polytechnic-1.png" alt="Logo" className="h-12 object-contain hover:scale-105 transition-transform duration-300 drop-shadow-sm" />
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            onClick={() => setIsOpen(false)}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-3.5 rounded-xl transition-all duration-300 font-semibold group relative overflow-hidden ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-50 to-blue-50/30 text-indigo-700 shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
              }`
            }
          >
            <link.icon className="h-5 w-5" />
            <span>{link.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-border-gray">
        <button
          onClick={handleLogout}
          className="flex w-full items-center space-x-3 px-4 py-3 rounded-xl text-text-secondary hover:bg-red-50 hover:text-danger-red transition-colors font-medium"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};
