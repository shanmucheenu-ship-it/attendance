import React from 'react';
import { motion } from 'framer-motion';

export const AttendanceTable = ({ students, onToggleAttendance, readOnly = false }) => {
  if (!students || students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-text-secondary">
        <p>No students found for this selection.</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-white rounded-xl border border-border-gray overflow-hidden shadow-sm">
      <div className="overflow-x-auto custom-scrollbar pb-4">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600 uppercase font-bold text-xs sticky top-0 z-10 border-b border-slate-200 shadow-sm">
            <tr>
              <th className="px-6 py-4 tracking-wider">#</th>
              <th className="px-6 py-4 tracking-wider">Reg No</th>
              <th className="px-6 py-4 tracking-wider">Student Name</th>
              <th className="px-6 py-4 tracking-wider">Gender</th>
              <th className="px-6 py-4 text-center tracking-wider">Attendance</th>
            </tr>
          </thead>
          <motion.tbody 
            initial="hidden"
            animate="visible"
            variants={{
              visible: { transition: { staggerChildren: 0.03 } }
            }}
            className="divide-y divide-slate-100"
          >
            {students.map((student, idx) => (
              <motion.tr 
                variants={{
                  hidden: { opacity: 0, y: 10 },
                  visible: { opacity: 1, y: 0 }
                }}
                key={student.id} 
                className="hover:bg-slate-50 transition-colors bg-white"
              >
                <td className="px-6 py-4 text-slate-500 font-medium">{idx + 1}</td>
                <td className="px-6 py-4 font-bold text-slate-800">{student.regNo}</td>
                <td className="px-6 py-4">{student.name}</td>
                <td className="px-6 py-4 text-text-secondary">{student.gender}</td>
                <td className="px-6 py-4 text-center">
                  {readOnly ? (
                    <span className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-medium border ${
                      student.status === 'Present' 
                        ? 'bg-green-100 text-green-700 border-green-200' 
                        : student.status === 'Absent'
                        ? 'bg-red-100 text-red-700 border-red-200'
                        : 'bg-indigo-100 text-indigo-700 border-indigo-200'
                    }`}>
                      {student.status}
                    </span>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onToggleAttendance(student.id)}
                      className={`inline-flex items-center rounded-full px-4 py-1 text-sm font-medium transition-colors border ${
                        student.status === 'Present'
                          ? 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200'
                          : student.status === 'Absent'
                          ? 'bg-red-100 text-red-700 border-red-200 hover:bg-red-200'
                          : 'bg-indigo-100 text-indigo-700 border-indigo-200 hover:bg-indigo-200'
                      }`}
                    >
                      {student.status}
                    </motion.button>
                  )}
                </td>
              </motion.tr>
            ))}
          </motion.tbody>
        </table>
      </div>
    </div>
  );
};
