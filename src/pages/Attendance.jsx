import { useState, useEffect } from 'react';
import { Search, Plus, Edit2, Trash2, X, Filter } from 'lucide-react';
import axios from 'axios';

const API = "http://3.26.148.36/APIs/attendance.php";

export default function Attendance() {
  const [list, setList] = useState([]);
  const [students, setStudents] = useState([]);
  const [events, setEvents] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ departments: [], gradelevels: [], sections: [] });
  
  // Search and Filter States
  const [search, setSearch] = useState('');
  const [selEvent, setSelEvent] = useState('');
  const [selDept, setSelDept] = useState('');
  const [selGrade, setSelGrade] = useState('');
  const [selSection, setSelSection] = useState('');

  const [isOpen, setIsOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [formData, setFormData] = useState({
    ATTENDANCE_ID: '', STUDENT_ID: '', EVENT_ID: '', ATTENDANCE_STATUS: 'Present'
  });

  const fetchData = async () => {
    try {
      // Constructing query params for filters
      const params = new URLSearchParams({
        action: 'list',
        q: search,
        event_id: selEvent,
        dept_id: selDept,
        grade_id: selGrade,
        section_id: selSection
      });
      const res = await axios.get(`${API}?${params.toString()}`);
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  const fetchDropdowns = async () => {
    try {
      const [resStud, resEv, resOpts] = await Promise.all([
        axios.get(`${API}?action=students`),
        axios.get(`${API}?action=events`),
        axios.get(`${API}?action=filter_options`)
      ]);
      setStudents(resStud.data);
      setEvents(resEv.data);
      setFilterOptions(resOpts.data);
    } catch (err) { console.error(err); }
  };

  // Trigger fetchData whenever any filter or search changes
  useEffect(() => { fetchData(); }, [search, selEvent, selDept, selGrade, selSection]);
  useEffect(() => { fetchDropdowns(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post(API, { ...formData, is_update: isUpdate });
    if (res.data.success) {
      setIsOpen(false);
      fetchData();
      setFormData({ ATTENDANCE_ID: '', STUDENT_ID: '', EVENT_ID: '', ATTENDANCE_STATUS: 'Present' });
    }
  };

  const handleEdit = (item) => {
    setFormData({
      ATTENDANCE_ID: item.ATTENDANCE_ID,
      STUDENT_ID: item.STUDENT_ID,
      EVENT_ID: item.EVENT_ID,
      ATTENDANCE_STATUS: item.ATTENDANCE_STATUS
    });
    setIsUpdate(true);
    setIsOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Delete this record?')) {
      await axios.delete(`${API}?id=${id}`);
      fetchData();
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Attendance Records</h1>
        
      </div>

      {/* Primary Search & Nested Filters Section */}
      <div className="bg-white p-6 rounded-xl border space-y-4 shadow-sm">
        <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border">
          <Search className="text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Quick search by name or ID..."
            className="flex-1 bg-transparent outline-none"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary: Event</label>
            <select 
              className="w-full mt-1 p-2 border rounded-lg text-sm bg-white" 
              value={selEvent} 
              onChange={e => setSelEvent(e.target.value)}
            >
              <option value="">All Events</option>
              {events.map(ev => <option key={ev.EVENT_ID} value={ev.EVENT_ID}>{ev.EVENT_NAME}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secondary: Department</label>
            <select 
              className="w-full mt-1 p-2 border rounded-lg text-sm bg-white" 
              value={selDept} 
              onChange={e => setSelDept(e.target.value)}
            >
              <option value="">All Departments</option>
              {filterOptions.departments.map(d => <option key={d.DEPARTMENT_ID} value={d.DEPARTMENT_ID}>{d.DEPARTMENT_NAME}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tertiary: Grade Level</label>
            <select 
              className="w-full mt-1 p-2 border rounded-lg text-sm bg-white" 
              value={selGrade} 
              onChange={e => setSelGrade(e.target.value)}
            >
              <option value="">All Grade Levels</option>
              {filterOptions.gradelevels.map(g => <option key={g.GRADELEVEL_ID} value={g.GRADELEVEL_ID}>{g.GRADELEVEL_NAME}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Quaternary: Section</label>
            <select 
              className="w-full mt-1 p-2 border rounded-lg text-sm bg-white" 
              value={selSection} 
              onChange={e => setSelSection(e.target.value)}
            >
              <option value="">All Sections</option>
              {filterOptions.sections.map(s => <option key={s.SECTION_ID} value={s.SECTION_ID}>{s.SECTION_NAME}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Table - Original Columns Maintained */}
      <div className="bg-white rounded-xl border overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b text-slate-500 text-xs font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">ID</th>
              <th className="px-6 py-4">Student Name</th>
              <th className="px-6 py-4">Event Name</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {list.map((item) => (
              <tr key={item.ATTENDANCE_ID} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4 text-sm font-mono text-slate-500">{item.ATTENDANCE_ID}</td>
                <td className="px-6 py-4 font-bold text-slate-800">
                  {item.STUDENT_NAME || item.STUDENT_ID}
                </td>
                <td className="px-6 py-4 text-slate-600">{item.EVENT_NAME}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    item.ATTENDANCE_STATUS === 'Present' ? 'bg-green-100 text-green-700' : 
                    item.ATTENDANCE_STATUS === 'Late' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {item.ATTENDANCE_STATUS}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => handleEdit(item)} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                      <Edit2 size={18}/>
                    </button>
                    <button onClick={() => handleDelete(item.ATTENDANCE_ID)} className="text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors">
                      <Trash2 size={18}/>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {list.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-10 text-center text-slate-400 italic">
                  No attendance records found matching the filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal - Create/Edit */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 relative shadow-2xl">
            <button onClick={() => setIsOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X />
            </button>
            <h2 className="text-xl font-bold mb-6">{isUpdate ? 'Edit' : 'Create'} Attendance Record</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Student</label>
                <select 
                  className="w-full mt-1 p-2 border rounded-lg bg-slate-50"
                  value={formData.STUDENT_ID}
                  onChange={e => setFormData({...formData, STUDENT_ID: e.target.value})}
                  required
                >
                  <option value="">Select Student</option>
                  {students.map(s => <option key={s.Username} value={s.Username}>{s.Name}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Event</label>
                <select 
                  className="w-full mt-1 p-2 border rounded-lg bg-slate-50"
                  value={formData.EVENT_ID}
                  onChange={e => setFormData({...formData, EVENT_ID: e.target.value})}
                  required
                >
                  <option value="">Select Event</option>
                  {events.map(ev => <option key={ev.EVENT_ID} value={ev.EVENT_ID}>{ev.EVENT_NAME}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase text-slate-500">Status</label>
                <select 
                  className="w-full mt-1 p-2 border rounded-lg bg-slate-50"
                  value={formData.ATTENDANCE_STATUS}
                  onChange={e => setFormData({...formData, ATTENDANCE_STATUS: e.target.value})}
                >
                  <option value="Present">Present</option>
                  <option value="Absent">Absent</option>
                  <option value="Late">Late</option>
                </select>
              </div>
              <div className="pt-4">
                <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold transition-colors">
                  {isUpdate ? 'Update' : 'Save'} Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}