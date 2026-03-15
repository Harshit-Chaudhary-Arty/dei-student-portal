import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { assignmentsService } from '../services/assignmentsService';
import { Trash2, Loader2 } from 'lucide-react';

const BRANCHES = [
  'Computer Science',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Footwear Technology',
  'Agriculture Engineering',
];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
const YEARS = ['1st Year', '2nd Year', '3rd Year', '4th Year'];
const SPECIALIZATIONS = ['General', 'AI/ML', 'IoT', 'Cybersecurity', 'VLSI', 'Structural', 'Thermal'];

const emptyForm = {
  teacher_id: '',
  branch: '',
  semester: '',
  year: '',
  specialization: 'General',
  course_id: '',
};

// Column definitions — single source of truth for both header and cells
const COLS = [
  { key: 'teacher', label: 'Teacher', minWidth: 180 },
  { key: 'branch', label: 'Branch', minWidth: 200 },
  { key: 'semester', label: 'Semester', minWidth: 100 },
  { key: 'year', label: 'Year', minWidth: 110 },
  { key: 'specialization', label: 'Specialization', minWidth: 150 },
  { key: 'course', label: 'Course / Subject', minWidth: 240 },
  { key: 'action', label: '', minWidth: 100 },
];

// Native select styled to look flat and table-like
const SelectInput = ({ value, onChange, disabled, children }) => (
  <select
    value={value}
    onChange={onChange}
    disabled={disabled}
    style={{ minWidth: '100%' }}
    className="
      w-full h-8 px-2 rounded
      bg-secondary/40 hover:bg-secondary/70 focus:bg-secondary/70
      text-foreground text-sm
      border border-transparent hover:border-border/50 focus:border-primary/60
      focus:outline-none focus:ring-0
      transition-colors cursor-pointer
      disabled:opacity-40 disabled:cursor-not-allowed
    "
  >
    {children}
  </select>
);

const TeacherAssignments = () => {
  const { student } = useOutletContext();

  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      assignmentsService.getTeachers(),
      assignmentsService.getAssignments(),
    ])
      .then(([t, a]) => { setTeachers(t); setAssignments(a); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Re-fetch courses when branch / semester / specialization changes
  useEffect(() => {
    if (!form.branch || !form.semester) {
      setCourses([]);
      setForm(f => ({ ...f, course_id: '' }));
      return;
    }
    assignmentsService
      .getCourses(form.branch, form.semester, form.specialization)
      .then(data => { setCourses(data); setForm(f => ({ ...f, course_id: '' })); })
      .catch(console.error);
  }, [form.branch, form.semester, form.specialization]);

  const set = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
    if (error) setError('');
  };

  const handleAssign = async () => {
    const { teacher_id, course_id, branch, semester, year, specialization } = form;
    if (!teacher_id || !branch || !semester || !year || !course_id) {
      setError('Please fill all fields before assigning.');
      return;
    }
    setSaving(true);
    try {
      await assignmentsService.createAssignment({
        teacher_id, course_id, branch, semester, year, specialization,
        assigned_by: student?.name || 'Dean Office',
      });
      const updated = await assignmentsService.getAssignments();
      setAssignments(updated);
      setForm(emptyForm);
      setCourses([]);
    } catch (err) {
      setError(err.message || 'Failed to assign.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      await assignmentsService.deleteAssignment(id);
      setAssignments(a => a.filter(x => x.id !== id));
    } catch {
      setError('Failed to delete assignment.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) return (
    <div className="text-sm text-muted-foreground animate-pulse py-16 text-center">Loading…</div>
  );

  // Shared header row (used by both sections)
  const TableHeader = ({ showActionLabel = false }) => (
    <div className="flex border-b border-border/40 pb-2 mb-0" style={{ minWidth: COLS.reduce((s, c) => s + c.minWidth, 0) }}>
      {COLS.map(col => (
        <div
          key={col.key}
          style={{ minWidth: col.minWidth, flex: col.key === 'course' ? '1 1 auto' : `0 0 ${col.minWidth}px` }}
          className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50"
        >
          {col.label}
        </div>
      ))}
    </div>
  );

  return (
    // Break out of parent max-w-5xl to use full content column width
    <div className="space-y-10">

      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">Teacher Assignments</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Assign teachers to courses for specific branches, semesters, and years.
        </p>
      </div>

      {/* Error */}
      {error && (
        <p className="text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded px-3 py-2 inline-block">
          {error}
        </p>
      )}

      {/* ── New Assignment ─────────────────────────────── */}
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50 mb-3">
          New Assignment
        </p>

        {/*
          IMPORTANT: This form row is NOT inside overflow-x:auto because that
          clips native <select> dropdown menus. Instead we let it scroll with
          the page and use explicit minWidths per column.
        */}
        <div className="w-full overflow-x-visible">
          {/* Header */}
          <div className="flex border-b border-border/40 pb-2">
            {COLS.map(col => (
              <div
                key={col.key}
                style={{
                  minWidth: col.minWidth,
                  flex: col.key === 'course'
                    ? '2 1 auto'
                    : col.key === 'action'
                    ? `0 0 ${col.minWidth}px`
                    : '1 1 auto'
                }}
                className="px-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50"
              >
                {col.label}
              </div>
            ))}
          </div>

          {/* Input row */}
          <div className="flex items-center py-1.5 hover:bg-secondary/10 rounded transition-colors">
            {/* Teacher */}
            <div style={{ minWidth: 180, flex: '1 1 auto' }} className="px-1.5">
              <SelectInput value={form.teacher_id} onChange={e => set('teacher_id', e.target.value)}>
                <option value="">Select teacher…</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </SelectInput>
            </div>

            {/* Branch */}
            <div style={{ minWidth: 200, flex: '1 1 auto' }} className="px-1.5">
              <SelectInput value={form.branch} onChange={e => set('branch', e.target.value)}>
                <option value="">Select branch…</option>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </SelectInput>
            </div>

            {/* Semester */}
            <div style={{ flex: '0 0 100px' }} className="px-1.5">
              <SelectInput value={form.semester} onChange={e => set('semester', e.target.value)}>
                <option value="">Sem…</option>
                {SEMESTERS.map(s => <option key={s} value={s}>Sem {s}</option>)}
              </SelectInput>
            </div>

            {/* Year */}
            <div style={{ flex: '0 0 110px' }} className="px-1.5">
              <SelectInput value={form.year} onChange={e => set('year', e.target.value)}>
                <option value="">Year…</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </SelectInput>
            </div>

            {/* Specialization */}
            <div style={{ minWidth: 150, flex: '1 1 auto' }} className="px-1.5">
              <SelectInput value={form.specialization} onChange={e => set('specialization', e.target.value)}>
                {SPECIALIZATIONS.map(s => <option key={s} value={s}>{s}</option>)}
              </SelectInput>
            </div>

            {/* Course — gets 2x share of leftover width */}
            <div style={{ minWidth: 240, flex: '2 1 auto' }} className="px-1.5">
              <SelectInput
                value={form.course_id}
                onChange={e => set('course_id', e.target.value)}
                disabled={!form.branch || !form.semester}
              >
                <option value="">
                  {!form.branch || !form.semester
                    ? 'Select branch & semester first'
                    : courses.length === 0 ? 'No courses found' : 'Select course…'}
                </option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.course_name} ({c.course_code})</option>
                ))}
              </SelectInput>
            </div>

            {/* Assign */}
            <div style={{ flex: '0 0 100px' }} className="px-1.5">
              <button
                onClick={handleAssign}
                disabled={saving}
                className="flex items-center justify-center gap-1.5 w-full h-8 px-2 rounded text-xs font-medium bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 transition-colors whitespace-nowrap"
              >
                {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                {saving ? 'Saving…' : 'Assign'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Current Assignments ─────────────────────────── */}
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/50">
          Current Assignments
          <span className="font-normal normal-case ml-1.5 text-muted-foreground/40">({assignments.length})</span>
        </p>

        {assignments.length === 0 ? (
          <p className="text-sm text-muted-foreground/50 py-2">
            No assignments yet. Create one above.
          </p>
        ) : (
          // Read-only table — overflow-x:auto is safe here (no dropdowns)
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse" style={{ minWidth: 920 }}>
              <thead>
                <tr className="border-b border-border/40">
                  {[
                    { l: 'Teacher', w: 170 },
                    { l: 'Course', w: 220 },
                    { l: 'Branch', w: 190 },
                    { l: 'Sem', w: 70 },
                    { l: 'Year', w: 100 },
                    { l: 'Specialization', w: 140 },
                    { l: 'Assigned By', w: 130 },
                    { l: '', w: 40 },
                  ].map(h => (
                    <th
                      key={h.l}
                      style={{ minWidth: h.w }}
                      className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/50"
                    >
                      {h.l}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {assignments.map(a => (
                  <tr key={a.id} className="border-b border-border/20 hover:bg-secondary/10 transition-colors group">
                    <td className="px-3 py-2.5 font-medium text-foreground">{a.teachers?.name ?? '—'}</td>
                    <td className="px-3 py-2.5">
                      <span className="text-foreground/90">{a.courses?.course_name ?? '—'}</span>
                      {a.courses?.course_code && (
                        <span className="ml-1.5 text-xs text-muted-foreground">({a.courses.course_code})</span>
                      )}
                    </td>
                    <td className="px-3 py-2.5 text-muted-foreground">{a.branch}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">Sem {a.semester}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{a.year}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{a.specialization}</td>
                    <td className="px-3 py-2.5 text-muted-foreground">{a.assigned_by ?? '—'}</td>
                    <td className="px-3 py-2.5">
                      <button
                        onClick={() => handleDelete(a.id)}
                        disabled={deletingId === a.id}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-all disabled:opacity-30"
                        title="Remove"
                      >
                        {deletingId === a.id
                          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          : <Trash2 className="w-3.5 h-3.5" />}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherAssignments;
