/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  // Auth State
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('ams_auth');
    return saved ? JSON.parse(saved) : { isLoggedIn: false, role: null, user: null };
  });

  const [showViewDataModal, setShowViewDataModal] = useState(false);

  // Database States
  const [users, setUsers] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({ currentSession: null, submittedSessions: [] });
  
  const [toast, setToast] = useState({ show: false, message: '', type: 'info' });
  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem('ams_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync auth and alerts to local storage
  useEffect(() => localStorage.setItem('ams_auth', JSON.stringify(auth)), [auth]);
  useEffect(() => localStorage.setItem('ams_alerts', JSON.stringify(alerts)), [alerts]);

  // Initial Fetch & Realtime subscriptions
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [usersRes, studentsRes, attendanceRes] = await Promise.all([
          supabase.from('users').select('*'),
          supabase.from('students').select('*'),
          supabase.from('attendance_sessions').select('*')
        ]);

        if (usersRes.error) {
          console.error("Supabase select users error:", usersRes.error);
        } else if (usersRes.data) {
          setUsers(usersRes.data);
        }
        
        if (studentsRes.error) {
          console.error("Supabase select students error:", studentsRes.error);
        } else if (studentsRes.data) {
          setStudents(studentsRes.data.map(s => ({
            ...s,
            regNo: s.reg_no,
            departmentCode: s.department_code
          })));
        }
        
        if (attendanceRes.error) {
          console.error("Supabase select attendance_sessions error:", attendanceRes.error);
        } else if (attendanceRes.data) {
          const mapped = attendanceRes.data.map(row => ({
            id: row.id,
            date: row.date,
            department: row.department,
            year: row.year,
            section: row.section,
            absenteesCount: Number(row.absentees_count),
            status: row.status === 'Pending Approval' ? 'Pending' : row.status,
            forwardedToAdmin: row.forwarded_to_admin
          }));
          setAttendance(prev => ({ ...prev, submittedSessions: mapped }));
        }
      } catch (err) {
        console.error("Exception fetching initial data from Supabase:", err);
      }
    };

    fetchInitialData();

    // Subscribe to attendance_sessions changes for realtime updates
    const attendanceSub = supabase.channel('public:attendance_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_sessions' }, payload => {
        // Refetch everything to keep state totally in sync (lazy approach, but effective)
        fetchInitialData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(attendanceSub);
    };
  }, []);

  const login = (role, user) => setAuth({ isLoggedIn: true, role, user });
  const logout = () => setAuth({ isLoggedIn: false, role: null, user: null });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'info' }), 3000);
  };

  const sendAlert = (department, message) => {
    const newAlert = { id: Date.now(), department, message, read: false, date: new Date().toISOString().split('T')[0] };
    setAlerts(prev => [...prev, newAlert]);
  };
  const markAlertAsRead = (id) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));

  // --- Users Methods ---
  const addUser = async (newUser) => {
    const { id, created_at, ...insertData } = newUser;
    const { data, error } = await supabase.from('users').insert([insertData]).select();
    if (error) {
      console.error("Supabase insert user error:", error);
      showToast("Error adding user: " + error.message, 'error');
    } else if (data) {
      setUsers(prev => [...prev, data[0]]);
      showToast("User added successfully", 'success');
    }
  };
  const updateUser = async (id, updatedUser) => {
    const { id: _, created_at, ...updateData } = updatedUser;
    const { error } = await supabase.from('users').update(updateData).eq('id', id);
    if (error) {
      console.error("Supabase update user error:", error);
      showToast("Error updating user: " + error.message, 'error');
    } else {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updatedUser } : u));
      showToast("User updated successfully", 'success');
    }
  };
  const deleteUser = async (id) => {
    const { error } = await supabase.from('users').delete().eq('id', id);
    if (error) {
      console.error("Supabase delete user error:", error);
      showToast("Error deleting user: " + error.message, 'error');
    } else {
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast("User deleted successfully", 'success');
    }
  };

  // --- Students Methods ---
  const addStudent = async (newStudent) => {
    const dbStudent = {
      reg_no: newStudent.regNo,
      name: newStudent.name,
      gender: newStudent.gender,
      year: newStudent.year,
      section: newStudent.section,
      department: newStudent.department,
      department_code: newStudent.departmentCode || ''
    };
    const { data, error } = await supabase.from('students').insert([dbStudent]).select();
    if (error) {
      console.error("Supabase insert student error:", error);
      showToast("Error adding student: " + error.message, 'error');
    } else if (data) {
      setStudents(prev => [...prev, { ...data[0], regNo: data[0].reg_no, departmentCode: data[0].department_code }]);
      showToast("Student added successfully", 'success');
    }
  };
  const updateStudent = async (id, updatedStudent) => {
    const dbStudent = {
      reg_no: updatedStudent.regNo,
      name: updatedStudent.name,
      gender: updatedStudent.gender,
      year: updatedStudent.year,
      section: updatedStudent.section,
      department: updatedStudent.department,
      department_code: updatedStudent.departmentCode || ''
    };
    const { error } = await supabase.from('students').update(dbStudent).eq('id', id);
    if (error) {
      console.error("Supabase update student error:", error);
      showToast("Error updating student: " + error.message, 'error');
    } else {
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updatedStudent } : s));
      showToast("Student updated successfully", 'success');
    }
  };
  const deleteStudent = async (id) => {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) {
      console.error("Supabase delete student error:", error);
      showToast("Error deleting student: " + error.message, 'error');
    } else {
      setStudents(prev => prev.filter(s => s.id !== id));
      showToast("Student deleted successfully", 'success');
    }
  };

  // --- Attendance Methods ---
  const getSessionStudents = (year, section, department) => {
    const today = new Date().toISOString().split('T')[0];
    const existing = attendance.submittedSessions.find(
      s => s.year === year && s.section === section && s.department === department && s.date === today && s.status !== 'Rejected'
    );
    if (existing && existing.students) return existing.students; 

    return students
      .filter(s => (year === 'All' || s.year === year) && (section === 'All' || s.section === section) && s.department === department)
      .map(s => ({ ...s, status: 'Present' }));
  };

  const saveCurrentSession = (sessionData) => setAttendance(prev => ({ ...prev, currentSession: sessionData }));

  const submitAttendance = async (sessionData, role) => {
    const status = role === 'faculty' ? 'Pending Approval' : 'Approved';
    const payload = {
      department: sessionData.department,
      year: sessionData.year,
      section: sessionData.section,
      absentees_count: Number(sessionData.absenteesCount),
      date: sessionData.date,
      status: status,
      forwarded_to_admin: role !== 'faculty'
    };
    
    // First clear duplicate if it exists (violates unique_attendance_per_class_date constraint in DB)
    const { error: deleteError } = await supabase
      .from('attendance_sessions')
      .delete()
      .eq('date', payload.date)
      .eq('department', payload.department)
      .eq('year', payload.year)
      .eq('section', payload.section);
      
    if (deleteError) {
      console.error("Supabase delete duplicate session error:", deleteError);
    }
    
    const { data, error } = await supabase.from('attendance_sessions').insert([payload]).select();
    if (error) {
      console.error("Supabase insert attendance_session error:", error);
      showToast("Supabase Error: " + error.message, 'error');
      return;
    }
    
    if (data && data[0]) {
      const newSession = {
        id: data[0].id,
        date: data[0].date,
        department: data[0].department,
        year: data[0].year,
        section: data[0].section,
        absenteesCount: Number(data[0].absentees_count),
        status: data[0].status === 'Pending Approval' ? 'Pending' : data[0].status,
        forwardedToAdmin: data[0].forwarded_to_admin
      };
      setAttendance(prev => {
        const filtered = prev.submittedSessions.filter(
          s => !(s.date === newSession.date && s.department === newSession.department && s.year === newSession.year && s.section === newSession.section)
        );
        return {
          ...prev,
          submittedSessions: [...filtered, newSession]
        };
      });
      showToast("Attendance saved successfully", 'success');
    }
  };

  const approveSubmission = async (id) => {
    const { error } = await supabase.from('attendance_sessions').update({ status: 'Approved', forwarded_to_admin: true }).eq('id', id);
    if (error) {
      console.error("Supabase approveSubmission error:", error);
      showToast('Error approving submission: ' + error.message, 'error');
    } else {
      setAttendance(prev => ({
        ...prev,
        submittedSessions: prev.submittedSessions.map(s => s.id === id ? { ...s, status: 'Approved', forwardedToAdmin: true } : s)
      }));
      showToast('Submission approved successfully', 'success');
    }
  };

  const rejectSubmission = async (id) => {
    const { error } = await supabase.from('attendance_sessions').update({ status: 'Rejected' }).eq('id', id);
    if (error) {
      console.error("Supabase rejectSubmission error:", error);
      showToast('Error rejecting submission: ' + error.message, 'error');
    } else {
      setAttendance(prev => ({
        ...prev,
        submittedSessions: prev.submittedSessions.map(s => s.id === id ? { ...s, status: 'Rejected' } : s)
      }));
      showToast('Submission rejected successfully', 'success');
    }
  };

  const forwardSubmission = async (id) => {
    const { error } = await supabase.from('attendance_sessions').update({ forwarded_to_admin: true }).eq('id', id);
    if (error) {
      console.error("Supabase forwardSubmission error:", error);
      showToast('Error forwarding submission: ' + error.message, 'error');
    } else {
      setAttendance(prev => ({
        ...prev,
        submittedSessions: prev.submittedSessions.map(s => s.id === id ? { ...s, forwardedToAdmin: true } : s)
      }));
      showToast('Submission forwarded successfully', 'success');
    }
  };

  const deleteSubmission = async (id) => {
    const { error } = await supabase.from('attendance_sessions').delete().eq('id', id);
    if (error) {
      console.error("Supabase deleteSubmission error:", error);
      showToast('Error deleting submission: ' + error.message, 'error');
    } else {
      setAttendance(prev => ({
        ...prev,
        submittedSessions: prev.submittedSessions.filter(s => s.id !== id)
      }));
      showToast('Submission deleted successfully', 'success');
    }
  };

  const clearSubmissions = async (department) => {
    if (department) {
      const { error } = await supabase.from('attendance_sessions').delete().eq('department', department);
      if (error) {
        console.error("Supabase clearSubmissions error:", error);
        showToast('Error clearing submissions: ' + error.message, 'error');
      } else {
        setAttendance(prev => ({
          ...prev,
          submittedSessions: prev.submittedSessions.filter(s => s.department !== department)
        }));
        showToast('Submissions cleared successfully', 'success');
      }
    }
  };

  return (
    <AppContext.Provider value={{
      auth, login, logout,
      users, addUser, updateUser, deleteUser,
      students, addStudent, updateStudent, deleteStudent,
      attendance, saveCurrentSession, submitAttendance, getSessionStudents, clearSubmissions,
      approveSubmission, rejectSubmission, forwardSubmission, deleteSubmission,
      toast, showToast,
      showViewDataModal, setShowViewDataModal,
      alerts, sendAlert, markAlertAsRead
    }}>
      {children}
    </AppContext.Provider>
  );
};
