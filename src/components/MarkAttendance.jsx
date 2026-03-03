import React, { useState, useRef } from 'react';

const mockStudents = [
    { rollNo: '101', name: 'Alice Smith', prev1: 'P', prev2: 'P' },
    { rollNo: '102', name: 'Bob Johnson', prev1: 'P', prev2: 'A' },
    { rollNo: '103', name: 'Charlie Brown', prev1: 'A', prev2: 'P' },
    { rollNo: '104', name: 'Diana Prince', prev1: 'P', prev2: 'P' },
    { rollNo: '105', name: 'Ethan Hunt', prev1: 'A', prev2: 'A' },
    { rollNo: '106', name: 'Fiona Gallagher', prev1: 'P', prev2: 'P' },
    { rollNo: '107', name: 'George Costanza', prev1: 'A', prev2: 'P' },
    { rollNo: '108', name: 'Hannah Abbott', prev1: 'P', prev2: 'P' },
    { rollNo: '109', name: 'Ian Wright', prev1: 'A', prev2: 'A' },
    { rollNo: '110', name: 'Julia Roberts', prev1: 'P', prev2: 'P' },
];

const MarkAttendance = () => {
    const [attendance, setAttendance] = useState({});
    const [message, setMessage] = useState('');
    const inputRefs = useRef([]);

    // Today's date formatted nicely, e.g., "Oct 26"
    const todayDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // Example past dates
    const prevDate1 = new Date(Date.now() - 86400000 * 2).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const prevDate2 = new Date(Date.now() - 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    const handleInputChange = (index, rollNo, value) => {
        // We only care about the last character typed to override the existing one smoothly without selecting
        const lastChar = value.slice(-1).toUpperCase();

        if (lastChar === 'P' || lastChar === 'A') {
            setAttendance((prev) => ({ ...prev, [rollNo]: lastChar }));

            // Auto-move cursor to next cell
            if (index + 1 < mockStudents.length) {
                inputRefs.current[index + 1]?.focus();
            }
        } else if (value === '' || lastChar === ' ') {
            setAttendance((prev) => {
                const newAtt = { ...prev };
                delete newAtt[rollNo];
                return newAtt;
            });
        }
        // Any other character is ignored
    };

    const handleKeyDown = (e, index) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (index + 1 < mockStudents.length) {
                inputRefs.current[index + 1]?.focus();
            }
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (index - 1 >= 0) {
                inputRefs.current[index - 1]?.focus();
            }
        } else if (e.key === 'Backspace' && !attendance[mockStudents[index].rollNo]) {
            // If backspace pressed on empty cell, move up
            e.preventDefault();
            if (index - 1 >= 0) {
                inputRefs.current[index - 1]?.focus();
            }
        }
    };

    const handleSubmit = () => {
        setMessage('Attendance recorded (temporary).');
        setTimeout(() => setMessage(''), 3000);
    };

    return (
        <div className="flex h-[calc(100vh-4rem)] bg-background">
            <div className="flex-1 overflow-y-auto pb-12">
                <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">

                    <div className="space-y-1">
                        <h1 className="text-xl font-semibold tracking-tight text-foreground">
                            Mark Attendance
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Teacher Portal
                        </p>
                    </div>

                    <div className="rounded border border-border/60 bg-card overflow-hidden shadow-sm mt-2">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left whitespace-nowrap border-collapse table-fixed">
                                <thead>
                                    <tr>
                                        <th className="px-3 py-2 sticky left-0 bg-secondary/80 backdrop-blur z-30 w-24 border border-border/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Roll No</th>
                                        <th className="px-3 py-2 sticky left-24 bg-secondary/80 backdrop-blur z-30 w-auto border border-border/60 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Name</th>
                                        <th className="p-0 border border-border/60 w-16 bg-secondary/30">
                                            <div className="px-1 py-1 text-center text-[11px] font-semibold text-muted-foreground">{prevDate1}</div>
                                        </th>
                                        <th className="p-0 border border-border/60 w-16 bg-secondary/30">
                                            <div className="px-1 py-1 text-center text-[11px] font-semibold text-muted-foreground">{prevDate2}</div>
                                        </th>
                                        <th className="p-0 border border-border/60 w-20 bg-primary/10">
                                            <div className="px-1 py-1 text-center text-[11px] font-bold text-primary">{todayDate}</div>
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {mockStudents.map((student, index) => {
                                        const status = attendance[student.rollNo] || '';
                                        return (
                                            <tr key={student.rollNo} className="hover:bg-secondary/10 transition-colors group">
                                                <td className="px-3 py-1.5 sticky left-0 bg-background group-hover:bg-secondary/10 z-10 text-muted-foreground font-mono text-[13px] border border-border/60 bg-clip-padding">{student.rollNo}</td>
                                                <td className="px-3 py-1.5 sticky left-24 bg-background group-hover:bg-secondary/10 z-10 font-medium text-foreground text-[14px] border border-border/60 bg-clip-padding">{student.name}</td>

                                                {/* Previous Date 1 */}
                                                <td className={`p-0 border border-border/60 text-center font-bold text-sm transition-colors
                                                    ${student.prev1 === 'P' ? 'bg-emerald-500/15 text-emerald-500/80' : 'bg-rose-500/15 text-rose-500/80'}`}>
                                                    <div className="w-full h-full flex items-center justify-center py-1">
                                                        {student.prev1}
                                                    </div>
                                                </td>

                                                {/* Previous Date 2 */}
                                                <td className={`p-0 border border-border/60 text-center font-bold text-sm transition-colors
                                                    ${student.prev2 === 'P' ? 'bg-emerald-500/15 text-emerald-500/80' : 'bg-rose-500/15 text-rose-500/80'}`}>
                                                    <div className="w-full h-full flex items-center justify-center py-1">
                                                        {student.prev2}
                                                    </div>
                                                </td>

                                                {/* Today */}
                                                <td className={`p-0 border border-border/60 text-center bg-background transition-colors
                                                    ${status === 'P' ? 'bg-emerald-500/30' : status === 'A' ? 'bg-rose-500/30' : ''}`}>
                                                    <input
                                                        ref={el => inputRefs.current[index] = el}
                                                        type="text"
                                                        value={status}
                                                        placeholder=""
                                                        onChange={(e) => handleInputChange(index, student.rollNo, e.target.value)}
                                                        onKeyDown={(e) => handleKeyDown(e, index)}
                                                        onFocus={(e) => e.target.select()}
                                                        className={`
                                                            w-full h-full py-1 text-center font-bold text-sm outline-none transition-all uppercase bg-transparent
                                                            focus:bg-secondary/30 focus:shadow-[inset_0_0_0_2px_rgba(255,255,255,0.2)]
                                                            ${status === 'P' ? 'text-emerald-500' : status === 'A' ? 'text-rose-500' : 'text-foreground placeholder:text-muted-foreground/20'}
                                                        `}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                        <div className="h-8 flex items-center">
                            {message && (
                                <p className="text-emerald-500/90 text-sm font-medium animate-in fade-in slide-in-from-bottom-1 duration-300 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    {message}
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleSubmit}
                            className="px-5 py-2 mt-2 bg-foreground text-background text-sm font-medium rounded hover:bg-foreground/90 transition-all shadow-sm active:scale-[0.98]"
                        >
                            Submit Attendance
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default MarkAttendance;
