import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { getTimetable, getCurrentDay, isClassHappeningNow } from '../services/timetableService';

const TimetablePage = () => {
  const { student } = useOutletContext();
  const [timetableData, setTimetableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDay = getCurrentDay();

  const timeSlots = [
    { period: 1, time: '7:00 AM', start: '7:00', end: '7:55' },
    { period: 2, time: '7:55 AM', start: '7:55', end: '8:50' },
    { period: 3, time: '8:50 AM', start: '8:50', end: '9:45' },
    { period: 'BREAK', time: 'Break', start: '9:45', end: '10:30' },
    { period: 4, time: '10:30 AM', start: '10:30', end: '11:25' },
    { period: 5, time: '11:25 AM', start: '11:25', end: '12:20' },
    { period: 6, time: '12:20 PM', start: '12:20', end: '13:15' },
    { period: 7, time: '1:15 PM', start: '13:15', end: '14:10' },
    { period: 8, time: '2:10 PM', start: '14:10', end: '15:05' },
    { period: 9, time: '3:05 PM', start: '15:05', end: '16:00' },
    { period: 10, time: '4:00 PM', start: '16:00', end: '16:55' }
  ];

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    setLoading(true);
    setError(null);

    const result = await getTimetable(student.branch, student.year);

    if (result.success) {
      if (result.data.length === 0) {
        setError(`No timetable found for ${student.branch} - ${student.year}`);
      }
      setTimetableData(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const getClassForDayPeriod = (day, period) => {
    return timetableData.find(
      item => item.day_of_week === day && String(item.period) === String(period)
    );
  };

  const isCurrentClass = (day, startTime, endTime) => {
    return day === currentDay && isClassHappeningNow(startTime, endTime);
  };

  const getBlockColor = (classType, isCurrent) => {
    if (isCurrent) {
      return 'bg-emerald-900/80 border-emerald-700';
    }
    if (classType === 'LAB') {
      return 'bg-violet-900/70 border-violet-800';
    }
    if (classType === 'LECTURE') {
      return 'bg-slate-700/80 border-slate-600';
    }
    return 'bg-neutral-800/70 border-neutral-700';
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading timetable...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex items-center justify-center bg-black p-6">
        <div className="max-w-md w-full bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
            <div>
              <h3 className="text-yellow-500 font-medium mb-2">No Timetable Found</h3>
              <p className="text-yellow-200/80 text-sm mb-3">{error}</p>
              <div className="bg-black/30 rounded p-3 text-xs">
                <p className="text-neutral-400">Branch: <span className="text-white">{student.branch}</span></p>
                <p className="text-neutral-400">Year: <span className="text-white">{student.year}</span></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-black">
      {/* Header */}
      <div className="px-6 py-4 border-b border-neutral-800">
        <h2 className="text-xl font-medium text-white">
          {student.branch} - {student.year}
        </h2>
      </div>

      {/* Days Header */}
      <div className="flex bg-neutral-900 border-b border-neutral-800">
        <div className="w-24 flex-shrink-0"></div>
        <div className="flex-1 flex">
          {days.map(day => (
            <div
              key={day}
              className={`flex-1 text-center py-3 font-medium text-sm
                ${day === currentDay 
                  ? 'text-slate-300 bg-slate-900/40' 
                  : 'text-neutral-400'
                }`}
            >
              {day}
              {day === currentDay && (
                <span className="block text-xs text-slate-400 mt-0.5">Today</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="flex-1 overflow-auto">
        <div className="flex min-h-full">
          {/* Time Column */}
          <div className="w-24 flex-shrink-0 bg-neutral-900">
            {timeSlots.map((slot) => (
              <div
                key={slot.period}
                className="h-24 flex items-center justify-center border-b border-neutral-800/50"
              >
                <div className="text-center">
                  <div className="text-neutral-400 text-xs font-medium">
                    {slot.time}
                  </div>
                  {slot.period !== 'BREAK' && (
                    <div className="text-neutral-600 text-xs mt-1">P{slot.period}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Days Grid */}
          <div className="flex-1 flex">
            {days.map(day => (
              <div
                key={day}
                className="flex-1 border-l border-neutral-800/30 relative"
              >
                {timeSlots.map((slot) => {
                  const isBreak = slot.period === 'BREAK';

                  return (
                    <div
                      key={slot.period}
                      className="h-24 p-1.5 border-b border-neutral-800/30"
                    >
                      {isBreak ? (
                        <div className="h-full flex items-center justify-center">
                          <span className="text-neutral-700 text-xs">Break</span>
                        </div>
                      ) : (() => {
                        const classData = getClassForDayPeriod(day, slot.period);
                        if (!classData) return null;

                        const isCurrent = isCurrentClass(
                          day,
                          classData.start_time,
                          classData.end_time
                        );

                        return (
                          <div
                            className={`h-full rounded-lg p-2 border-l-4 ${getBlockColor(
                              classData.class_type,
                              isCurrent
                            )} hover:brightness-125 transition cursor-pointer`}
                          >
                            <div className="text-white font-medium text-xs leading-tight mb-1 line-clamp-2">
                              {classData.subject_name}
                            </div>
                            <div className="text-neutral-300 text-xs opacity-90">
                              {classData.subject_code}
                            </div>
                            {classData.room && (
                              <div className="text-neutral-300 text-xs opacity-75 mt-1">
                                {classData.room}
                              </div>
                            )}
                            {isCurrent && (
                              <div className="mt-1">
                                <span className="text-xs bg-emerald-800/50 px-1.5 py-0.5 rounded text-emerald-200">
                                  Live
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="border-t border-neutral-800 bg-neutral-900 px-6 py-3">
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-slate-700/80 border-l-4 border-slate-600 rounded"></div>
            <span className="text-neutral-400">Lecture</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-violet-900/70 border-l-4 border-violet-800 rounded"></div>
            <span className="text-neutral-400">Lab</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-emerald-900/80 border-l-4 border-emerald-700 rounded"></div>
            <span className="text-neutral-400">Ongoing</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimetablePage;