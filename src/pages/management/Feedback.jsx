import { useState, useEffect } from 'react';
import { MessageSquare, Trash2, Search, Star, Calendar, User, Info, Filter, XCircle } from 'lucide-react';
import axios from 'axios';

const API = "http://3.27.150.44/APIs/feedback.php";

export default function Feedback() {
  const [list, setList] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  
  // States for search and conditional filtering
  const [search, setSearch] = useState('');
  const [type, setType] = useState('All');
  const [selectedEvent, setSelectedEvent] = useState('');

  // 1. Fetch data based on all filters
  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API, {
        params: { 
          q: search, 
          type: type, 
          eventId: selectedEvent 
        }
      });
      setList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
  try {
    const res = await axios.get(`${API}?action=stats`);
    setStats(res.data);
  } catch (err) { console.error(err); }
};

  // 2. Fetch unique events list for the secondary dropdown
  const fetchEvents = async () => {
    try {
      const res = await axios.get(`${API}?action=events`);
      setEvents(res.data);
    } catch (err) {
      console.error("Events fetch error:", err);
    }
  };

  // Initial load of events
  useEffect(() => {
  fetchEvents();
  fetchStats(); // Fetch initially
}, []);

  // Effect to handle search/filter updates with a small debounce
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchData();
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [search, type, selectedEvent]);

  // Reset event selection if category changes away from 'Event'
  useEffect(() => {
    if (type !== 'Event') setSelectedEvent('');
  }, [type]);

  const handleDelete = async (id) => {
  if (confirm('Delete?')) {
    const res = await axios.delete(`${API}?id=${id}`);
    if (res.data.success) {
      fetchData();
      fetchStats(); // Refresh stats after delete
    }
  }
};

  const renderStars = (rating) => (
    <div className="flex gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} className={i < rating ? "fill-amber-400 text-amber-400" : "text-slate-200"} />
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-bold text-slate-900">Student Feedback</h1>
        <p className="text-slate-500 text-sm">Review system experiences and event reviews</p>
      </div>

      {stats && (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
    {/* Global Average */}
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <span className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Star size={20} fill="currentColor"/></span>
        <span className="text-[10px] font-black uppercase text-slate-400">Avg Rating</span>
      </div>
      <div className="text-2xl font-black text-slate-900">{parseFloat(stats.summary.Average || 0).toFixed(1)}</div>
      <div className="text-[10px] font-bold text-slate-500 uppercase">From {stats.summary.Total} Reviews</div>
    </div>

    {/* System Rating */}
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <span className="p-2 bg-purple-50 text-purple-600 rounded-lg"><MessageSquare size={20}/></span>
        <span className="text-[10px] font-black uppercase text-slate-400">System App</span>
      </div>
      <div className="text-2xl font-black text-slate-900">
        {parseFloat(stats.categories.find(c => c.FEEDBACK_TYPE === 'System')?.Average || 0).toFixed(1)}
      </div>
      <div className="text-[10px] font-bold text-purple-500 uppercase">System performance</div>
    </div>

    {/* Event Rating */}
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={20}/></span>
        <span className="text-[10px] font-black uppercase text-slate-400">Event Avg</span>
      </div>
      <div className="text-2xl font-black text-slate-900">
        {parseFloat(stats.categories.find(c => c.FEEDBACK_TYPE === 'Event')?.Average || 0).toFixed(1)}
      </div>
      <div className="text-[10px] font-bold text-blue-500 uppercase">Based on all events</div>
    </div>

    {/* Star Distribution Mini-Bar */}
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col max-h-[140px]">
  <div className="flex justify-between items-start mb-3">
    <span className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Calendar size={20}/></span>
    <span className="text-[10px] font-black uppercase text-slate-400">Event Ratings</span>
  </div>
  
  <div className="flex-1 overflow-y-auto pr-1 space-y-3 custom-scrollbar">
    {stats.eventBreakdown && stats.eventBreakdown.length > 0 ? (
      stats.eventBreakdown.map((ev, idx) => (
        <div key={idx} className="flex items-center justify-between group">
          <div className="overflow-hidden mr-2">
            <div className="text-[11px] font-bold text-slate-700 truncate">{ev.EVENT_NAME}</div>
            <div className="text-[9px] text-slate-400 font-medium uppercase">{ev.TotalReviews} Reviews</div>
          </div>
          <div className="flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
            <Star size={10} className="fill-blue-500 text-blue-500" />
            <span className="text-[11px] font-black text-blue-700">{parseFloat(ev.AvgRating).toFixed(1)}</span>
          </div>
        </div>
      ))
    ) : (
      <div className="text-[10px] text-slate-400 italic py-2">No event feedback yet</div>
    )}
  </div>
</div>
  </div>
)}

      {/* Enhanced Multi-Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-sm">
        {/* Search Input */}
        <div className="flex-1 min-w-[280px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search student name, ID or comments..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            value={search} 
            onChange={e => setSearch(e.target.value)} 
          />
        </div>

        {/* Category Picklist */}
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-slate-400" />
          <select 
            className="bg-slate-50 border-none rounded-xl text-sm py-2 px-3 font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            <option value="All">All Categories</option>
            <option value="System">System Feedback</option>
            <option value="Event">Event Feedback</option>
          </select>
        </div>

        {/* Conditional Secondary Filter: Shown only if 'Event' is selected */}
        {type === 'Event' && (
          <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-200">
            <div className="h-6 w-[1.5px] bg-slate-200 mx-1 hidden md:block"></div>
            <select 
              className="bg-blue-50 text-blue-700 border-none rounded-xl text-sm py-2 px-3 font-bold outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              <option value="">All Events</option>
              {events.map(ev => (
                <option key={ev.EVENT_ID} value={ev.EVENT_ID}>{ev.EVENT_NAME}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mb-4"></div>
          <p className="text-sm font-medium">Filtering feedback data...</p>
        </div>
      ) : list.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {list.map(item => (
            <div key={item.FEEDBACK_ID} className="bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col group transition-all hover:border-blue-300 hover:shadow-md">
              <div className="p-5 flex-1 space-y-4">
                <div className="flex justify-between items-start">
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    item.FEEDBACK_TYPE === 'Event' 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {item.FEEDBACK_TYPE}
                  </span>
                  <button 
                    onClick={() => handleDelete(item.FEEDBACK_ID)} 
                    className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 size={16}/>
                  </button>
                </div>

                <div>
                  {renderStars(parseInt(item.RATING))}
                  <p className="mt-3 text-sm text-slate-600 italic leading-relaxed line-clamp-4">
                    "{item.COMMENTS || 'Overall satisfied with the service.'}"
                  </p>
                </div>

                {item.FEEDBACK_TYPE === 'Event' && item.EVENT_NAME && (
                  <div className="flex items-center gap-2 p-2.5 bg-blue-50/50 rounded-xl text-[11px] font-bold text-blue-600 border border-blue-100">
                    <Info size={14} className="shrink-0"/> 
                    <span className="truncate">{item.EVENT_NAME}</span>
                  </div>
                )}
              </div>

              <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between rounded-b-2xl">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white shrink-0 flex items-center justify-center text-[10px] font-black">
                    {(item.StudentFullName || item.STUDENT_NAME || 'U').charAt(0)}
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-xs font-bold text-slate-800 truncate">{item.StudentFullName || 'Anonymous'}</div>
                    <div className="text-[10px] text-slate-400 font-medium truncate">@{item.STUDENT_NAME}</div>
                  </div>
                </div>
                <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1 shrink-0 bg-white px-2 py-1 rounded-md border border-slate-200">
                  <Calendar size={12}/> {item.SUBMITTED_AT ? new Date(item.SUBMITTED_AT.date).toLocaleDateString() : 'N/A'}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl py-20 flex flex-col items-center justify-center text-center px-4">
          <div className="bg-slate-50 p-4 rounded-full mb-4">
            <XCircle size={48} className="text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">No results match your criteria</h3>
          <p className="text-slate-500 text-sm mt-1 max-w-sm">Try adjusting your category filters or search keywords to find what you're looking for.</p>
          <button 
            onClick={() => { setSearch(''); setType('All'); setSelectedEvent(''); }}
            className="mt-6 text-sm font-bold text-blue-600 hover:text-blue-700"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
