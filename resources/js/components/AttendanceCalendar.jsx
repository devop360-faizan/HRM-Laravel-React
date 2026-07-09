import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function AttendanceCalendar({ employeeId = null }) {
  const currentDate = new Date();
  const [currentMonth, setCurrentMonth] = useState(currentDate.getMonth());
  const [currentYear, setCurrentYear] = useState(currentDate.getFullYear());
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(false);

  const user = JSON.parse(localStorage.getItem('user')) || {};
  const isAdmin = user?.roles?.some(r => ['admin', 'hr', 'employer'].includes(r.name));

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const endpoint = (isAdmin && employeeId) ? '/attendances/all' : '/attendances';
      const params = { month: currentMonth + 1, year: currentYear };
      if (isAdmin && employeeId) {
        params.user_id = employeeId;
      }

      const { data } = await api.get(endpoint, { params });
      setAttendances(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, [currentMonth, currentYear, employeeId]);

  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getAttendanceForDay = (day) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return attendances.find(a => a.date === dateStr);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'present': return 'bg-green-100 text-green-700 border-green-200';
      case 'absent': return 'bg-red-100 text-red-700 border-red-200';
      case 'late': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'half_day': return 'bg-sky-100 text-sky-700 border-sky-200';
      case 'leave': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
        <h3 className="font-bold text-slate-800 text-lg">
          {monthNames[currentMonth]} {currentYear}
        </h3>
        <div className="flex gap-2">
          <button onClick={handlePrevMonth} className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-100 transition-colors">
            <ChevronLeft size={18} className="text-slate-600" />
          </button>
          <button onClick={handleNextMonth} className="p-1.5 rounded bg-white border border-slate-200 hover:bg-slate-100 transition-colors">
            <ChevronRight size={18} className="text-slate-600" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-500"></div>
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-semibold text-slate-500 uppercase tracking-wider py-2">
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: firstDayOfMonth }).map((_, i) => (
                <div key={`empty-${i}`} className="min-h-[80px] p-2 rounded-lg bg-slate-50 border border-transparent opacity-50"></div>
              ))}

              {Array.from({ length: daysInMonth }).map((_, i) => {
                const day = i + 1;
                const record = getAttendanceForDay(day);
                const isWeekend = new Date(currentYear, currentMonth, day).getDay() === 0 || new Date(currentYear, currentMonth, day).getDay() === 6;
                
                return (
                  <div key={day} className={`min-h-[80px] p-2 rounded-lg border transition-all ${record ? getStatusColor(record.status) : (isWeekend ? 'bg-slate-100 border-slate-200 opacity-60' : 'bg-white border-slate-200 hover:border-sky-300')}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className={`font-semibold text-sm ${record ? '' : 'text-slate-600'}`}>{day}</span>
                    </div>
                    {record && (
                      <div className="flex flex-col gap-1 mt-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider truncate">{record.status.replace('_', ' ')}</span>
                        {(record.check_in || record.check_out) && (
                          <div className="text-[9px] font-mono opacity-80 mt-1">
                            {record.check_in && <div>In: {record.check_in}</div>}
                            {record.check_out && <div>Out: {record.check_out}</div>}
                          </div>
                        )}
                      </div>
                    )}
                    {!record && isWeekend && (
                      <div className="text-[10px] text-slate-400 font-medium mt-1">Weekend</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-4 items-center justify-center text-xs font-medium text-slate-600">
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-green-400"></span> Present</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-400"></span> Late</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-sky-400"></span> Half Day</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-red-400"></span> Absent</div>
        <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-slate-300"></span> No Record</div>
      </div>
    </div>
  );
}

