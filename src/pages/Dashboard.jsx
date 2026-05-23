import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, AlertCircle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// 1. Corrected StatCard Component
const StatCard = ({ title, value, icon: Icon, color, path, subStats }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => path && navigate(path)}
      className={`bg-white p-6 rounded-xl border border-slate-200 shadow-sm transition-all duration-200 ${
        path ? 'cursor-pointer hover:shadow-lg hover:-translate-y-1 active:scale-95' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">{title}</p>
          <h3 className="text-2xl font-black mt-1 text-slate-800">{value}</h3>
          
          {subStats && (
            <div className="mt-3 flex gap-4 border-t border-slate-50 pt-3">
              <div>
                <p className="text-[9px] font-bold text-slate-400 uppercase">Paid</p>
                <p className="text-xs font-bold text-emerald-600">{subStats.paid}</p>
              </div>
              <div className="border-l border-slate-100 pl-4">
                <p className="text-[9px] font-bold text-slate-400 uppercase">Unpaid</p>
                <p className="text-xs font-bold text-rose-600">{subStats.unpaid}</p>
              </div>
            </div>
          )}
        </div>
        <div className={`${color} p-3 rounded-lg text-white shadow-lg`}>
          <Icon size={24} />
        </div>
      </div>

      {/* ADDED THIS SECTION: Show click indicator for stats without sub-stats */}
      {path && !subStats && (
        <div className="mt-4 flex items-center text-[15px] font-bold text-blue-800 uppercase tracking-tighter">
          View Details →
        </div>
      )}
    </div>
  );
};

export default function Dashboard() {
  const [chartData, setChartData] = useState([]);
  const [stats, setStats] = useState({
    totalStudents: '0',
    activeEvents: '0',
    totalPenalties: '₱ 0.00',
    paidPenalties: '₱ 0.00',   // Added
    unpaidPenalties: '₱ 0.00',
    missedEvents: '0'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://3.27.150.44/APIs/dashboard.php");
        if (response.data && response.data.stats) {
          setStats(response.data.stats);
          setChartData(response.data.chart || []);
        }
      } catch (error) {
        console.error("Dashboard Fetch Error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-1 space-y-8 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Students" 
          value={stats.totalStudents} 
          icon={Users} 
          color="bg-blue-600" 
          path="/students" 
        />
        <StatCard 
          title="Total Events" 
          value={stats.activeEvents} 
          icon={Calendar} 
          color="bg-emerald-500" 
          path="/manage/events" 
        />
        <StatCard
          title="Total Penalties"
          value={stats.totalPenalties}
          icon={TrendingUp}
          color="bg-orange-500"
          path="/manage/missed-events"
          subStats={{
            paid: stats.paidPenalties,
            unpaid: stats.unpaidPenalties
          }}
        />
        <StatCard 
          title="Missed Events" 
          value={stats.missedEvents} 
          icon={AlertCircle} 
          color="bg-rose-500" 
          path="/manage/missed-events" 
        />
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-800">Attendance Activity</h3>
          <p className="text-sm text-slate-500">Total attendees for the last 5 events</p>
        </div>
        
        <div className="h-80 w-full">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={11} tickMargin={10} axisLine={false} tickLine={false} />
                <YAxis fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip 
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} barSize={100} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-slate-400">
              No event data available to display.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
