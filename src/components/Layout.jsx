import { Link, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, Users, ClipboardCheck, FileBarChart, LogOut, 
  Megaphone, Landmark, Receipt, MapPin, GraduationCap, 
  CalendarDays, Layers, AlertTriangle, ChevronDown, ChevronLeft, ChevronRight, MessageSquare, Settings, X, History 
} from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from 'axios';

const NavItem = ({ icon: Icon, label, path, active, sub = false, isCollapsed }) => (
  <Link
    to={path}
    title={isCollapsed ? label : ""}
    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group ${
      active 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
    } ${sub && !isCollapsed ? 'ml-4 text-sm' : ''} ${isCollapsed ? 'justify-center px-2' : ''}`}
  >
    <Icon size={sub ? 16 : 20} className="shrink-0" />
    {!isCollapsed && <span className="font-medium whitespace-nowrap overflow-hidden">{label}</span>}
  </Link>
);

export default function Layout({ onLogout }) {
  const location = useLocation();
  const [mgmtOpen, setMgmtOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  // --- MISSING STATES ADDED HERE ---
  const [showSettings, setShowSettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    oldPass: '',
    newUser: '',
    newPass: ''
  });

  const mgmtLinks = [
    { label: 'Announcements', path: '/manage/announcements', icon: Megaphone },
    { label: 'Departments', path: '/manage/departments', icon: Landmark },
    { label: 'Penalties', path: '/manage/penalties', icon: Receipt },
    { label: 'Geofence', path: '/manage/geofence', icon: MapPin },
    { label: 'Grade Levels', path: '/manage/gradelevels', icon: GraduationCap },
    { label: 'School Events', path: '/manage/events', icon: CalendarDays },
    { label: 'Sections', path: '/manage/sections', icon: Layers },
    { label: 'Missed Events', path: '/manage/missed-events', icon: AlertTriangle },
    { label: 'Feedback', path: '/manage/feedback', icon: MessageSquare },
    { label: 'Audit Logs', path: '/manage/audit-logs', icon: History },
  ];

  // --- MISSING LOGIC ADDED HERE ---
  const handleUpdateCredentials = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: '', type: '' });

    // Retrieve AdminID from localStorage (ensure this was saved during login)
    const admin = JSON.parse(localStorage.getItem('adminUser'));

    try {
      const res = await axios.post('http://3.26.148.36/APIs/update_admin.php', {
        admin_id: admin?.AdminID,
        old_password: formData.oldPass,
        new_username: formData.newUser,
        new_password: formData.newPass
      });

      if (res.data.success) {
        setMessage({ text: 'Security updated! Please use new details next time.', type: 'success' });
        setFormData({ oldPass: '', newUser: '', newPass: '' });
        // Optional: Close modal after 2 seconds
        setTimeout(() => setShowSettings(false), 2000);
      }
    } catch (err) {
      setMessage({ 
        text: err.response?.data?.message || 'Update failed. Check your old password.', 
        type: 'error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900 transition-all duration-300">
      <aside className={`bg-primary text-white p-4 flex flex-col fixed h-full z-20 transition-all duration-300 ease-in-out border-r border-slate-800 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <div className={`flex items-center gap-3 mb-8 mt-2 transition-all ${isCollapsed ? 'justify-center' : 'px-2'}`}>
          <div className="bg-blue-600 p-2 rounded-lg shrink-0"><ClipboardCheck size={22} /></div>
          {!isCollapsed && <h1 className="text-lg font-bold whitespace-nowrap">BioFence Admin</h1>}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
          <NavItem icon={LayoutDashboard} label="Dashboard" path="/" active={location.pathname === '/'} isCollapsed={isCollapsed} />
          <NavItem icon={ClipboardCheck} label="Attendance" path="/attendance" active={location.pathname === '/attendance'} isCollapsed={isCollapsed} />
          <NavItem icon={Users} label="Students" path="/students" active={location.pathname === '/students'} isCollapsed={isCollapsed} />
          <NavItem icon={FileBarChart} label="Reports" path="/reports" active={location.pathname === '/reports'} isCollapsed={isCollapsed} />

          <div className="pt-4 pb-2">
            {!isCollapsed ? (
              <button onClick={() => setMgmtOpen(!mgmtOpen)} className="flex items-center justify-between w-full px-4 py-2 text-slate-500 hover:text-white transition-colors uppercase text-[10px] font-bold tracking-widest">
                Management <ChevronDown size={14} className={`transition-transform ${mgmtOpen ? '' : '-rotate-90'}`} />
              </button>
            ) : <div className="h-px bg-slate-800 my-4 mx-2" />}
            {(mgmtOpen || isCollapsed) && (
              <div className={`mt-1 space-y-1 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
                {mgmtLinks.map(link => <NavItem key={link.path} {...link} active={location.pathname === link.path} sub isCollapsed={isCollapsed} />)}
              </div>
            )}
          </div>
        </nav>

        {/* BOTTOM SECTION */}
        <div className="mt-auto pt-4 border-t border-slate-800 space-y-1">
          {/* Account Settings - Top of bottom section per request */}
          <button 
            onClick={() => setShowSettings(true)}
            className={`flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white w-full transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          >
            <Settings size={20} />
            {!isCollapsed && <span className="font-medium text-sm">Account Settings</span>}
          </button>

          <button onClick={() => setIsCollapsed(!isCollapsed)} className={`flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-white w-full transition-colors group ${isCollapsed ? 'justify-center' : ''}`}>
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
            {!isCollapsed && <span className="font-medium text-sm">Collapse View</span>}
          </button>

          <button onClick={onLogout} className={`flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-red-400 w-full transition-colors ${isCollapsed ? 'justify-center' : ''}`}>
            <LogOut size={20} />
            {!isCollapsed && <span className="font-medium text-sm">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Modal - Remains the same as your snippet */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-slate-900 p-6 text-white flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">Admin Credentials</h3>
                <p className="text-slate-400 text-xs">Update your login security</p>
              </div>
              <button onClick={() => setShowSettings(false)} className="hover:text-red-400 transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateCredentials} className="p-6 space-y-4">
              {message.text && (
                <div className={`p-3 rounded-lg text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {message.text}
                </div>
              )}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Verify Old Password</label>
                <input type="password" required className="w-full px-4 py-2 border rounded-lg outline-none" value={formData.oldPass} onChange={(e) => setFormData({...formData, oldPass: e.target.value})}/>
              </div>
              <div className="pt-2 border-t">
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Username</label>
                <input type="text" required className="w-full px-4 py-2 border rounded-lg outline-none" value={formData.newUser} onChange={(e) => setFormData({...formData, newUser: e.target.value})}/>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1">New Password</label>
                <input type="password" required className="w-full px-4 py-2 border rounded-lg outline-none" value={formData.newPass} onChange={(e) => setFormData({...formData, newPass: e.target.value})}/>
              </div>
              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
                {isLoading ? 'Updating...' : 'Save New Credentials'}
              </button>
            </form>
          </div>
        </div>
      )}

      <main className={`flex-1 min-h-screen flex flex-col transition-all duration-300 ${isCollapsed ? 'ml-20' : 'ml-64'}`}>
        <header className="h-16 bg-white border-b flex items-center justify-between px-8 sticky top-0 z-10">
          <h2 className="text-sm font-bold text-slate-400 uppercase">Administrative Portal</h2>
          <div className="flex items-center gap-3">
             <div className="text-right"><p className="text-xs font-bold">System Admin</p></div>
             <div className="h-8 w-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xs">SA</div>
          </div>
        </header>
        <div className="p-8 flex-1"><Outlet /></div>
      </main>
    </div>
  );
}