import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  CalendarOff, 
  Settings, 
  Briefcase,
  Menu,
  Bell,
  Search,
  Maximize,
  Grid,
  Mail,
  ChevronDown,
  Building
} from 'lucide-react';
import api from '../api/axios';

export default function Layout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user?.roles?.some(r => ['admin', 'hr', 'employer'].includes(r.name));

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = async () => {
    await api.post('/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Attendance', path: '/attendance', icon: CalendarOff }, // Now separate
    { name: 'Leaves', path: '/leaves', icon: CalendarOff },
    { name: 'Holidays', path: '/holidays', icon: CalendarOff },
  ];

  const adminItems = [
    { name: 'Employees', path: '/employees', icon: Users },
    { name: 'Departments', path: '/departments', icon: Building },
    { name: 'Designations', path: '/designations', icon: Briefcase },
    { name: 'Leave Types', path: '/leave-types', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-[#F3F4F6] font-sans">
      
      {/* Sidebar */}
      <aside className={`bg-white border-r border-slate-200 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 overflow-hidden'}`}>
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <img src="/devop.png" alt="DevOp Logo" className="h-10 object-contain" />
        </div>
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Main Menu</p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-50 text-sky-600'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon size={18} className={isActive ? 'text-sky-600' : 'text-slate-400'} />
                  {item.name}
                </Link>
              );
            })}
            
            {isAdmin && (
              <>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6 mb-2">Administration</p>
                {adminItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-sky-50 text-sky-600'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-sky-600' : 'text-slate-400'} />
                      {item.name}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 text-slate-500 hover:bg-slate-100 rounded-md">
              <Menu size={20} />
            </button>
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input type="text" placeholder="Search in HRMS" className="pl-10 pr-4 py-2 bg-slate-50 border border-transparent focus:border-slate-300 focus:bg-white rounded-full text-sm w-64 outline-none transition-all" />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-[10px] font-mono text-slate-400 border px-1.5 rounded">CTRL</span>
                <span className="text-[10px] font-mono text-slate-400 border px-1.5 rounded">/</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-slate-500">
              <button className="p-2 hover:bg-slate-100 rounded-full relative">
                <Bell size={18} />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
              </button>
            </div>

            <div className="relative ml-2">
              <button 
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 hover:bg-slate-50 rounded-full transition-colors"
              >
                <img src={user.avatar || `https://ui-avatars.com/api/?name=${user.name}&background=ffedd5&color=ea580c`} alt="avatar" className="w-8 h-8 rounded-full border border-slate-200 object-cover" />
                <ChevronDown size={14} className="text-slate-500 mr-1" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 py-1 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-700 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <Link to="/profile" className="block w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
                    My Profile
                  </Link>
                  <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-slate-100 mt-1 pt-1 transition-colors">
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-6 relative">
          {children}
        </main>
      </div>
    </div>
  );
}

