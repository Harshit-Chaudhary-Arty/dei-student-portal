// GradesPage.jsx
import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { FileText } from 'lucide-react';

export const GradesPage = () => {
  const { student } = useOutletContext();

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-light text-white mb-2">Grades & Marks</h2>
          <p className="text-neutral-400 text-sm">
            View your academic performance and grades
          </p>
        </div>

        <div className="bg-neutral-900 rounded-2xl p-12 text-center">
          <FileText className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-xl text-white mb-2">Coming Soon</h3>
          <p className="text-neutral-400 text-sm">
            Grades module is under development
          </p>
        </div>
      </div>
    </div>
  );
};

// TimetablePage.jsx
import { Clock } from 'lucide-react';

export const TimetablePage = () => {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-light text-white mb-2">Timetable</h2>
          <p className="text-neutral-400 text-sm">
            Your weekly class schedule
          </p>
        </div>

        <div className="bg-neutral-900 rounded-2xl p-12 text-center">
          <Clock className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-xl text-white mb-2">Coming Soon</h3>
          <p className="text-neutral-400 text-sm">
            Timetable module is under development
          </p>
        </div>
      </div>
    </div>
  );
};

// LibraryPage.jsx
import { BookOpen } from 'lucide-react';

export const LibraryPage = () => {
  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-light text-white mb-2">Library</h2>
          <p className="text-neutral-400 text-sm">
            Track your issued books and library records
          </p>
        </div>

        <div className="bg-neutral-900 rounded-2xl p-12 text-center">
          <BookOpen className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-xl text-white mb-2">Coming Soon</h3>
          <p className="text-neutral-400 text-sm">
            Library module is under development
          </p>
        </div>
      </div>
    </div>
  );
};

// NoticesPage.jsx
import { useState, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { getAnnouncements, deleteAnnouncement } from '../services/announcements';

const labelBadge = {
  DHA: 'bg-blue-500/15 text-blue-400',
  CA: 'bg-amber-500/15 text-amber-400',
  AA: 'bg-emerald-500/15 text-emerald-400',
  Notice: 'bg-purple-500/15 text-purple-400',
};

export const NoticesPage = () => {
  const { student } = useOutletContext();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAnnouncements().then((data) => {
      setAnnouncements(data);
      setLoading(false);
    });
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;
    const { success } = await deleteAnnouncement(id);
    if (success) {
      setAnnouncements((prev) => prev.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Notices & Announcements
        </h1>
        <p className="text-sm text-muted-foreground/80">
          Stay updated with college announcements
        </p>
      </div>

      {loading ? (
        <div className="space-y-3 max-w-3xl">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-border/30 bg-card/20 p-5 animate-pulse">
              <div className="h-4 bg-secondary/30 rounded w-2/3 mb-3" />
              <div className="h-3 bg-secondary/20 rounded w-full mb-2" />
              <div className="h-3 bg-secondary/20 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : announcements.length === 0 ? (
        <div className="rounded-xl border border-border/30 bg-card/20 p-12 text-center">
          <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-3 max-w-3xl">
          {announcements.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-border/30 bg-card/20 p-5 hover:bg-secondary/20 transition-colors duration-200"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-sm font-semibold text-foreground leading-snug">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${labelBadge[item.label] || ''}`}>
                    {item.label}
                  </span>
                  {student.admin && (
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1 rounded-md text-muted-foreground/40 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete announcement"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
              <p className="text-sm text-muted-foreground/80 leading-relaxed line-clamp-2 mb-2">
                {item.description}
              </p>
              <p className="text-xs text-muted-foreground/50 font-medium">
                {new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};