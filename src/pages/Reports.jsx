import { useState, useEffect } from 'react';
import { FileBarChart, Calendar, Users, CheckCircle, XCircle, Clock, FileSpreadsheet, Filter } from 'lucide-react';
import axios from 'axios';

const API = "http://3.27.150.44/APIs/reports.php";

export default function Reports() {
  const [events, setEvents] = useState([]);
  const [filterOptions, setFilterOptions] = useState({ departments: [], gradelevels: [], sections: [] });
  
  // Search and Filter States
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selDept, setSelDept] = useState('');
  const [selGrade, setSelGrade] = useState('');
  const [selStatus, setSelStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState(''); 
  const [showSuggestions, setShowSuggestions] = useState(false); 
  const [reportData, setReportData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch Events and Filter Meta on mount
  useEffect(() => {
    const init = async () => {
      try {
        const [resEv, resOpts] = await Promise.all([
          axios.get(`${API}?action=events`),
          axios.get(`${API}?action=filter_options`)
        ]);
        setEvents(resEv.data);
        setFilterOptions(resOpts.data);
      } catch (err) { console.error(err); }
    };
    init();
  }, []);

  // Effect to automatically generate/update report when any filter changes
  useEffect(() => {
    if (selectedEvent) {
      generateReport();
    } else {
      setReportData([]);
    }
  }, [selectedEvent, selDept, selGrade, selStatus]);

  const generateReport = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        action: 'generate',
        event_id: selectedEvent,
        dept_id: selDept,
        grade_id: selGrade,
        status: selStatus
      });
      const res = await axios.get(`${API}?${params.toString()}`);
      setReportData(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const exportToCSV = () => {
    if (reportData.length === 0) return;
    
    // 1. Get Display Names for the Search Criteria
    const eventName = events.find(e => e.EVENT_ID === selectedEvent)?.EVENT_NAME || 'N/A';
    const deptName = filterOptions.departments.find(d => d.DEPARTMENT_ID === selDept)?.DEPARTMENT_NAME || 'All Departments';
    const gradeName = filterOptions.gradelevels.find(g => g.GRADELEVEL_ID === selGrade)?.GRADELEVEL_NAME || 'All Levels';
    const statusText = selStatus || 'All Statuses';

    // 2. Define the Search Criteria Header Rows
    const searchCriteria = [
        ["ATTENDANCE REPORT"],
        ["Event Name:", `"${eventName}"`],
        ["Department:", `"${deptName}"`],
        ["Year-level:", `"${gradeName}"`],
        ["Status:", `"${statusText}"`],
        ["Generated Date:", `"${new Date().toLocaleString()}"`],
        [] // Empty row for spacing between header and data
    ];

    // 3. Define Data Table Headers
    const dataHeaders = ["Student Name", "Email", "Department", "Grade Level", "Section", "Status"];
    
    // 4. Map the Data Rows
    const dataRows = reportData.map(r => [
        `"${r.Student_Name}"`, 
        `"${r.Email}"`, 
        `"${r.DEPARTMENT_NAME}"`, 
        `"${r.GRADELEVEL_NAME}"`, 
        `"${r.SECTION_NAME}"`, 
        `"${r.ATTENDANCE_STATUS}"`
    ]);

    // 5. Combine everything into the CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add Search Criteria
    searchCriteria.forEach(row => {
        csvContent += row.join(",") + "\n";
    });

    // Add Table headers and data
    csvContent += dataHeaders.join(",") + "\n";
    dataRows.forEach(row => {
        csvContent += row.join(",") + "\n";
    });

    // 6. trigger Download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Attendance_Report_${eventName.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

  const stats = {
    present: reportData.filter(r => r.ATTENDANCE_STATUS === 'Present').length,
    absent: reportData.filter(r => r.ATTENDANCE_STATUS === 'Absent').length,
  };

  const filteredEvents = events.filter(ev => 
  ev.EVENT_NAME.toLowerCase().includes(searchTerm.toLowerCase())
);

const handleSelectEvent = (event) => {
  setSelectedEvent(event.EVENT_ID);
  setSearchTerm(event.EVENT_NAME); // Set input text to the event name
  setShowSuggestions(false);      // Close the suggestions
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Attendance Reports</h1>
          <p className="text-slate-500 text-sm">Filter by event, department, and level to generate specific insights</p>
        </div>
        <button 
          onClick={exportToCSV}
          disabled={reportData.length === 0}
          className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all active:scale-95 whitespace-nowrap"
        >
          <FileSpreadsheet size={18}/> Export Results ({reportData.length})
        </button>
      </div>

      {/* Primary & Nested Filter Panel */}
      <div className="w-full relative">
  <label className="block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest">
    1. Primary Search: Type Event Name
  </label>
  <div className="relative">
    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
    <input 
      type="text"
      placeholder="Type to search event (e.g. Intramurals...)"
      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
      value={searchTerm}
      onChange={(e) => {
        setSearchTerm(e.target.value);
        setShowSuggestions(true);
        if(!e.target.value) setSelectedEvent(''); // Clear report if input is emptied
      }}
      onFocus={() => setShowSuggestions(true)}
    />
    
    {/* Suggestions Dropdown */}
    {showSuggestions && searchTerm && (
      <div className="absolute w-full mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl z-50 max-h-60 overflow-y-auto">
        {filteredEvents.length > 0 ? (
          filteredEvents.map(ev => (
            <div 
              key={ev.EVENT_ID}
              onClick={() => handleSelectEvent(ev)}
              className="px-4 py-3 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer border-b border-slate-50 dark:border-slate-800 last:border-0"
            >
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{ev.EVENT_NAME}</p>
              <p className="text-[10px] text-slate-400 font-medium uppercase tracking-tighter">{ev.EVENT_DATE}</p>
            </div>
          ))
        ) : (
          <div className="px-4 py-6 text-center text-slate-400 text-xs italic">
            No events found matching "{searchTerm}"
          </div>
        )}
      </div>
    )}
  </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">2. Department</label>
            <select 
              className="w-full mt-1 p-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-xl text-sm dark:text-white"
              value={selDept}
              onChange={e => setSelDept(e.target.value)}
              disabled={!selectedEvent}
            >
              <option value="">All Departments</option>
              {filterOptions.departments.map(d => <option key={d.DEPARTMENT_ID} value={d.DEPARTMENT_ID}>{d.DEPARTMENT_NAME}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">3. Grade Level</label>
            <select 
              className="w-full mt-1 p-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-xl text-sm dark:text-white"
              value={selGrade}
              onChange={e => setSelGrade(e.target.value)}
              disabled={!selectedEvent}
            >
              <option value="">All Levels</option>
              {filterOptions.gradelevels.map(g => <option key={g.GRADELEVEL_ID} value={g.GRADELEVEL_ID}>{g.GRADELEVEL_NAME}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">4. Attendance Status</label>
            <select
              className={`w-full mt-1 p-3 border border-slate-200 dark:border-slate-800 dark:bg-slate-950 rounded-xl text-sm font-bold outline-none transition-all ${selStatus === 'Present' ? 'text-emerald-600 bg-emerald-50/50' :
                  selStatus === 'Absent' ? 'text-rose-600 bg-rose-50/50' : 'dark:text-white'
                }`}
              value={selStatus}
              onChange={e => setSelStatus(e.target.value)}
              disabled={!selectedEvent}
            >
              <option value="">All Statuses</option>
              <option value="Present">PRESENT</option>
              <option value="Absent">ABSENT</option>
            </select>
          </div>
        </div>
      </div>

      {selectedEvent && !loading && (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Users size={20}/></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Filtered Total</p>
                <p className="text-xl font-bold dark:text-white">{reportData.length}</p>
              </div>
            </div>
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg"><CheckCircle size={20}/></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Present</p>
                <p className="text-xl font-bold dark:text-white">{stats.present}</p>
              </div>
            </div>
            
            <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
              <div className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-lg"><XCircle size={20}/></div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Absent</p>
                <p className="text-xl font-bold dark:text-white">{stats.absent}</p>
              </div>
            </div>
          </div>

          {/* Table Preview */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
              <h3 className="text-sm font-bold dark:text-white">Report Preview</h3>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Filtered Data</span>
            </div>
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/30 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                <tr>
                  <th className="px-6 py-4">Student Name</th>
                  <th className="px-6 py-4">Department</th>
                  <th className="px-6 py-4">Level & Section</th>
                  <th className="px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y border-slate-200 dark:divide-slate-800">
                {reportData.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-800 dark:text-slate-200">{item.Student_Name}</div>
                      <div className="text-[11px] text-slate-400 font-medium">{item.Email}</div>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {item.DEPARTMENT_NAME}
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-slate-600 dark:text-slate-400">
                      {item.GRADELEVEL_NAME} - {item.SECTION_NAME}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-tight ${
                        item.ATTENDANCE_STATUS === 'Present' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20' : 
                        item.ATTENDANCE_STATUS === 'Late' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/20' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/20'
                      }`}>
                        {item.ATTENDANCE_STATUS}
                      </span>
                    </td>
                  </tr>
                ))}
                {reportData.length === 0 && (
                  <tr>
                    <td colSpan="4" className="px-6 py-10 text-center text-slate-400 italic">
                      No records match the current filter criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {loading && (
        <div className="py-24 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-500">Generating filtered report...</p>
        </div>
      )}

      {!selectedEvent && !loading && (
        <div className="py-24 text-center bg-slate-50 dark:bg-slate-900/30 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
          <FileBarChart size={48} className="mx-auto text-slate-300 mb-4" />
          <h3 className="text-slate-900 dark:text-white font-bold text-lg">Report Generation</h3>
          <p className="text-slate-500 text-sm">Select a Primary Event to begin, then use nested filters to refine your data.</p>
        </div>
      )}
    </div>
  );
}
