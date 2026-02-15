import React, { useState, useEffect } from 'react';
import { useOutletContext, Link, useNavigate } from 'react-router-dom';
import { User, BookOpen, Calendar, FileText, Library, Bell } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAnnouncements } from '../services/announcements';

const labelBadge = {
  DHA: 'bg-blue-500/15 text-blue-400',
  CA: 'bg-amber-500/15 text-amber-400',
  AA: 'bg-emerald-500/15 text-emerald-400',
  Notice: 'bg-purple-500/15 text-purple-400',
};

const Home = () => {
  const { student } = useOutletContext();
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    getAnnouncements().then((data) => {
      setAnnouncements(data.slice(0, 5));
    });
  }, []);

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Minimal Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Dashboard
        </h1>
        <div className="flex items-center gap-3 text-sm text-muted-foreground/80 font-medium">
          <span className="flex items-center gap-2">
            <User className="w-4 h-4 opacity-70" />
            {student.name}
          </span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{student.branch}</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>{student.year} Year</span>
          <span className="w-1 h-1 rounded-full bg-border" />
          <span>Roll {student.roll_no || student.rollNo}</span>
        </div>
      </div>

      {/* Primary Actions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/dashboard/attendance"
          className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/30 p-6 hover:bg-card/60 transition-all duration-300 hover:shadow-sm hover:border-border/80"
        >
          <div className="flex flex-col gap-4">
            <div className="p-3 w-fit rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground group-hover:text-blue-500 transition-colors">Attendance</h3>
              <p className="text-sm text-muted-foreground mt-1">View your daily attendance records</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/grades"
          className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/30 p-6 hover:bg-card/60 transition-all duration-300 hover:shadow-sm hover:border-border/80"
        >
          <div className="flex flex-col gap-4">
            <div className="p-3 w-fit rounded-lg bg-emerald-500/10 text-emerald-500 group-hover:bg-emerald-500/20 transition-colors">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground group-hover:text-emerald-500 transition-colors">Grades</h3>
              <p className="text-sm text-muted-foreground mt-1">Check your latest semester results</p>
            </div>
          </div>
        </Link>

        <Link
          to="/dashboard/timetable"
          className="group relative overflow-hidden rounded-xl border border-border/40 bg-card/30 p-6 hover:bg-card/60 transition-all duration-300 hover:shadow-sm hover:border-border/80"
        >
          <div className="flex flex-col gap-4">
            <div className="p-3 w-fit rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 transition-colors">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-foreground group-hover:text-purple-500 transition-colors">Timetable</h3>
              <p className="text-sm text-muted-foreground mt-1">Track your weekly schedule</p>
            </div>
          </div>
        </Link>
      </div>

      {/* Recent Announcements */}
      <div className="space-y-6 max-w-2xl">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
          Recent Announcements
        </h2>
        {announcements.length === 0 ? (
          <p className="text-sm text-muted-foreground/60 p-4">No announcements yet.</p>
        ) : (
          <div className="space-y-1">
            {announcements.map((item) => (
              <div
                key={item.id}
                onClick={() => navigate('/dashboard/notices')}
                className="flex items-center justify-between gap-4 p-4 rounded-lg hover:bg-secondary/20 transition-colors group cursor-pointer"
              >
                <p className="text-sm font-medium text-foreground/90 truncate">{item.title}</p>
                <span className={`shrink-0 px-2.5 py-0.5 rounded-full text-xs font-medium ${labelBadge[item.label] || ''}`}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;