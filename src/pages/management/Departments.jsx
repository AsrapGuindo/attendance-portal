import { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Edit2, X, Landmark } from 'lucide-react';
import axios from 'axios';

const API = "http://3.26.148.36/APIs/departments.php";

export default function Departments() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [formData, setFormData] = useState({ DEPARTMENT_ID: '', DEPARTMENT_NAME: '' });

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
      setFormData({ DEPARTMENT_ID: '', DEPARTMENT_NAME: '' });
    }
  };

  const handleEdit = (item) => {
    setFormData(item);
    setIsUpdate(true);
    setIsOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-black text-slate-800 dark:text-white">Departments</h1>
          <p className="text-slate-500 text-sm">Organize academic and administrative units</p>
        </div>
        <button onClick={() => { setIsUpdate(false); setFormData({DEPARTMENT_ID: '', DEPARTMENT_NAME: ''}); setIsOpen(true); }} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl flex items-center gap-2 shadow-lg transition-all active:scale-95">
          <Plus size={20}/> Add Department
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border dark:border-slate-800 flex items-center gap-3 shadow-sm">
        <Search className="text-slate-400" size={20} />
        <input type="text" placeholder="Search departments..." className="flex-1 bg-transparent outline-none dark:text-white" 
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(item => (
          <div key={item.DEPARTMENT_ID} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between group hover:border-blue-500 transition-colors">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl"><Landmark size={24}/></div>
              <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200">{item.DEPARTMENT_NAME}</h3>
                <p className="text-[10px] text-slate-400 font-mono uppercase">{item.DEPARTMENT_ID}</p>
              </div>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEdit(item)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"><Edit2 size={18}/></button>
              <button onClick={async () => { if(confirm('Delete?')) { await axios.delete(`${API}?id=${item.DEPARTMENT_ID}`); fetchItems(); } }} 
                className="p-2 text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"><Trash2 size={18}/></button>
            </div>
          </div>
        ))}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-md p-8 relative shadow-2xl border dark:border-slate-800">
            <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X size={24}/></button>
            <h3 className="text-2xl font-black mb-6 dark:text-white">{isUpdate ? 'Update' : 'New'} Department</h3>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-slate-400 mb-2 uppercase tracking-widest">Department Name</label>
                <input required type="text" className="w-full px-5 py-3 rounded-2xl border dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all" 
                  placeholder="e.g. College of Engineering" value={formData.DEPARTMENT_NAME} onChange={e => setFormData({...formData, DEPARTMENT_NAME: e.target.value})}/>
              </div>
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-blue-500/30 hover:bg-blue-700 transition-all">
                {isUpdate ? 'Save Changes' : 'Create Department'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}