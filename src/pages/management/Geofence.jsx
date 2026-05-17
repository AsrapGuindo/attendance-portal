import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, X, Search, Navigation, Edit3, Clock, Target, ChevronRight } from 'lucide-react';
import axios from 'axios';

const API = "http://3.27.150.44/APIs/geofence.php";

export default function Geofence() {
  const [list, setList] = useState([]);
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [originalId, setOriginalId] = useState(null);
  const [formData, setFormData] = useState({ 
    id: '', 
    Longitude: '', 
    Latitude: '', 
    RadiusMeters: '50', 
    MinStayTime: '5' 
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
    // Send both current id and the original id
    const res = await axios.post(API, { 
        ...formData, 
        old_id: originalId, 
        is_update: isUpdate 
    });
    
    if (res.data.success) {
        setIsOpen(false);
        fetchItems();
        resetForm();
    } else {
        alert("Action failed. The ID might already exist.");
    }
};

  const handleEdit = (item) => {
    setFormData({
        ...item,
        MinStayTime: item.MinStayTime / 60
    });
    setOriginalId(item.id); // Store the current ID
    setIsUpdate(true);
    setIsOpen(true);
};

  const resetForm = () => {
    setFormData({ id: '', Longitude: '', Latitude: '', RadiusMeters: '50', MinStayTime: '5' });
    setOriginalId(null);
    setIsUpdate(false);
};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Geofencing</h1>
          <p className="text-slate-500 text-sm">Configure GPS boundaries for automated attendance</p>
        </div>
        <button onClick={() => { resetForm(); setIsOpen(true); }} 
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95 font-semibold text-sm">
          <Plus size={18}/> New Geofence Zone
        </button>
      </div>

      {/* Search Bar */}
      <div className="max-w-2xl bg-white dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-2 shadow-sm">
        <div className="pl-3 text-slate-400"><Search size={18} /></div>
        <input 
          type="text" 
          placeholder="Filter zones by ID..." 
          className="flex-1 bg-transparent py-2 outline-none dark:text-white text-sm" 
          value={search}
          onChange={e => setSearch(e.target.value)} 
        />
      </div>

      {/* Geofence Cards Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {list.length > 0 ? list.map(item => (
          <div key={item.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 flex overflow-hidden hover:border-emerald-500/50 transition-all group shadow-sm">
            
            {/* Map Icon Block */}
            <div className="w-20 sm:w-24 bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-800 flex items-center justify-center p-4">
               <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-emerald-600 shadow-sm">
                  <MapPin size={24} />
               </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-5">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    Zone ID: {item.id}
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400 mt-1 uppercase tracking-wider">
                    COORD: {item.Latitude}, {item.Longitude}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg transition-colors"><Edit3 size={16}/></button>
                  <button onClick={async () => { if(confirm('Remove this geofence?')) { await axios.delete(`${API}?id=${item.id}`); fetchItems(); } }} 
                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-lg border border-emerald-100 dark:border-emerald-800/50">
                  <Target size={12} /> {item.RadiusMeters}M RADIUS
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-lg border border-blue-100 dark:border-blue-800/50">
                  <Clock size={12} /> {item.MinStayTime / 60} MIN STAY
                </div>
                <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight size={16} className="text-emerald-500" />
                </div>
              </div>
            </div>
          </div>
        )) : (
          <div className="col-span-full py-16 text-center bg-slate-50 dark:bg-slate-900/30 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
            <Navigation size={40} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm font-medium">No geofence zones defined.</p>
          </div>
        )}
      </div>

      {/* Management Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-[2px]">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 className="font-bold dark:text-white flex items-center gap-2">
                <Navigation size={18} className="text-emerald-600"/>
                {isUpdate ? 'Update Zone' : 'New Geofence'}
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Zone ID Input */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase tracking-widest">
                  Custom Zone ID / Number
                </label>
                <div className="relative">
                  <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <input
                    required
                    type="text"
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all font-mono"
                    placeholder="e.g. 1, 2, or GEOFENCE-01"
                    value={formData.id}
                    onChange={e => setFormData({ ...formData, id: e.target.value })}
                  />
                </div>
                <p className="mt-1 text-[9px] text-slate-400 italic">This will be the unique identifier for this zone.</p>
              </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Latitude</label>
                    <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all" 
                      placeholder="e.g. 8.12345" value={formData.Latitude} onChange={e => setFormData({...formData, Latitude: e.target.value})}/>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Longitude</label>
                    <input required type="text" className="w-full px-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all" 
                      placeholder="e.g. 124.12345" value={formData.Longitude} onChange={e => setFormData({...formData, Longitude: e.target.value})}/>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Radius (Meters)</label>
                  <div className="relative">
                    <Target className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input required type="number" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all" 
                      value={formData.RadiusMeters} onChange={e => setFormData({...formData, RadiusMeters: e.target.value})}/>
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1.5 uppercase">Min. Stay Time (Minutes)</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <input required type="number" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-200 dark:border-slate-800 dark:bg-slate-950 dark:text-white focus:ring-1 focus:ring-emerald-500 outline-none text-sm transition-all" 
                      value={formData.MinStayTime} onChange={e => setFormData({...formData, MinStayTime: e.target.value})}/>
                  </div>
                </div>

              <button type="submit" className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold text-sm shadow-sm hover:bg-emerald-700 transition-all mt-2 active:scale-95">
                {isUpdate ? 'Save Changes' : 'Create Geofence'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
