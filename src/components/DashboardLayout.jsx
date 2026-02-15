import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet, useLocation, Link } from 'react-router-dom';
import { GraduationCap, LogOut, Home, Calendar, BookOpen, Library, FileText, Bell, Menu, Megaphone } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [student, setStudent] = useState(null);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const storedStudent = localStorage.getItem('student');

    if (!storedStudent) {
      navigate('/');
      return;
    }

    setStudent(JSON.parse(storedStudent));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('student');
    navigate('/');
  };

  if (!student) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-foreground/60 text-sm animate-pulse">Loading...</p>
      </div>
    );
  }

  const navItems = [
    { path: '/dashboard', icon: Home, label: 'Overview' },
    { path: '/dashboard/attendance', icon: Calendar, label: 'Attendance' },
    { path: '/dashboard/timetable', icon: BookOpen, label: 'Timetable' },
    { path: '/dashboard/grades', icon: FileText, label: 'Grades' },
    { path: '/dashboard/library', icon: Library, label: 'Library' },
    { path: '/dashboard/notices', icon: Bell, label: 'Notices' },
    { path: '/dashboard/make-announcement', icon: Megaphone, label: 'Make Announcement' },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-background border-r border-border/40">
      {/* Minimal Header */}
      <div className="p-6 pb-2">
        <h1 className="text-lg font-semibold tracking-tight text-foreground flex items-center gap-2">
          <GraduationCap className="h-5 w-5 opacity-80" />
          <span>Portal</span>
          {student.admin && (
            <span className="px-1.5 py-px rounded-full text-[9px] font-semibold uppercase tracking-wider bg-emerald-500/10 text-emerald-400/80 border border-emerald-500/20 leading-tight">
              Admin
            </span>
          )}
        </h1>
      </div>

      <div className="px-3 py-6 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileOpen(false)}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-secondary/80 text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-primary' : 'opacity-70'}`} />
              {item.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-auto p-4 border-t border-border/20">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 shrink-0 fixed h-full z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden fixed top-4 left-4 z-40 bg-background/50 backdrop-blur-sm border border-border/20">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 border-r border-border/40 bg-background">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <main className="flex-1 md:ml-64 min-h-screen">
        <div className="mx-auto max-w-5xl p-6 md:p-12 pt-20 md:pt-12 fade-in">
          <Outlet context={{ student }} />
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;