import React, { useState, useContext } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { AppContext } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { CheckCircle2, XCircle, Clock, Search, Edit2, Save, X, Trash2 } from 'lucide-react';

const DetailedAttendanceReview = () => {
  const { auth, detailedSessions, approveDetailedAttendance, rejectDetailedAttendance, updateDetailedAttendance, clearDetailedHistory } = useContext(AppContext);
  
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [editAbsenteesList, setEditAbsenteesList] = useState([]);
  
  // HOD only sees requests for their department
  const hodDepartment = auth.user?.department;
  
  const pendingSessions = detailedSessions
    .filter(s => s.department === hodDepartment && s.status === 'Pending Approval')
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const historySessions = detailedSessions
    .filter(s => s.department === hodDepartment && s.status !== 'Pending Approval')
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

  const handleEditClick = (session) => {
    setEditingSessionId(session.id);
    // Deep copy the list so we don't mutate state directly
    setEditAbsenteesList(JSON.parse(JSON.stringify(session.absenteesList)));
  };

  const cancelEdit = () => {
    setEditingSessionId(null);
    setEditAbsenteesList([]);
  };

  const saveEdit = (sessionId) => {
    // Note: In a real app we might want to let them toggle absent to present, 
    // but the list only CONTAINS absentees. To mark someone present, we remove them from the list.
    updateDetailedAttendance(sessionId, {
      absenteesList: editAbsenteesList,
      absenteesCount: editAbsenteesList.length
    });
    setEditingSessionId(null);
  };

  const removeAbsentee = (regNo) => {
    setEditAbsenteesList(prev => prev.filter(s => s.regNo !== regNo));
  };

  const SessionCard = ({ session, isPending }) => {
    const isEditing = editingSessionId === session.id;
    const absentees = isEditing ? editAbsenteesList : session.absenteesList;

    return (
      <Card className="shadow-sm mb-6 border-slate-200">
        <CardHeader className="bg-slate-50 border-b border-slate-100 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle className="text-lg text-slate-800">
              {session.date} • {session.year} - Section {session.section}
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">Submitted by: <span className="font-semibold">{session.submittedBy}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <div className="bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm text-sm font-bold text-slate-700">
              Absentees: <span className="text-rose-600">{absentees.length}</span>
            </div>
            {!isPending && (
              <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${
                session.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
              }`}>
                {session.status}
              </span>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {absentees.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-sm">
              No absentees reported for this session. (All Present)
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white text-slate-500 uppercase text-xs font-semibold border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Reg No</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Gender</th>
                    {isEditing && <th className="px-4 py-3 text-right">Action</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {absentees.map((student) => (
                    <tr key={student.regNo} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 font-medium text-slate-700">{student.regNo}</td>
                      <td className="px-4 py-3 text-slate-600">{student.name}</td>
                      <td className="px-4 py-3 text-slate-500">{student.gender}</td>
                      {isEditing && (
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => removeAbsentee(student.regNo)}
                            className="text-xs px-2 py-1 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 rounded font-semibold transition-colors"
                            title="Mark as Present"
                          >
                            Mark Present
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {isPending && (
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
              {isEditing ? (
                <>
                  <Button variant="outline" size="sm" onClick={cancelEdit} className="text-slate-600">
                    <X className="w-4 h-4 mr-1.5" /> Cancel
                  </Button>
                  <Button size="sm" onClick={() => saveEdit(session.id)} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <Save className="w-4 h-4 mr-1.5" /> Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleEditClick(session)} className="text-indigo-600 border-indigo-200 hover:bg-indigo-50">
                    <Edit2 className="w-4 h-4 mr-1.5" /> Edit
                  </Button>
                  <div className="w-px h-6 bg-slate-200 mx-1"></div>
                  <Button variant="outline" size="sm" onClick={() => rejectDetailedAttendance(session.id)} className="text-rose-600 border-rose-200 hover:bg-rose-50">
                    <XCircle className="w-4 h-4 mr-1.5" /> Reject
                  </Button>
                  <Button size="sm" onClick={() => approveDetailedAttendance(session.id)} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> Approve & Forward
                  </Button>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <PageWrapper title="Review Detailed Attendance">
      <div className="space-y-8">
        
        {/* Pending Requests Section */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-amber-500" />
            <h2 className="text-xl font-bold text-slate-800">Pending Requests ({pendingSessions.length})</h2>
          </div>
          
          {pendingSessions.length === 0 ? (
            <Card className="border-dashed border-2 border-slate-200 bg-slate-50/50">
              <CardContent className="p-12 text-center text-slate-400">
                <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-emerald-400 opacity-50" />
                <p className="text-lg font-medium text-slate-600">All caught up!</p>
                <p className="text-sm">No pending detailed attendance requests to review.</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {pendingSessions.map(session => (
                <SessionCard key={session.id} session={session} isPending={true} />
              ))}
            </div>
          )}
        </section>

        {/* History Section */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-indigo-500" />
              <h2 className="text-xl font-bold text-slate-800">Recent History</h2>
            </div>
            {historySessions.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (window.confirm("Are you sure you want to clear your review history?")) {
                    clearDetailedHistory(hodDepartment);
                  }
                }}
                className="text-rose-600 border-rose-200 hover:bg-rose-50 flex items-center gap-1.5 font-bold"
              >
                <Trash2 className="w-4 h-4" /> Clear History
              </Button>
            )}
          </div>
          
          {historySessions.length === 0 ? (
            <p className="text-slate-500 text-sm">No history found.</p>
          ) : (
            <div className="opacity-75">
              {historySessions.slice(0, 5).map(session => (
                <SessionCard key={session.id} session={session} isPending={false} />
              ))}
            </div>
          )}
        </section>

      </div>
    </PageWrapper>
  );
};

export default DetailedAttendanceReview;
