import { useState, useEffect } from 'react';
import { Search, Mail, GraduationCap, Building2, Layers, Calendar, User, Trash2 } from 'lucide-react';
import axios from 'axios';

const API = "http://3.27.150.44/APIs/students.php";

export default function Students() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}?q=${search}`);
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to fetch students", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (username, name) => {
  if (window.confirm(`Are you sure you want to delete ${name}?`)) {
    try {
      const res = await axios.delete(`${API}?id=${username}`);
      if (res.data.success) {
        fetchStudents(); // Refresh the list
      } else {
        alert("Failed to delete student.");
      }
    } catch (err) {
      console.error("Error deleting student:", err);
    }
  }
};

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Student Directory</h1>
          <p className="text-slate-500 font-medium">Manage and view all registered students in the system</p>
        </div>
        <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3 w-full md:w-96 focus-within:border-blue-500 transition-all">
          <Search className="text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search by name, email, or department..."
            className="flex-1 outline-none text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Replace the grid div with this table container */}
<div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
  <div className="overflow-x-auto">
    <table className="w-full text-left border-collapse">
      <thead>
        <tr className="bg-slate-50/80 border-b border-slate-100">
          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Student</th>
          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Department</th>
          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Year & Section</th>
          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Joined Date</th>
          <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Actions</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {list.length > 0 ? list.map((student, index) => (
          <tr key={index} className="hover:bg-blue-50/30 transition-colors group">
            {/* Student Info */}
            <td className="px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 flex-shrink-0 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center font-bold text-sm">
                  {student.Name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-800 leading-none">{student.Name}</p>
                  <p className="text-[11px] text-slate-500 mt-1 font-medium">{student.Email}</p>
                </div>
              </div>
            </td>

            {/* Department */}
            <td className="px-6 py-4">
               <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 text-slate-600">
                 <Building2 size={12} className="mr-1.5 opacity-60" />
                 {student.DEPARTMENT_NAME || 'Unassigned'}
               </span>
            </td>

            {/* Year & Section */}
            <td className="px-6 py-4">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                  <GraduationCap size={14} className="text-blue-500" />
                  {student.GRADELEVEL_NAME || 'N/A'}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-400">
                  <Layers size={12} />
                  {student.SECTION_NAME || 'N/A'}
                </div>
              </div>
            </td>

            {/* Date */}
            <td className="px-6 py-4">
              <span className="text-xs font-bold text-slate-600 flex items-center gap-1.5">
                <Calendar size={13} className="text-slate-400" />
                {student.CreatedAt}
              </span>
            </td>
            <td className="px-6 py-4">
              <button
                onClick={() => handleDelete(student.Username, student.Name)}
                className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                title="Delete Student"
              >
                <Trash2 size={18} />
              </button>
            </td>
          </tr>
        )) : (
          <tr>
            <td colSpan="5" className="py-20 text-center">
              <div className="bg-slate-100 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4 opacity-50">
                 <Search size={28} className="text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No students matching your search</h3>
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>
    </div>
  );
}
