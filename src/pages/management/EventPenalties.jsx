import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, X, Receipt, CheckCircle2, AlertCircle } from 'lucide-react';
import axios from 'axios';

const API = "http://3.27.150.44/APIs/event_penalties.php";

export default function EventPenalties() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [formData, setFormData] = useState({ 
    Penalty_ID: '', 
    Penalty_Description: '', 
    Penalty_Amount: '', 
    Active: 1 
  });

  const fetchItems = async () => {
    const res = await axios.get(`${API}?q=${search}`);
    setList(Array.isArray(res.data) ? res.data : []);
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
      Penalty_ID: item.Penalty_ID,
      Penalty_Description: item.Penalty_Description,
      Penalty_Amount: item.Penalty_Amount,
      Active: item.Active ? 1 : 0
    });
    setIsUpdate(true);
    setIsOpen(true);
  };

  const resetForm = () => {
    setFormData({ Penalty_ID: '', Penalty_Description: '', Penalty_Amount: '', Active: 1 });
    setIsUpdate(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Event Penalties</h1>
          <p className="text-slate-500 text-sm font-medium">Configure fines for missed school activities</p>
        </div>
        <button onClick={() => { resetForm(); setIsOpen(true); }} 
          className="bg-orange-600 hover:bg-orange-700 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg shadow-orange-500/20 transition-all active:scale-95">
          <Plus size={20}/> New Penalty
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 flex items-center gap-3 shadow-sm">
        <Search className="text-slate-400" size={20} />
        <input type="text" placeholder="Search penalty rules..." className="flex-1 bg-transparent outline-none dark:text-white" 
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border dark:border-slate-800 overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-slate-50 dark:bg-slate-800/50 border-b dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <tr>
              <th className="px-6 py-4">Description</th>
              <th className="px-6 py-4">Amount</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y dark:divide-slate-800">
            {list.map(item => (
              <tr key={item.Penalty_ID} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-orange-50 dark:bg-orange-900/20 text-orange-600 rounded-lg"><Receipt size={18}/></div>
                    <span className="font-bold text-slate-700 dark:text-slate-200">{item.Penalty_Description}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-orange-600 dark:text-orange-400 font-black">₱{parseFloat(item.Penalty_Amount).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                    item.Active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {item.Active ? <CheckCircle2 size={12}/> : <AlertCircle size={12}/>}
                    {item.Active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-1">
                    <button onClick={() => handleEdit(item)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-colors"><Edit2 size={18}/></button>
                    <button onClick={async () => { if(confirm('Delete rule?')) { await axios.delete(`${API}?id=${item.Penalty_ID}`); fetchItems(); } }} 
                      className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"><Trash2 size={18}/></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-8 relative shadow-2xl border dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={24}/></button>
            <h3 className="text-2xl font-black mb-6 dark:text-white">{isUpdate ? 'Update' : 'New'} Penalty Rule</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Rule Description</label>
                <input required type="text" className="w-full px-5 py-3 rounded-2xl border dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                  placeholder="e.g. Missed Foundation Day" value={formData.Penalty_Description} onChange={e => setFormData({...formData, Penalty_Description: e.target.value})}/>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Fine Amount (₱)</label>
                <input required type="number" step="0.01" className="w-full px-5 py-3 rounded-2xl border dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all" 
                  placeholder="50.00" value={formData.Penalty_Amount} onChange={e => setFormData({...formData, Penalty_Amount: e.target.value})}/>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Rule Status</label>
                <select className="w-full px-5 py-3 rounded-2xl border dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-orange-500 outline-none transition-all"
                  value={formData.Active} onChange={e => setFormData({...formData, Active: parseInt(e.target.value)})}>
                  <option value={1}>Active (Apply to missed events)</option>
                  <option value={0}>Inactive (Disabled)</option>
                </select>
              </div>

              <button type="submit" className="w-full bg-orange-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-orange-500/30 hover:bg-orange-700 transition-all active:scale-95">
                {isUpdate ? 'Save Changes' : 'Create Penalty'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
