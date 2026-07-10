import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, LayoutDashboard, Users, CalendarOff, Settings, Briefcase, Building, UserCircle } from 'lucide-react';

const pages = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, keywords: 'home main' },
  { name: 'Attendance', path: '/attendance', icon: CalendarOff, keywords: 'check in out time' },
  { name: 'Leaves', path: '/leaves', icon: CalendarOff, keywords: 'vacation time off request' },
  { name: 'Holidays', path: '/holidays', icon: CalendarOff, keywords: 'public festival' },
  { name: 'Employees', path: '/employees', icon: Users, keywords: 'staff workers team', admin: true },
  { name: 'Departments', path: '/departments', icon: Building, keywords: 'teams divisions', admin: true },
  { name: 'Designations', path: '/designations', icon: Briefcase, keywords: 'roles titles positions', admin: true },
  { name: 'Leave Types', path: '/leave-types', icon: Settings, keywords: 'policies policy vacation', admin: true },
  { name: 'My Profile', path: '/profile', icon: UserCircle, keywords: 'account settings me' },
];

export default function CommandPalette({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user?.roles?.some(r => ['admin', 'hr', 'employer'].includes(r.name));

  const filtered = pages.filter(p => {
    if (p.admin && !isAdmin) return false;
    const s = query.toLowerCase();
    return p.name.toLowerCase().includes(s) || p.keywords.includes(s);
  });

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(i => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      navigate(filtered[selectedIndex].path);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  }, [filtered, selectedIndex, navigate, onClose]);

  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]" onClick={onClose} />
      <div className="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-xl z-[90] animate-scale-in">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl shadow-black/10 border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 dark:border-slate-700">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search pages..."
              value={query}
              onChange={e => { setQuery(e.target.value); setSelectedIndex(0); }}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent outline-none text-sm text-slate-800 dark:text-slate-200 placeholder-slate-400"
            />
            <kbd className="text-[10px] font-mono text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded-md">ESC</kbd>
          </div>
          <div className="max-h-72 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-sm text-slate-400 dark:text-slate-500">No results found.</div>
            ) : (
              filtered.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.path}
                    onClick={() => { navigate(item.path); onClose(); }}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      i === selectedIndex
                        ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <Icon size={16} className={i === selectedIndex ? 'text-violet-500' : 'text-slate-400'} />
                    {item.name}
                    {item.admin && <span className="ml-auto text-[9px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded-md">Admin</span>}
                  </button>
                );
              })
            )}
          </div>
          <div className="flex items-center gap-4 px-4 py-2 border-t border-slate-100 dark:border-slate-700 text-[10px] text-slate-400 dark:text-slate-500">
            <span><kbd className="font-mono border border-slate-200 dark:border-slate-600 px-1 rounded">↑↓</kbd> Navigate</span>
            <span><kbd className="font-mono border border-slate-200 dark:border-slate-600 px-1 rounded">↵</kbd> Open</span>
            <span><kbd className="font-mono border border-slate-200 dark:border-slate-600 px-1 rounded">ESC</kbd> Close</span>
          </div>
        </div>
      </div>
    </>
  );
}
