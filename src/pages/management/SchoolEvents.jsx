import { useState, useEffect } from 'react';
import { CalendarDays, Plus, Trash2, MapPin, Search, X, Clock, AlignLeft, Edit3, Calendar as CalendarIcon, CheckCircle2, XCircle } from 'lucide-react';
import axios from 'axios';

const API = "http://3.27.150.44/APIs/school_events.php";

export default function SchoolEvents() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [formData, setFormData] = useState({
    EVENT_ID: '',
    EVENT_NAME: '',
    EVENT_DATE: '',
    EVENT_TIME: '',
    EVENT_LOCATION: '',
    EVENT_DESCRIPTION: '',
    STATUS: 'Active' // Default status
  });

  const fetchItems = async () => {
    try {
      const res = await axios.get(`${API}?q=${search}`);
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchItems(); }, [search]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await axios.post(API, { ...formData, is_update: isUpdate });
    if (res.data.success) {
      setIsOpen(false);
      fetchItems();
      resetForm();
    }
  };

  const handleEdit = (item) => {
    setFormData({
        ...item,
        STATUS: item.STATUS || 'Active' // Ensure status exists
    });
    setIsUpdate(true);
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({
      EVENT_ID: '',
      EVENT_NAME: '',
      EVENT_DATE: '',
      EVENT_TIME: '',
      EVENT_LOCATION: '',
      EVENT_DESCRIPTION: '',
      STATUS: 'Active'
    });
    setIsUpdate(false);
  };

  return (
    <div className="space-y-8">
      {/* Header & Search Bar remain the same ... */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 dark:text-white tracking-tight">School Events</h1>
          <p className="text-slate-500 font-medium">Schedule and manage campus-wide activities</p>
        </div>
        <button onClick={() => { resetForm(); setIsOpen(true); }} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl flex items-center gap-2 shadow-xl shadow-blue-500/20 transition-all active:scale-95 font-bold">
          <Plus size={20}/> Create Event
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 flex items-center gap-3 shadow-sm">
        <Search className="text-slate-400" size={20} />
        <input 
          type="text" 
          placeholder="Search by event name or location..." 
          className="flex-1 bg-transparent outline-none dark:text-white font-medium" 
          value={search}
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      {/* Event Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {list.map(item => (
          <div key={item.EVENT_ID} className="bg-white dark:bg-slate-900 rounded-[2.5rem] border dark:border-slate-800 p-6 flex flex-col md:flex-row gap-6 hover:shadow-2xl transition-all group relative">
            
            {/* Status Badge Overlay */}
            <div className={`absolute top-6 right-20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter flex items-center gap-1 ${
                item.STATUS === 'Active' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'
            }`}>
                {item.STATUS === 'Active' ? <CheckCircle2 size={12}/> : <XCircle size={12}/>}
                {item.STATUS || 'Active'}
            </div>

            {/* Date Tag */}
            <div className="bg-slate-50 dark:bg-slate-800 w-full md:w-32 h-32 rounded-[2rem] flex flex-col items-center justify-center border dark:border-slate-700 shrink-0">
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 mb-1">
                {new Date(item.EVENT_DATE).toLocaleDateString('en-US', { weekday: 'short', month: 'short' })}
              </span>

              {/* Day Number */}
              <span className="text-3xl font-black text-slate-800 ...">
                {new Date(item.EVENT_DATE).getDate()}
              </span>
              
            </div>
            

            {/* Content ... */}
            <div className="flex-1 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-black text-slate-800 dark:text-white leading-tight pr-10">{item.EVENT_NAME}</h3>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-blue-500 rounded-xl"><Edit3 size={18}/></button>
                  <button onClick={async () => { if(confirm('Delete event?')) { await axios.delete(`${API}?id=${item.EVENT_ID}`); fetchItems(); } }} className="p-2 text-slate-400 hover:text-red-500 rounded-xl"><Trash2 size={18}/></button>
                </div>
              </div>

              <p className="text-xs text-slate-500 line-clamp-2">"{item.EVENT_DESCRIPTION}"</p>
              
              <div className="grid grid-cols-2 gap-2 pt-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border">
                  <MapPin size={12} className="text-blue-500" /> {item.EVENT_LOCATION}
                </div>
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-xl border">
                  <Clock size={12} className="text-blue-500" />
                  {new Date(`1970-01-01T${item.EVENT_TIME}`).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal with Status Selection */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] w-full max-w-lg p-8 relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-8 right-8 text-slate-400"><X size={24}/></button>
            <h3 className="text-2xl font-black mb-8 dark:text-white">Event Details</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
               {/* Previous inputs ... */}
               <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Event Name</label>
                  <input required type="text" className="w-full px-5 py-3 rounded-2xl border dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                    value={formData.EVENT_NAME} onChange={e => setFormData({...formData, EVENT_NAME: e.target.value})}/>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Date</label>
                    <input required type="date" className="w-full px-5 py-3 rounded-2xl border dark:bg-slate-950 dark:text-white" 
                      value={formData.EVENT_DATE} onChange={e => setFormData({...formData, EVENT_DATE: e.target.value})}/>
                  </div>
                  {/* Status Selection */}
                  <div className="col-span-1">
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Event Status</label>
                    <select 
                        className={`w-full px-5 py-3 rounded-2xl border font-bold outline-none transition-all ${
                            formData.STATUS === 'Active' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-rose-50 text-rose-700 border-rose-200'
                        }`} 
                        value={formData.STATUS} 
                        onChange={e => setFormData({...formData, STATUS: e.target.value})}
                    >
                        <option value="Active">Active</option>
                        <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>

                {/* Rest of inputs: Time, Location, Description ... */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Time</label>
                    <input required type="time" className="w-full px-5 py-3 rounded-2xl border dark:bg-slate-950 dark:text-white" 
                      value={formData.EVENT_TIME} onChange={e => setFormData({...formData, EVENT_TIME: e.target.value})}/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Location</label>
                    <input required type="text" className="w-full px-5 py-3 rounded-2xl border dark:bg-slate-950 dark:text-white" 
                      value={formData.EVENT_LOCATION} onChange={e => setFormData({...formData, EVENT_LOCATION: e.target.value})}/>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Description</label>
                  <textarea rows="2" className="w-full px-5 py-3 rounded-2xl border dark:bg-slate-950 dark:text-white resize-none" 
                    value={formData.EVENT_DESCRIPTION} onChange={e => setFormData({...formData, EVENT_DESCRIPTION: e.target.value})}></textarea>
                </div>

              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all mt-4">
                {isUpdate ? 'Save Changes' : 'Launch Event'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
