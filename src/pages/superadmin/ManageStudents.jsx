import React, { useState, useContext } from 'react';
import { PageWrapper } from '../../components/layout/PageWrapper';
import { AppContext } from '../../context/AppContext';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Trash2, Edit2, Plus, X, Search, GraduationCap, Users, Upload, FileText, Check, AlertTriangle } from 'lucide-react';
import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

const emptyForm = { id: null, regNo: '', name: '', gender: 'Male', year: '1st Year', section: 'Single', department: 'Mechanical' };

const ManageStudents = () => {
  const { students, addStudent, updateStudent, deleteStudent, importStudentsBulk, showToast } = useContext(AppContext);

  const [formData, setFormData] = useState(emptyForm);
  const [isEditing, setIsEditing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [yearFilter, setYearFilter] = useState('All');

  // Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importDept, setImportDept] = useState('');
  const [importYear, setImportYear] = useState('');
  const [importFile, setImportFile] = useState(null);
  const [parsedStudents, setParsedStudents] = useState([]);
  const [importOption, setImportOption] = useState('add'); // 'add' or 'replace'
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const resetImportState = () => {
    setImportDept('');
    setImportYear('');
    setImportFile(null);
    setParsedStudents([]);
    setImportOption('add');
    setIsParsing(false);
    setIsImporting(false);
  };

  const handleExcelParse = (file, dept) => {
    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        if (json.length === 0) {
          showToast("Excel file is empty", "error");
          setIsParsing(false);
          return;
        }

        let headerRowIdx = 0;
        for (let i = 0; i < Math.min(json.length, 5); i++) {
          if (json[i] && json[i].some(cell => {
            const str = String(cell || '').toLowerCase();
            return str.includes('name') || str.includes('reg') || str.includes('roll');
          })) {
            headerRowIdx = i;
            break;
          }
        }

        const headers = json[headerRowIdx].map(h => String(h || '').trim());
        
        let regNoIdx = headers.findIndex(h => h.toLowerCase().includes('reg') || h.toLowerCase().includes('roll') || h.toLowerCase().includes('number') || h.toLowerCase() === 'no');
        let nameIdx = headers.findIndex(h => h.toLowerCase().includes('name'));
        let genderIdx = headers.findIndex(h => h.toLowerCase().includes('gender') || h.toLowerCase().includes('sex'));
        let sectionIdx = headers.findIndex(h => h.toLowerCase().includes('sec'));

        if (regNoIdx === -1) regNoIdx = 0;
        if (nameIdx === -1) nameIdx = 1;
        if (genderIdx === -1) genderIdx = 2;
        if (sectionIdx === -1) sectionIdx = 3;

        const studentsList = [];
        for (let i = headerRowIdx + 1; i < json.length; i++) {
          const row = json[i];
          if (!row || row.length === 0) continue;
          
          const regNo = String(row[regNoIdx] || '').trim();
          const name = String(row[nameIdx] || '').trim();
          
          if (!regNo || !name) continue;
          
          let gender = String(row[genderIdx] || '').trim();
          if (gender.toLowerCase().startsWith('f')) {
            gender = 'Female';
          } else {
            gender = 'Male';
          }

          let section = String(row[sectionIdx] || '').trim();
          if (!section) {
            section = dept === 'Computer' ? 'A' : 'Single';
          }

          studentsList.push({ regNo, name, gender, section });
        }

        if (studentsList.length === 0) {
          showToast("No valid student details found in the Excel file", "error");
        } else {
          setParsedStudents(studentsList);
          showToast(`Parsed ${studentsList.length} students from Excel.`, "success");
        }
      } catch (err) {
        console.error("Error parsing Excel:", err);
        showToast("Failed to parse Excel file: " + err.message, "error");
      }
      setIsParsing(false);
    };
    reader.readAsArrayBuffer(file);
  };

  const handleWordParse = (file, dept) => {
    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const arrayBuffer = e.target.result;
      mammoth.extractRawText({ arrayBuffer: arrayBuffer })
        .then(result => {
          const text = result.value;
          const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
          
          if (lines.length === 0) {
            showToast("Word document is empty", "error");
            setIsParsing(false);
            return;
          }

          const studentsList = [];
          
          lines.forEach(line => {
            let parts = line.split(/\t|,|;|\|/).map(p => p.trim());
            if (parts.length < 2) {
              const words = line.split(/\s+/);
              if (words.length >= 2) {
                const isReg = /[0-9]/.test(words[0]) && /[a-zA-Z]/.test(words[0]);
                if (isReg) {
                  const regNo = words[0];
                  let gender = 'Male';
                  let lastWord = words[words.length - 1];
                  let nameWords = words.slice(1);
                  if (lastWord.toLowerCase() === 'female' || lastWord.toLowerCase() === 'f') {
                    gender = 'Female';
                    nameWords = words.slice(1, -1);
                  } else if (lastWord.toLowerCase() === 'male' || lastWord.toLowerCase() === 'm') {
                    gender = 'Male';
                    nameWords = words.slice(1, -1);
                  }
                  const name = nameWords.join(' ');
                  if (regNo && name) {
                    studentsList.push({
                      regNo,
                      name,
                      gender,
                      section: dept === 'Computer' ? 'A' : 'Single'
                    });
                  }
                }
              }
            } else {
              let regNo = '';
              let name = '';
              let gender = 'Male';
              let section = dept === 'Computer' ? 'A' : 'Single';

              parts.forEach(p => {
                const lower = p.toLowerCase();
                if (lower === 'male' || lower === 'female' || lower === 'm' || lower === 'f') {
                  gender = lower.startsWith('f') ? 'Female' : 'Male';
                } else if (/[0-9]/.test(p) && /[a-zA-Z]/.test(p) && p.length > 4) {
                  regNo = p;
                } else if (p.length > 2 && !regNo) {
                  if (!/[0-9]/.test(p)) {
                    name = p;
                  }
                } else if (p.length > 2 && regNo && !name) {
                  if (!/[0-9]/.test(p)) {
                    name = p;
                  }
                }
              });

              if (regNo && name) {
                studentsList.push({ regNo, name, gender, section });
              }
            }
          });

          if (studentsList.length === 0) {
            showToast("Could not extract student details. Please format Word file with tab or comma separated values (e.g., 'RegNo, Name, Gender')", "error");
          } else {
            setParsedStudents(studentsList);
            showToast(`Parsed ${studentsList.length} students from Word document.`, "success");
          }
        })
        .catch(err => {
          console.error("Mammoth error:", err);
          showToast("Failed to parse Word file: " + err.message, "error");
        })
        .finally(() => {
          setIsParsing(false);
        });
    };
    reader.readAsArrayBuffer(file);
  };

  const handleTextParse = (file, dept) => {
    setIsParsing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        const studentsList = [];
        
        lines.forEach(line => {
          const parts = line.split(/,|\t|;/).map(p => p.trim());
          if (parts.length >= 2) {
            const regNo = parts[0];
            const name = parts[1];
            let gender = 'Male';
            if (parts[2]) {
              const g = parts[2].toLowerCase();
              if (g.startsWith('f') || g === 'female') {
                gender = 'Female';
              }
            }
            let section = parts[3] || (dept === 'Computer' ? 'A' : 'Single');
            
            if (regNo && name && regNo.toLowerCase() !== 'reg no' && regNo.toLowerCase() !== 'register number') {
              studentsList.push({ regNo, name, gender, section });
            }
          }
        });

        if (studentsList.length === 0) {
          showToast("No valid student details found in text file", "error");
        } else {
          setParsedStudents(studentsList);
          showToast(`Parsed ${studentsList.length} students from file.`, "success");
        }
      } catch (err) {
        showToast("Failed to parse text file: " + err.message, "error");
      }
      setIsParsing(false);
    };
    reader.readAsText(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImportFile(file);
    setParsedStudents([]);

    const ext = file.name.split('.').pop().toLowerCase();
    if (ext === 'xlsx' || ext === 'xls') {
      handleExcelParse(file, importDept);
    } else if (ext === 'docx') {
      handleWordParse(file, importDept);
    } else if (ext === 'csv' || ext === 'txt') {
      handleTextParse(file, importDept);
    } else {
      showToast("Unsupported file type. Please upload Excel (.xlsx/.xls) or Word (.docx) or CSV/TXT files.", "error");
    }
  };

  const handleExecuteImport = async () => {
    if (parsedStudents.length === 0) {
      showToast("No student data available to import", "error");
      return;
    }

    setIsImporting(true);
    const replace = importOption === 'replace';
    const success = await importStudentsBulk(parsedStudents, importDept, importYear, replace);
    setIsImporting(false);
    if (success) {
      setShowImportModal(false);
      resetImportState();
    }
  };


  const departments = [
    'Mechanical',
    'Automobile',
    'Civil',
    'Electrical and Electronic',
    'Electronics and Communication',
    'Computer',
    'Communication and Computer Networking',
  ];
  const years = ['1st Year', '2nd Year', '3rd Year'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      updateStudent(formData.id, formData);
      showToast('Student updated successfully');
    } else {
      addStudent(formData);
      showToast('Student added successfully');
    }
    setFormData(emptyForm);
    setIsEditing(false);
    setShowForm(false);
  };

  const handleEdit = (student) => {
    setFormData(student);
    setIsEditing(true);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to permanently delete this student?')) {
      deleteStudent(id);
      showToast('Student deleted successfully', 'success');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData(emptyForm);
    setShowForm(false);
  };

  const filtered = students.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.regNo.toLowerCase().includes(search.toLowerCase());
    const matchDept = deptFilter === 'All' || s.department === deptFilter;
    const matchYear = yearFilter === 'All' || s.year === yearFilter;
    return matchSearch && matchDept && matchYear;
  });

  return (
    <PageWrapper title="Manage Students">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-violet-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-slate-800">All Students</h2>
            <p className="text-sm text-slate-400">{students.length} total students across all departments</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            onClick={() => { setShowImportModal(true); resetImportState(); }}
            variant="outline"
            className="text-violet-700 border-violet-200 hover:bg-violet-50 flex items-center gap-2 font-medium"
          >
            <Upload className="w-4 h-4" /> Import Students
          </Button>
          {!showForm && (
            <Button
              onClick={() => { setShowForm(true); setIsEditing(false); setFormData(emptyForm); }}
              className="bg-violet-600 hover:bg-violet-700 flex items-center gap-2 font-medium"
            >
              <Plus className="w-4 h-4" /> Add New Student
            </Button>
          )}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {departments.map(dept => {
          const count = students.filter(s => s.department === dept).length;
          const colors = {
            'Mechanical':                         'bg-orange-50 text-orange-700 border-orange-200',
            'Automobile':                         'bg-yellow-50 text-yellow-700 border-yellow-200',
            'Civil':                              'bg-teal-50 text-teal-700 border-teal-200',
            'Electrical and Electronic':          'bg-amber-50 text-amber-700 border-amber-200',
            'Electronics and Communication':      'bg-purple-50 text-purple-700 border-purple-200',
            'Computer':                           'bg-blue-50 text-blue-700 border-blue-200',
            'Communication and Computer Networking': 'bg-green-50 text-green-700 border-green-200',
          };
          return (
            <div key={dept} className={`rounded-xl border px-4 py-3 text-center ${colors[dept]}`}>
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-xs font-semibold mt-0.5">{dept}</p>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Form */}
      {showForm && (
        <Card className="mb-6 border-violet-200 shadow-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {isEditing ? <><Edit2 className="w-4 h-4 text-amber-500" /> Edit Student</> : <><Plus className="w-4 h-4 text-violet-600" /> Add New Student</>}
              </CardTitle>
              <button onClick={handleCancel} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Reg No</label>
                  <Input value={formData.regNo} onChange={e => setFormData({...formData, regNo: e.target.value})} required placeholder="e.g. 24MECH001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                  <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required placeholder="Student Name" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Department</label>
                  <Select value={formData.department} onChange={e => setFormData({...formData, department: e.target.value, section: e.target.value === 'Computer' ? 'A' : 'Single'})}>
                    {departments.map(d => <option key={d} value={d}>{d}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Gender</label>
                  <Select value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Year</label>
                  <Select value={formData.year} onChange={e => setFormData({...formData, year: e.target.value})}>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-600 mb-1">Section</label>
                  <Select value={formData.section} onChange={e => setFormData({...formData, section: e.target.value})}>
                    {(formData.department === 'Computer' ? ['A', 'B'] : ['Single']).map(s => (
                      <option key={s} value={s}>{s === 'Single' ? 'Single Class' : `Section ${s}`}</option>
                    ))}
                  </Select>
                </div>
              </div>
              <div className="flex gap-3 mt-5 pt-4 border-t border-slate-100">
                <Button type="submit" className={`${isEditing ? 'bg-amber-500 hover:bg-amber-600' : 'bg-violet-600 hover:bg-violet-700'} flex items-center gap-2`}>
                  {isEditing ? <><Edit2 className="w-4 h-4" /> Update Student</> : <><Plus className="w-4 h-4" /> Add Student</>}
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Student Directory Table */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-4 h-4 text-slate-500" />
              Student Directory ({filtered.length})
            </CardTitle>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name or reg no..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-300 w-48"
                />
              </div>
              {/* Dept Filter */}
              <select
                value={deptFilter}
                onChange={e => setDeptFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
              >
                <option value="All">All Departments</option>
                {departments.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {/* Year Filter */}
              <select
                value={yearFilter}
                onChange={e => setYearFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-violet-300"
              >
                <option value="All">All Years</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto max-h-[580px] overflow-y-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 uppercase text-xs sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Reg No</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Dept</th>
                  <th className="px-4 py-3">Year</th>
                  <th className="px-4 py-3">Sec</th>
                  <th className="px-4 py-3">Gender</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-10 text-center text-slate-400">
                      No students found matching your filters.
                    </td>
                  </tr>
                ) : filtered.map((student, idx) => (
                  <tr key={student.id} className="hover:bg-violet-50/40 transition-colors">
                    <td className="px-4 py-3 text-slate-400 text-xs">{idx + 1}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600 font-medium">{student.regNo}</td>
                    <td className="px-4 py-3 font-semibold text-slate-800">{student.name}</td>
                    <td className="px-4 py-3">
                      <span className="bg-violet-100 text-violet-700 px-2 py-0.5 rounded text-xs font-semibold">
                        {student.department}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs">{student.year}</td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-medium">
                        {student.section}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        student.gender === 'Male' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'
                      }`}>
                        {student.gender}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleEdit(student)}
                        title="Edit Student"
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors mr-1"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(student.id)}
                        title="Delete Student"
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-violet-600" />
                <h3 className="text-lg font-bold text-slate-800">Import Student Details</h3>
              </div>
              <button 
                onClick={() => { setShowImportModal(false); resetImportState(); }}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto space-y-6">
              
              {/* Step 1: Select Dept & Year */}
              <div className="bg-violet-50/40 p-4 rounded-xl border border-violet-100 space-y-4">
                <h4 className="text-xs font-bold text-violet-800 uppercase tracking-wider">Step 1: Department & Year Selection</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Department</label>
                    <select
                      value={importDept}
                      onChange={e => {
                        setImportDept(e.target.value);
                        setImportFile(null);
                        setParsedStudents([]);
                      }}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-300 animate-in fade-in"
                    >
                      <option value="">-- Choose Department --</option>
                      {departments.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Select Year</label>
                    <select
                      value={importYear}
                      onChange={e => {
                        setImportYear(e.target.value);
                        setImportFile(null);
                        setParsedStudents([]);
                      }}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-violet-300"
                    >
                      <option value="">-- Choose Year --</option>
                      {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Step 2: File Upload (Enabled only when Dept & Year selected) */}
              {importDept && importYear ? (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-violet-800 uppercase tracking-wider">Step 2: Upload Excel / Word Document</h4>
                    <span className="text-xs text-slate-400">Accepts .xlsx, .xls, .docx, .csv, .txt</span>
                  </div>

                  <div className="relative border-2 border-dashed border-slate-200 hover:border-violet-400 rounded-xl p-6 transition-colors bg-slate-50/50 flex flex-col items-center justify-center group">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      accept=".xlsx,.xls,.docx,.csv,.txt"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="text-center pointer-events-none space-y-2">
                      <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-200">
                        <FileText className="w-6 h-6 text-slate-500 group-hover:text-violet-600 transition-colors" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {importFile ? importFile.name : "Click or drag file to upload"}
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          {importFile ? `${(importFile.size / 1024).toFixed(1)} KB` : "Supports Excel worksheets or Word lists"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {isParsing && (
                    <div className="flex items-center justify-center gap-2 py-4 animate-pulse">
                      <div className="w-5 h-5 border-2 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm text-slate-500 font-medium">Parsing student file...</span>
                    </div>
                  )}

                  {/* Preview Container if parsedStudents exists */}
                  {parsedStudents.length > 0 && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-300">
                      <div className="flex justify-between items-center bg-emerald-50 px-3 py-2 rounded-lg border border-emerald-100">
                        <span className="text-xs text-emerald-800 font-bold flex items-center gap-1.5">
                          <Check className="w-4 h-4" /> Parsed {parsedStudents.length} Students Successfully
                        </span>
                        <span className="text-[10px] text-slate-400">Showing first 5 entries</span>
                      </div>
                      <div className="border border-slate-100 rounded-xl overflow-hidden text-xs max-h-48 overflow-y-auto">
                        <table className="w-full text-left">
                          <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold">
                            <tr>
                              <th className="px-3 py-2">Reg No</th>
                              <th className="px-3 py-2">Name</th>
                              <th className="px-3 py-2">Gender</th>
                              <th className="px-3 py-2">Section</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {parsedStudents.slice(0, 5).map((s, idx) => (
                              <tr key={idx} className="hover:bg-slate-50/50">
                                <td className="px-3 py-2 font-mono">{s.regNo}</td>
                                <td className="px-3 py-2 font-semibold text-slate-700">{s.name}</td>
                                <td className="px-3 py-2">{s.gender}</td>
                                <td className="px-3 py-2">{s.section}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Step 3: Choose import options */}
                      <div className="bg-amber-50/50 p-4 rounded-xl border border-amber-100 space-y-3">
                        <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                          <AlertTriangle className="w-4 h-4 text-amber-600" /> Step 3: Choose Import Policy
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                          <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors bg-white ${
                            importOption === 'add' ? 'border-amber-500 ring-2 ring-amber-100 bg-amber-50/20' : 'border-slate-200 hover:border-slate-300'
                          }`}>
                            <input
                              type="radio"
                              name="importOption"
                              value="add"
                              checked={importOption === 'add'}
                              onChange={() => setImportOption('add')}
                              className="mt-1 accent-amber-500"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-800">Add to Existing Records</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Keeps current student records and inserts any new students found in the file.</p>
                            </div>
                          </label>
                          <label className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors bg-white ${
                            importOption === 'replace' ? 'border-rose-500 ring-2 ring-rose-100 bg-rose-50/20' : 'border-slate-200 hover:border-slate-300'
                          }`}>
                            <input
                              type="radio"
                              name="importOption"
                              value="replace"
                              checked={importOption === 'replace'}
                              onChange={() => setImportOption('replace')}
                              className="mt-1 accent-rose-500"
                            />
                            <div>
                              <p className="text-xs font-bold text-slate-800">Replace Existing Records</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Removes all current student records for {importDept} - {importYear} and replaces them.</p>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400 border border-slate-100 rounded-xl bg-slate-50/50">
                  <p className="text-sm">Please select a Department and Year to enable file upload.</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => { setShowImportModal(false); resetImportState(); }}
                disabled={isImporting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleExecuteImport}
                disabled={parsedStudents.length === 0 || isImporting || isParsing}
                className="bg-violet-600 hover:bg-violet-700 flex items-center gap-1.5 font-bold"
              >
                {isImporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Importing...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" /> Confirm & Import
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageWrapper>
  );
};

export default ManageStudents;
