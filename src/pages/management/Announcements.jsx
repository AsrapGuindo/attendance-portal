import { useState, useEffect } from 'react';
import { Megaphone, Plus, Trash2, Search, X, Edit3, Bell, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import axios from 'axios';

const API = "http://3.27.150.44/APIs/announcements.php";

export default function Announcements() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [formData, setFormData] = useState({
    ANNOUNCEMENT_ID: '',
    TITLE: '',
    MESSAGE: '',
    IS_ACTIVE: '1' // varchar(1)
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
    setFormData(item);
    setIsUpdate(true);
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({ ANNOUNCEMENT_ID: '', TITLE: '', MESSAGE: '', IS_ACTIVE: '1' });
    setIsUpdate(false);
  };

  return (
    <div className="space-y-6">
      {/* Professional Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Announcements</h1>
          <p className="text-slate-500 text-sm">Broadcast news and updates to the student body</p>
        </div>
        <button onClick={() => { resetForm(); setIsOpen(true); }} 
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 font-semibold text-sm">
          <Plus size={18}/> New Announcement
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-sm">
        <div className="pl-3 text-slate-400"><Search size={18} /></div>
        <input 
          type="text" 
          placeholder="Search announcements..." 
          className="flex-1 bg-transparent py-2 outline-none dark:text-white text-sm" 
          value={search}
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      {/* Announcement Feed */}
      <div className="grid grid-cols-1 gap-4">
        {list.length > 0 ? list.map(item => (
          <div key={item.ANNOUNCEMENT_ID} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden hover:border-indigo-500/50 transition-all group shadow-sm flex flex-col md:flex-row">
            
            {/* Status Indicator Sidebar */}
            <div className={`w-2 shrink-0 ${item.IS_ACTIVE === '1' ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'}`} />

            <div className="flex-1 p-6">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${item.IS_ACTIVE === '1' ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                    <Bell size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{item.TITLE}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase mt-0.5">
                      <Clock size={12} /> {item.CREATED_AT}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(item)} className="p-2 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 rounded-lg transition-all"><Edit3 size={18}/></button>
                  <button onClick={async () => { if(confirm('Delete announcement?')) { await axios.delete(`${API}?id=${item.ANNOUNCEMENT_ID}`); fetchItems(); } }} 
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 size={18}/></button>
                </div>
              </div>

              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">
                {item.MESSAGE}
              </p>

              <div className="flex items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                 <span className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest ${
                    item.IS_ACTIVE === '1' ? 'text-emerald-600' : 'text-slate-400'
                  }`}>
                    {item.IS_ACTIVE === '1' ? <CheckCircle2 size={14}/> : <AlertCircle size={14}/>}
                    {item.IS_ACTIVE === '1' ? 'Publicly Visible' : 'Hidden / Draft'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-300 dark:text-slate-600 ml-auto">
                    ID: {item.ANNOUNCEMENT_ID}
                  </span>
              </div>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center bg-slate-50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Megaphone size={48} className="mx-auto text-slate-300 mb-4" />
            <p className="text-slate-500 font-bold">No announcements found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Management Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-[2px]">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold dark:text-white">{isUpdate ? 'Edit Announcement' : 'Compose Announcement'}</h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Title</label>
                  <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none text-sm transition-all" 
                    placeholder="Important: Exam Schedule" value={formData.TITLE} onChange={e => setFormData({...formData, TITLE: e.target.value})}/>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Message Body</label>
                  <textarea required rows="4" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none text-sm transition-all resize-none" 
                    placeholder="Type your message here..." value={formData.MESSAGE} onChange={e => setFormData({...formData, MESSAGE: e.target.value})}></textarea>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Visibility Status</label>
                  <select className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-1 focus:ring-indigo-500 outline-none text-sm transition-all"
                    value={formData.IS_ACTIVE} onChange={e => setFormData({...formData, IS_ACTIVE: e.target.value})}>
                    <option value="1">Active (Visible to Students)</option>
                    <option value="0">Hidden (Save as Draft)</option>
                  </select>
                </div>

              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-sm shadow-sm hover:bg-indigo-700 transition-all mt-2 active:scale-95">
                {isUpdate ? 'Save Changes' : 'Post Announcement'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
