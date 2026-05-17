import { useState, useEffect } from 'react';
import { AlertTriangle, Plus, Trash2, X, Search, Edit3, Receipt, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API = "http://3.27.150.44/APIs/missed_events.php";

export default function MissedEvents() {
  const [list, setList] = useState([]);
  const [events, setEvents] = useState([]);
  const [penalties, setPenalties] = useState([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [formData, setFormData] = useState({ 
    Missed_ID: '', 
    Student_Name: '', 
    EVENT_ID: '', 
    Penalty_ID: '', 
    Penalty_Paid: 0 
  });

  const fetchData = async () => {
    const resList = await axios.get(`${API}?q=${search}`);
    setList(Array.isArray(resList.data) ? resList.data : []);
  };

  const fetchDropdowns = async () => {
    const res = await axios.get(`${API}?action=dropdowns`);
    setEvents(res.data.events);
    setPenalties(res.data.penalties);
  };

  useEffect(() => { fetchData(); }, [search]);
  useEffect(() => { fetchDropdowns(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post(API, { ...formData, is_update: isUpdate });
    if (res.data.success) {
      setIsOpen(false);
      fetchData();
      resetForm();
    }
  };

  const handleEdit = (item) => {
    setFormData({
      Missed_ID: item.Missed_ID,
      Student_Name: item.Student_Name,
      EVENT_ID: item.EVENT_ID,
      Penalty_ID: item.Penalty_ID,
      Penalty_Paid: item.Penalty_Paid ? 1 : 0
    });
    setIsUpdate(true);
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({ Missed_ID: '', Student_Name: '', EVENT_ID: '', Penalty_ID: '', Penalty_Paid: 0 });
    setIsUpdate(false);
  };

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Missed Events</h1>
          <p className="text-slate-500 text-sm">Monitor event absences and penalty payments</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-sm">
        <div className="pl-3 text-slate-400"><Search size={18} /></div>
        <input 
          type="text" 
          placeholder="Search by student or event name..." 
          className="flex-1 bg-transparent py-2 outline-none dark:text-white text-sm" 
          value={search}
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      {/* Modern Table Layout */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Student & Event</th>
              <th className="px-6 py-4">Penalty Details</th>
              <th className="px-6 py-4">Date Logged</th>
              <th className="px-6 py-4">Payment Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y border-slate-200 dark:divide-slate-800">
            {list.map(item => (
              <tr key={item.Missed_ID} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  {/* Show the real name, but maybe keep the username small underneath for reference */}
                  <div className="font-bold text-slate-800 dark:text-white">
                    {item.Actual_Name || item.Student_Name}
                  </div>
                  <div className="text-[10px] text-slate-400">ID: {item.Student_Name}</div>
                  <div className="text-[11px] text-blue-500 font-bold uppercase mt-0.5">
                    {item.EVENT_NAME || 'Unknown Event'}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-xs">
                    <Receipt size={14} className="text-orange-500" />
                    <span>{item.Penalty_Description}</span>
                    <span className="font-black text-orange-600 dark:text-orange-400">₱{parseFloat(item.Penalty_Amount).toFixed(2)}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                   <div className="flex items-center gap-1.5"><Calendar size={14}/> {item.DateMissed ? new Date(item.DateMissed.date).toLocaleDateString() : 'N/A'}</div>
                </td>
                <td className="px-6 py-4">
                   <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight ${
                    item.Penalty_Paid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-rose-100 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400'
                  }`}>
                    {item.Penalty_Paid ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
                    {item.Penalty_Paid ? 'Paid' : 'Unpaid'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-blue-500 rounded-lg transition-colors"><Edit3 size={18}/></button>
                    <button onClick={async () => { if(confirm('Delete record?')) { await axios.delete(`${API}?id=${item.Missed_ID}`); fetchData(); } }} 
                      className="p-2 text-slate-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Dynamic Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-[2px]">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold dark:text-white flex items-center gap-2">
                <AlertTriangle size={18} className="text-rose-600"/>
                {isUpdate ? 'Update Missed Event' : 'Report Missed Event'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Student Full Name</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all" 
                    placeholder="John Doe" value={formData.Student_Name} onChange={e => setFormData({...formData, Student_Name: e.target.value})}/>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Select Event</label>
                  <select required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all"
                    value={formData.EVENT_ID} onChange={e => setFormData({...formData, EVENT_ID: e.target.value})}>
                    <option value="">-- Choose Event --</option>
                    {events.map(ev => <option key={ev.EVENT_ID} value={ev.EVENT_ID}>{ev.EVENT_NAME}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Applicable Penalty</label>
                  <select required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all"
                    value={formData.Penalty_ID} onChange={e => setFormData({...formData, Penalty_ID: e.target.value})}>
                    <option value="">-- Choose Penalty Rule --</option>
                    {penalties.map(p => <option key={p.Penalty_ID} value={p.Penalty_ID}>{p.Penalty_Description} (₱{p.Penalty_Amount})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Payment Status</label>
                  <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-1 focus:ring-rose-500 outline-none text-sm transition-all"
                    value={formData.Penalty_Paid} onChange={e => setFormData({...formData, Penalty_Paid: parseInt(e.target.value)})}>
                    <option value={0}>Unpaid / Outstanding</option>
                    <option value={1}>Paid / Cleared</option>
                  </select>
                </div>

              <button type="submit" className="w-full bg-rose-600 text-white py-3 rounded-lg font-bold text-sm shadow-sm hover:bg-rose-700 transition-all mt-2 active:scale-95">
                {isUpdate ? 'Save Changes' : 'Record Absence'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
