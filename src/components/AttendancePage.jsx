import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Calendar, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { getAttendanceFromSheet } from '../services/attendanceService';

const SUBJECTS = [
  {
    name: 'Mathematics',
    sheetId: '1HNtAjHD7WPWE2k5BXwP4NFN9UI6Knr7EMalQoG8y6TA'
  },
  { name: 'Java', sheetId: '1YQ0L8KZpVAdu134hdRxx0oO1W7IUoVL9hea4Ado8dPY' },
  { name: 'Chemistry', sheetId: 'PASTE_SHEET_ID_3' }
];

const AttendancePage = () => {
  const { student } = useOutletContext();
  const [activeSubject, setActiveSubject] = useState(SUBJECTS[0]);
  const [attendanceData, setAttendanceData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAttendance(activeSubject);
  }, [activeSubject]);

  const loadAttendance = async (subject) => {
    setLoading(true);
    const res = await getAttendanceFromSheet(subject.sheetId, student.roll_no);
    if (res.success) {
      setAttendanceData(res);
    }
    setLoading(false);
  };

  const getStatusColor = (percentage) => {
    if (percentage >= 75) return 'green';
    if (percentage >= 65) return 'yellow';
    return 'red';
  };

  const getStatusInfo = (percentage, classesNeeded) => {
    if (percentage >= 75) {
      return {
        icon: CheckCircle,
        message: 'On Track',
        subMessage: 'Above 75%',
        color: 'text-emerald-500',
        bg: 'bg-emerald-500'
      };
    }
    if (percentage >= 65) {
      return {
        icon: AlertTriangle,
        message: 'Warning',
        subMessage: `${classesNeeded} more needed`,
        color: 'text-amber-500',
        bg: 'bg-amber-500'
      };
    }
    return {
      icon: XCircle,
      message: 'Critical',
      subMessage: `${classesNeeded} more needed`,
      color: 'text-rose-500',
      bg: 'bg-rose-500'
    };
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-background">

      {/* 1. Slim Sidebar (approx 15-20%) */}
      <div className="w-56 flex-shrink-0 border-r border-border/40 bg-card/20 flex flex-col">
        <div className="p-4">
          <h2 className="text-[10px] font-bold text-muted-foreground/70 uppercase tracking-widest pl-2">
            Subjects
          </h2>
        </div>
        <div className="px-2 space-y-0.5 overflow-y-auto flex-1">
          {SUBJECTS.map(sub => (
            <button
              key={sub.name}
              onClick={() => setActiveSubject(sub)}
              className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 flex items-center gap-2.5 truncate
                ${activeSubject.name === sub.name
                  ? 'bg-secondary/60 text-foreground'
                  : 'text-muted-foreground/80 hover:text-foreground hover:bg-secondary/30'}`}
            >
              <div className={`w-0.5 h-3 rounded-full transition-colors ${activeSubject.name === sub.name ? 'bg-primary' : 'bg-transparent'}`} />
              <span className="truncate">{sub.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2. Main Content Area (80-85%) */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">

          {/* Header Row */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-1">
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                {activeSubject.name}
              </h1>
              <p className="text-xs text-muted-foreground">
                Attendance Performance & History
              </p>
            </div>
            {/* Status Badge Inline */}
            {attendanceData && (() => {
              const status = getStatusInfo(attendanceData.stats.percentage, attendanceData.stats.classesNeeded);
              const StatusIcon = status.icon;
              return (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/30 border border-border/40 w-fit">
                  <StatusIcon className={`w-3.5 h-3.5 ${status.color}`} />
                  <span className={`text-xs font-medium ${status.color}`}>{status.message}</span>
                  <span className="text-[10px] text-muted-foreground border-l border-border/50 pl-2 ml-1">{status.subMessage}</span>
                </div>
              );
            })()}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-4">
              <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : attendanceData ? (
            <div className="space-y-8">

              {/* 3. Metrics Overview - Dense Horizontal Layout */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-8 p-6 rounded-xl border border-border/40 bg-card/10">
                {/* Hero Percentage */}
                <div className="md:col-span-1 flex flex-col justify-center">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-5xl font-light tracking-tighter 
                        ${getStatusColor(attendanceData.stats.percentage) === 'green' ? 'text-emerald-500' :
                        getStatusColor(attendanceData.stats.percentage) === 'yellow' ? 'text-amber-500' : 'text-rose-500'}`}>
                      {attendanceData.stats.percentage}
                    </span>
                    <span className="text-xl text-muted-foreground/60 font-light">%</span>
                  </div>
                  <div className="w-full bg-secondary/30 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${getStatusInfo(attendanceData.stats.percentage).bg}`}
                      style={{ width: `${Math.min(attendanceData.stats.percentage, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Key Stats - Horizontal Clean */}
                <div className="md:col-span-3 flex items-center justify-around md:justify-end gap-8 md:gap-12">
                  <div className="text-center md:text-right">
                    <span className="block text-2xl font-medium text-foreground">{attendanceData.stats.total}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Classes</span>
                  </div>
                  <div className="text-center md:text-right">
                    <span className="block text-2xl font-medium text-emerald-500/90">{attendanceData.stats.present}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Present</span>
                  </div>
                  <div className="text-center md:text-right">
                    <span className="block text-2xl font-medium text-rose-500/90">{attendanceData.stats.absent}</span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Absent</span>
                  </div>
                </div>
              </div>

              {/* 4. GitHub-Style History Grid */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground/70" />
                    Activity Log
                  </h3>
                  {/* Legend */}
                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500/80"></span> Present</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[2px] bg-rose-500/80"></span> Absent</div>
                    <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-[2px] bg-secondary"></span> N/A</div>
                  </div>
                </div>

                <div className="p-6 rounded-xl border border-border/40 bg-card/5">
                  <div className="flex flex-wrap gap-2">
                    {attendanceData.data.map((r, i) => (
                      <div
                        key={i}
                        className="relative group"
                      >
                        <div
                          className={`
                            w-5 h-5 rounded-[2px] transition-all duration-300 ease-out cursor-default
                            ${r.status === 'P'
                              ? 'bg-emerald-500 hover:bg-emerald-400 hover:shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                              : r.status === 'A'
                                ? 'bg-rose-500 hover:bg-rose-400 hover:shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                                : 'bg-secondary hover:bg-secondary/80'}
                          `}
                        />

                        {/* Custom Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-50 whitespace-nowrap">
                          <div className="bg-neutral-900 text-neutral-50 text-[10px] font-medium px-2 py-1 rounded shadow-xl border border-neutral-800 animate-in fade-in zoom-in-95 duration-200">
                            {r.date} · <span className={r.status === 'P' ? 'text-emerald-400' : r.status === 'A' ? 'text-rose-400' : 'text-neutral-400'}>
                              {r.status === 'P' ? 'Present' : r.status === 'A' ? 'Absent' : 'N/A'}
                            </span>
                            {/* Arrow */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-neutral-900"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                    {/* Fillers for visual if needed, or empty state */}
                    {!attendanceData.data.length && (
                      <p className="text-sm text-muted-foreground w-full text-center py-8">No activity recorded.</p>
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-4 text-right">
                    Recent activity shown from left to right
                  </p>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex items-center justify-center py-20 border border-dashed border-border/40 rounded-xl bg-card/5">
              <p className="text-muted-foreground text-sm">Select a subject to view attendance</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;