import React, { createContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { defaultUsers, mockStudents } from '../data/mockData.js';

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
  const hasStudentRequestsTableRef = useRef(true);
  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem('ams_alerts');
    return saved ? JSON.parse(saved) : [];
  });

  const initDetailedSessions = () => {
    const saved = localStorage.getItem('ams_detailed_sessions');
    if (saved) return JSON.parse(saved);
    
    const mockDets = [
      {
        id: 'det-mock1',
        date: '2026-05-01',
        department: 'Computer',
        year: '3rd Year',
        section: 'A',
        absenteesCount: 2,
        absenteesList: [
          { regNo: "24504712", name: "JEEVA I", gender: "Male" },
          { regNo: "24504748", name: "SANJAY J", gender: "Male" }
        ],
        status: 'Approved',
        submittedBy: 'fac_cse'
      },
      {
        id: 'det-mock2',
        date: '2026-05-02',
        department: 'Computer',
        year: '3rd Year',
        section: 'A',
        absenteesCount: 1,
        absenteesList: [
          { regNo: "24504712", name: "JEEVA I", gender: "Male" }
        ],
        status: 'Approved',
        submittedBy: 'fac_cse'
      },
      {
        id: 'det-mock3',
        date: '2026-05-03',
        department: 'Computer',
        year: '3rd Year',
        section: 'A',
        absenteesCount: 3,
        absenteesList: [
          { regNo: "25504328", name: "ABI R", gender: "Male" },
          { regNo: "25504329", name: "AKASH K", gender: "Male" },
          { regNo: "25504330", name: "ANGATH SUBRAMANIAM S", gender: "Male" }
        ],
        status: 'Approved',
        submittedBy: 'fac_cse'
      },
      {
        id: 'det-mock4',
        date: '2026-05-05',
        department: 'Computer',
        year: '3rd Year',
        section: 'A',
        absenteesCount: 2,
        absenteesList: [
          { regNo: "24504712", name: "JEEVA I", gender: "Male" },
          { regNo: "25504328", name: "ABI R", gender: "Male" }
        ],
        status: 'Approved',
        submittedBy: 'fac_cse'
      },
      {
        id: 'det-mock5',
        date: '2026-05-06',
        department: 'Computer',
        year: '3rd Year',
        section: 'A',
        absenteesCount: 4,
        absenteesList: [
          { regNo: "25504329", name: "AKASH K", gender: "Male" },
          { regNo: "25504330", name: "ANGATH SUBRAMANIAM S", gender: "Male" },
          { regNo: "25504331", name: "ANUSRI V", gender: "Female" },
          { regNo: "25504332", name: "BALA GANESH A", gender: "Male" }
        ],
        status: 'Approved',
        submittedBy: 'fac_cse'
      }
    ];
    localStorage.setItem('ams_detailed_sessions', JSON.stringify(mockDets));
    return mockDets;
  };

  const [detailedSessions, setDetailedSessions] = useState(() => {
    return initDetailedSessions();
  });

  const [studentRequests, setStudentRequests] = useState(() => {
    const saved = localStorage.getItem('ams_student_requests');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync auth, alerts, detailedSessions, and studentRequests to local storage
  useEffect(() => localStorage.setItem('ams_auth', JSON.stringify(auth)), [auth]);
  useEffect(() => localStorage.setItem('ams_alerts', JSON.stringify(alerts)), [alerts]);
  useEffect(() => localStorage.setItem('ams_detailed_sessions', JSON.stringify(detailedSessions)), [detailedSessions]);
  useEffect(() => localStorage.setItem('ams_student_requests', JSON.stringify(studentRequests)), [studentRequests]);

  // Initial Fetch & Realtime subscriptions
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        let hasStudentRequestsTable = false;
        try {
          const healthRes = await fetch('http://localhost:4000/api/health');
          if (healthRes.ok) {
            const healthData = await healthRes.json();
            if (healthData && healthData.tables) {
              hasStudentRequestsTable = !!healthData.tables.student_requests;
            }
          }
        } catch (e) {
          console.warn("Could not check table status from backend health check:", e);
        }
        hasStudentRequestsTableRef.current = hasStudentRequestsTable;

        let requestsRes = { data: null, error: null };
        if (hasStudentRequestsTable) {
          try {
            requestsRes = await supabase.from('student_requests').select('*');
          } catch (e) {
            console.warn("student_requests table might not exist yet:", e);
          }
        }

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

        if (hasStudentRequestsTable && requestsRes && !requestsRes.error && requestsRes.data) {
          setStudentRequests(requestsRes.data.map(r => ({
            id: r.id,
            requestType: r.request_type,
            name: r.name,
            regNo: r.reg_no,
            gender: r.gender,
            year: r.year,
            section: r.section,
            department: r.department,
            reason: r.reason,
            status: r.status,
            createdAt: r.created_at
          })));
        }
      } catch (err) {
        console.error("Exception fetching initial data from Supabase:", err);
      }
    };

    fetchInitialData();

    // Subscribe to attendance_sessions changes for realtime updates
    const attendanceSub = supabase.channel('public:attendance_sessions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'attendance_sessions' }, payload => {
        const { eventType, new: newRow, old: oldRow } = payload;
        setAttendance(prev => {
          let updatedSessions = [...prev.submittedSessions];
          
          if (eventType === 'INSERT' && newRow) {
            const mappedNew = {
              id: newRow.id,
              date: newRow.date,
              department: newRow.department,
              year: newRow.year,
              section: newRow.section,
              absenteesCount: Number(newRow.absentees_count),
              status: newRow.status === 'Pending Approval' ? 'Pending' : newRow.status,
              forwardedToAdmin: newRow.forwarded_to_admin
            };
            if (!updatedSessions.some(s => s.id === mappedNew.id)) {
              updatedSessions.push(mappedNew);
            }
          } else if (eventType === 'UPDATE' && newRow) {
            updatedSessions = updatedSessions.map(s => s.id === newRow.id ? {
              id: newRow.id,
              date: newRow.date,
              department: newRow.department,
              year: newRow.year,
              section: newRow.section,
              absenteesCount: Number(newRow.absentees_count),
              status: newRow.status === 'Pending Approval' ? 'Pending' : newRow.status,
              forwardedToAdmin: newRow.forwarded_to_admin
            } : s);
          } else if (eventType === 'DELETE' && oldRow) {
            updatedSessions = updatedSessions.filter(s => s.id !== oldRow.id);
          }
          
          return {
            ...prev,
            submittedSessions: updatedSessions
          };
        });
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
    const insertData = { ...newUser };
    delete insertData.id;
    delete insertData.created_at;
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
    const updateData = { ...updatedUser };
    delete updateData.id;
    delete updateData.created_at;
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

  const importStudentsBulk = async (importedStudents, department, year, replaceExisting) => {
    try {
      if (replaceExisting) {
        const { error: deleteError } = await supabase
          .from('students')
          .delete()
          .eq('department', department)
          .eq('year', year);
          
        if (deleteError) {
          console.error("Supabase bulk delete students error:", deleteError);
          showToast("Error removing existing students: " + deleteError.message, 'error');
          return false;
        }
      }

      const getDeptCode = (dept) => {
        if (dept === 'Computer') return 'COMP';
        if (dept === 'Mechanical') return 'MECH';
        if (dept === 'Automobile') return 'AUTO';
        if (dept === 'Civil') return 'CIVIL';
        if (dept === 'Electrical and Electronic') return 'EEE';
        if (dept === 'Electronics and Communication') return 'ECE';
        if (dept === 'Communication and Computer Networking') return 'CCN';
        return '';
      };

      const deptCode = getDeptCode(department);

      const dbStudents = importedStudents.map(s => ({
        reg_no: s.regNo,
        name: s.name,
        gender: s.gender || 'Male',
        year: year,
        section: s.section || (department === 'Computer' ? 'A' : 'Single'),
        department: department,
        department_code: deptCode
      }));

      let studentsToInsert = [...dbStudents];
      if (!replaceExisting) {
        const existingRegNos = new Set(students.map(s => s.regNo.toLowerCase()));
        studentsToInsert = dbStudents.filter(s => !existingRegNos.has(s.reg_no.toLowerCase()));
        
        if (studentsToInsert.length === 0) {
          showToast("All imported students already exist in records.", 'info');
          return true;
        }
      }

      const { data, error: insertError } = await supabase
        .from('students')
        .insert(studentsToInsert)
        .select();

      if (insertError) {
        console.error("Supabase bulk insert students error:", insertError);
        showToast("Error importing students: " + insertError.message, 'error');
        return false;
      }

      if (data) {
        const newStudents = data.map(s => ({
          ...s,
          regNo: s.reg_no,
          departmentCode: s.department_code
        }));

        setStudents(prev => {
          let updated = [...prev];
          if (replaceExisting) {
            updated = updated.filter(s => !(s.department === department && s.year === year));
          }
          return [...updated, ...newStudents];
        });

        showToast(`Successfully imported ${newStudents.length} students!`, 'success');
        return true;
      }
      return false;
    } catch (err) {
      console.error("Exception in bulk import:", err);
      showToast("Import failed: " + err.message, 'error');
      return false;
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
      showToast(role === 'faculty' ? "Attendance submitted to HOD successfully!" : "Attendance approved & uploaded successfully!", 'success');
    }
  };

  const approveSubmission = async (id, newAbsenteesCount) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      const updatePayload = { status: 'Approved', forwarded_to_admin: true };
      if (newAbsenteesCount !== undefined && newAbsenteesCount !== null) {
        updatePayload.absentees_count = Number(newAbsenteesCount);
      }
      const { error } = await supabase.from('attendance_sessions').update(updatePayload).eq('id', id);
      if (error) {
        console.error("Supabase approveSubmission error:", error);
        showToast('Error approving submission: ' + error.message, 'error');
        return false;
      }
    }
    setAttendance(prev => ({
      ...prev,
      submittedSessions: prev.submittedSessions.map(s => s.id === id ? { 
        ...s, 
        status: 'Approved', 
        forwardedToAdmin: true,
        ...(newAbsenteesCount !== undefined && newAbsenteesCount !== null ? { absenteesCount: Number(newAbsenteesCount) } : {})
      } : s)
    }));
    showToast('Attendance approved & sent to Principal successfully!', 'success');
    return true;
  };

  const rejectSubmission = async (id) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      const { error } = await supabase.from('attendance_sessions').update({ status: 'Rejected' }).eq('id', id);
      if (error) {
        console.error("Supabase rejectSubmission error:", error);
        showToast('Error rejecting submission: ' + error.message, 'error');
        return false;
      }
    }
    setAttendance(prev => ({
      ...prev,
      submittedSessions: prev.submittedSessions.map(s => s.id === id ? { ...s, status: 'Rejected' } : s)
    }));
    showToast('Attendance request rejected successfully', 'success');
    return true;
  };

  const forwardSubmission = async (id) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    if (isUuid) {
      const { error } = await supabase.from('attendance_sessions').update({ forwarded_to_admin: true }).eq('id', id);
      if (error) {
        console.error("Supabase forwardSubmission error:", error);
        showToast('Error forwarding submission: ' + error.message, 'error');
        return false;
      }
    }
    setAttendance(prev => ({
      ...prev,
      submittedSessions: prev.submittedSessions.map(s => s.id === id ? { ...s, forwardedToAdmin: true } : s)
    }));
    showToast('Submission forwarded successfully', 'success');
    return true;
  };

  const submitDetailedAttendance = (sessionData) => {
    const newSession = {
      ...sessionData,
      id: 'det-' + Date.now().toString(),
      status: 'Pending Approval',
      submittedAt: new Date().toISOString()
    };
    setDetailedSessions(prev => [newSession, ...prev]);
    showToast('Detailed attendance submitted to HOD successfully!', 'success');
  };

  const updateDetailedAttendance = (id, updatedSessionData) => {
    setDetailedSessions(prev => prev.map(s => s.id === id ? { ...s, ...updatedSessionData } : s));
    showToast('Detailed attendance updated successfully!', 'success');
  };

  const approveDetailedAttendance = async (id) => {
    const session = detailedSessions.find(s => s.id === id);
    if (!session) return;

    // Approve locally
    setDetailedSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'Approved' } : s));

    // Send just the count to Supabase using the existing submitAttendance flow
    await submitAttendance({
      department: session.department,
      year: session.year,
      section: session.section,
      absenteesCount: session.absenteesCount,
      date: session.date
    }, 'hod'); // 'hod' role auto-approves and forwards to admin
  };

  const rejectDetailedAttendance = (id) => {
    setDetailedSessions(prev => prev.map(s => s.id === id ? { ...s, status: 'Rejected' } : s));
    showToast('Detailed attendance rejected!', 'success');
  };

  const clearDetailedHistory = (department) => {
    setDetailedSessions(prev => prev.filter(s => !(s.department === department && s.status !== 'Pending Approval')));
    showToast('Detailed attendance history cleared!', 'success');
  };

  const deleteSubmission = async (id) => {
    console.log("[deleteSubmission] Initiating deletion for ID:", id);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    console.log("[deleteSubmission] isUuid test:", isUuid);
    
    if (isUuid) {
      const { error } = await supabase.from('attendance_sessions').delete().eq('id', id);
      if (error) {
        console.error("[deleteSubmission] Supabase deleteSubmission error:", error);
        showToast('Error deleting submission: ' + error.message, 'error');
        return false;
      }
      console.log("[deleteSubmission] Successfully deleted from Supabase database.");
    } else {
      console.warn("[deleteSubmission] ID is not a valid UUID; skipping Supabase deletion. Local filter will still be applied.");
    }
    
    setAttendance(prev => ({
      ...prev,
      submittedSessions: prev.submittedSessions.filter(s => s.id !== id)
    }));
    showToast('Submission deleted successfully', 'success');
    return true;
  };

  const submitStudentRequest = async (reqPayload) => {
    const dbPayload = {
      request_type: reqPayload.requestType,
      name: reqPayload.name,
      reg_no: reqPayload.regNo,
      gender: reqPayload.gender,
      year: reqPayload.year,
      section: reqPayload.section,
      department: reqPayload.department,
      reason: reqPayload.reason || '',
      status: 'Pending'
    };

    let supabaseId = null;
    if (hasStudentRequestsTableRef.current) {
      try {
        const { data, error } = await supabase.from('student_requests').insert([dbPayload]).select();
        if (!error && data && data[0]) {
          supabaseId = data[0].id;
        }
      } catch (e) {
        console.warn("Could not insert to Supabase student_requests table:", e);
      }
    }

    const newRequest = {
      id: supabaseId || 'req-' + Date.now(),
      ...reqPayload,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    setStudentRequests(prev => [newRequest, ...prev]);
    showToast('Student change request sent to HOD!', 'success');
  };

  const approveStudentRequest = async (requestId) => {
    const req = studentRequests.find(r => r.id === requestId);
    if (!req) return;

    // Apply change to database (students table)
    if (req.requestType === 'ADD') {
      await addStudent({
        regNo: req.regNo,
        name: req.name,
        gender: req.gender,
        year: req.year,
        section: req.section,
        department: req.department
      });
    } else if (req.requestType === 'DELETE') {
      const student = students.find(s => s.regNo === req.regNo);
      if (student) {
        await deleteStudent(student.id);
      } else {
        try {
          await supabase.from('students').delete().eq('reg_no', req.regNo);
        } catch (e) {
          console.error("Error deleting student by reg_no in Supabase:", e);
        }
        setStudents(prev => prev.filter(s => s.regNo !== req.regNo));
      }
    }

    // Update status in student_requests table
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId);
    if (isUuid && hasStudentRequestsTableRef.current) {
      try {
        await supabase.from('student_requests').update({ status: 'Approved' }).eq('id', requestId);
      } catch (e) {
        console.error("Error updating request status in Supabase:", e);
      }
    }

    setStudentRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Approved' } : r));
    showToast('Request approved and applied successfully!', 'success');
  };

  const rejectStudentRequest = async (requestId) => {
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(requestId);
    if (isUuid && hasStudentRequestsTableRef.current) {
      try {
        await supabase.from('student_requests').update({ status: 'Rejected' }).eq('id', requestId);
      } catch (e) {
        console.error("Error updating request status in Supabase:", e);
      }
    }

    setStudentRequests(prev => prev.map(r => r.id === requestId ? { ...r, status: 'Rejected' } : r));
    showToast('Request rejected successfully', 'success');
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
      students, addStudent, updateStudent, deleteStudent, importStudentsBulk,
      attendance, saveCurrentSession, submitAttendance, getSessionStudents, clearSubmissions,
      approveSubmission, rejectSubmission, forwardSubmission, deleteSubmission,
      detailedSessions, submitDetailedAttendance, updateDetailedAttendance, approveDetailedAttendance, rejectDetailedAttendance, clearDetailedHistory,
      studentRequests, submitStudentRequest, approveStudentRequest, rejectStudentRequest,
      toast, showToast,
      showViewDataModal, setShowViewDataModal,
      alerts, sendAlert, markAlertAsRead
    }}>
      {children}
    </AppContext.Provider>
  );
};
