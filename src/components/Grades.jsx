import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
    Search, FileText, AlertCircle, Loader2, ChevronDown,
    CheckCircle2, BookOpen, GraduationCap
} from 'lucide-react';
import {
    getStoredCredentials,
    loginToCMS,
    fetchRollNumbers,
    fetchSemesters,
    fetchCourses,
    fetchEvaluationComponents,
    fetchGrades,
} from '../services/gradesService';

// ─── Status Steps ───────────────────────────────────────────────────────────────
const STEPS = {
    IDLE: 'idle',
    LOGGING_IN: 'logging_in',
    FETCHING_SEMESTERS: 'fetching_semesters',
    CHOOSE_SEMESTER: 'choose_semester',
    FETCHING_COURSES: 'fetching_courses',
    CHOOSE_COURSE: 'choose_course',
    FETCHING_MARKS: 'fetching_marks',
    DONE: 'done',
    ERROR: 'error',
};

const Grades = () => {
    const { student } = useOutletContext();

    // Flow state
    const [step, setStep] = useState(STEPS.IDLE);
    const [error, setError] = useState('');

    // Data
    const [password, setPassword] = useState(null);
    const [semesters, setSemesters] = useState([]);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [courses, setCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [marksData, setMarksData] = useState(null);
    const [evalComponents, setEvalComponents] = useState(null);

    // ─── 1. On mount: fetch credentials → login → fetch semesters ──────────────
    useEffect(() => {
        const init = async () => {
            if (!student?.roll_no) return;

            try {
                setStep(STEPS.LOGGING_IN);

                // Get password from Supabase
                const pwd = await getStoredCredentials(student.roll_no);
                if (!pwd) {
                    setError('Could not retrieve your CMS password. Please re-login.');
                    setStep(STEPS.ERROR);
                    return;
                }
                setPassword(pwd);

                // Login to CMS
                const loginOk = await loginToCMS(student.roll_no, pwd);
                if (!loginOk) {
                    setError('Failed to authenticate with the CMS. Please try again later.');
                    setStep(STEPS.ERROR);
                    return;
                }

                // Optionally confirm session via roll number list
                await fetchRollNumbers();

                // Fetch semesters
                setStep(STEPS.FETCHING_SEMESTERS);
                const sems = await fetchSemesters(student.roll_no);
                if (!sems || sems.length === 0) {
                    setError('No semesters found for your roll number.');
                    setStep(STEPS.ERROR);
                    return;
                }
                setSemesters(sems);
                setStep(STEPS.CHOOSE_SEMESTER);
            } catch (e) {
                console.error(e);
                setError(e.message || 'An unexpected error occurred.');
                setStep(STEPS.ERROR);
            }
        };

        init();
    }, [student]);

    // ─── 2. When user picks a semester → fetch courses ─────────────────────────
    const handleSemesterChange = useCallback(async (index) => {
        const sem = semesters[index];
        if (!sem) return;

        setSelectedSemester(sem);
        setSelectedCourse(null);
        setCourses([]);
        setMarksData(null);
        setEvalComponents(null);
        setError('');

        try {
            setStep(STEPS.FETCHING_COURSES);
            const courseList = await fetchCourses(student.roll_no, sem);
            if (!courseList || courseList.length === 0) {
                setError('No courses found for this semester.');
                setStep(STEPS.CHOOSE_SEMESTER);
                return;
            }
            setCourses(courseList);
            setStep(STEPS.CHOOSE_COURSE);
        } catch (e) {
            console.error(e);
            setError(e.message || 'Failed to fetch courses.');
            setStep(STEPS.CHOOSE_SEMESTER);
        }
    }, [semesters, student]);

    // ─── 3. When user picks a course → fetch marks ─────────────────────────────
    const handleCourseChange = useCallback(async (index) => {
        const course = courses[index];
        if (!course) return;

        // Merge semester details into course object so params are complete
        const courseDetails = {
            ...selectedSemester,
            ...course,
        };

        setSelectedCourse(courseDetails);
        setMarksData(null);
        setError('');

        try {
            setStep(STEPS.FETCHING_MARKS);

            // Fetch evaluation columns & marks in parallel
            const [evalData, gradesData] = await Promise.all([
                fetchEvaluationComponents(student.roll_no, courseDetails),
                fetchGrades(student.roll_no, courseDetails),
            ]);

            setEvalComponents(evalData);
            setMarksData(gradesData);
            setStep(STEPS.DONE);
        } catch (e) {
            console.error(e);
            setError(e.message || 'Failed to fetch marks.');
            setStep(STEPS.CHOOSE_COURSE);
        }
    }, [courses, selectedSemester, student]);

    // ─── Helpers ────────────────────────────────────────────────────────────────
    const isLoading = [
        STEPS.LOGGING_IN,
        STEPS.FETCHING_SEMESTERS,
        STEPS.FETCHING_COURSES,
        STEPS.FETCHING_MARKS,
    ].includes(step);

    const loadingMessage = {
        [STEPS.LOGGING_IN]: 'Authenticating with CMS …',
        [STEPS.FETCHING_SEMESTERS]: 'Loading semesters …',
        [STEPS.FETCHING_COURSES]: 'Loading courses …',
        [STEPS.FETCHING_MARKS]: 'Fetching marks …',
    }[step];

    // Derive a human-readable semester label
    // Derive a human-readable semester label
    const semLabel = (sem) => {
        // Try common key names from the API
        const code = sem.semesterCode || sem.semesterName || sem.semester || '';
        // User requested removing dates
        return code || 'Unknown Semester';
    };

    // Extract a plain-text value from an XML-parsed node (might be string or nested object)
    const textOf = (val) => {
        if (val === null || val === undefined) return '';
        if (typeof val === 'string') return val;
        if (typeof val === 'object') {
            // Try common XML text patterns
            if (val['#text']) return val['#text'];
            // Recurse into first child
            const keys = Object.keys(val).filter(k => k !== '@attributes');
            if (keys.length > 0) return textOf(val[keys[0]]);
            return ''; // Return empty string if object has no text content
        }
        return String(val);
    };

    // Derive a human-readable course label
    const courseLabel = (c) => {
        const code = textOf(c.courseCode) || textOf(c.course) || '';
        const name = textOf(c.courseName) || textOf(c.courseTitle) || '';

        if (name && name !== code) return `${code} — ${name}`;
        return code || name || 'Unknown Course';
    };

    // ─── Extract student row from marks data ────────────────────────────────────
    const renderMarksTable = () => {
        if (!marksData) return null;

        // Extract evaluation components from evalComponents (from getStudentListANG.htm)
        let components = [];
        if (evalComponents?.ComponentList?.component) {
            components = Array.isArray(evalComponents.ComponentList.component)
                ? evalComponents.ComponentList.component
                : [evalComponents.ComponentList.component];
        } else if (evalComponents?.component) {
            components = Array.isArray(evalComponents.component)
                ? evalComponents.component
                : [evalComponents.component];
        }

        // Extract marks details from marksData (from getStudentMarks.htm)
        let marksDetails = [];
        if (marksData?.MarksDetails?.marksDetail) {
            marksDetails = Array.isArray(marksData.MarksDetails.marksDetail)
                ? marksData.MarksDetails.marksDetail
                : [marksData.MarksDetails.marksDetail];
        } else if (marksData?.marksDetail) {
            marksDetails = Array.isArray(marksData.marksDetail)
                ? marksData.marksDetail
                : [marksData.marksDetail];
        } else if (marksData?.component) {
            marksDetails = Array.isArray(marksData.component)
                ? marksData.component
                : [marksData.component];
        } else if (marksData?.studentMarks) {
            marksDetails = Array.isArray(marksData.studentMarks)
                ? marksData.studentMarks
                : [marksData.studentMarks];
        }

        console.log("[Grades] Components:", components);
        console.log("[Grades] Marks details:", marksDetails);

        const studentRoll = student?.roll_no?.toString();

        // Filter marks for the current student
        const studentMarks = marksDetails.filter(
            d => textOf(d.rollNumber) === studentRoll || textOf(d.rollNo) === studentRoll
        );

        console.log("[Grades] Student marks:", studentMarks);

        if (studentMarks.length === 0) {
            return (
                <div className="p-8 text-center text-neutral-400">
                    No marks found for Roll No: {studentRoll}
                    <pre className="mt-4 text-xs text-left text-neutral-600 overflow-x-auto max-h-48 bg-neutral-950 p-4 rounded-lg">
                        {JSON.stringify({ evalComponents, marksData }, null, 2)}
                    </pre>
                </div>
            );
        }

        // Build table headers from components
        let headers = components.map(comp => ({
            id: textOf(comp.evaluationId),
            name: textOf(comp.evaluationIdName),
            maxMarks: textOf(comp.maximumMarks)
        }));

        // Extract summary info (total marks, grade, etc.) - usually the first entry or aggregated
        const summary = studentMarks[0];
        const totalMarks = textOf(summary.totalMarks) || textOf(summary.totalInternal);
        const grade = textOf(summary.internalGrade) || textOf(summary.finalGradePoint);

        // Create marks map by evaluationId
        const marksMap = {};
        studentMarks.forEach(mark => {
            const evalId = textOf(mark.evaluationId);
            const markValue = textOf(mark.marks) || textOf(mark.mark) || textOf(mark.obtMarks);
            if (evalId) {
                marksMap[evalId] = markValue || '-';
            }
        });

        // ALWAYS check marks data for additional columns not in metadata
        if (studentMarks.length > 0) {
            const knownNames = {
                'E01': 'CT1',
                'E02': 'CT1', // Originally CT1/CT2 mapping might vary so kept safer defaults, updating per user request
                'E03': 'CT2',
                'E04': 'DHA',
                'E05': 'ATT', // Wait, user said E05 is DHA? And E04 is DH1? And E06 AA? E07 ATT?
                'E06': 'AA',
                'E07': 'ATT',
                'E08': 'Total Internal',
                'E09': 'Total External'
            };

            // Override with specific user provided mapping if needed
            // User requested: E02->CT1, E03->CT2, E04->DH1/DHA?, E05->DHA/ATT?, E06->AA, E07->ATT
            // Let's use a very robust map based on common patterns
            const specificMap = {
                'E01': 'CT1',
                'E02': 'CT1',
                'E03': 'CT2',
                'E04': 'DHA', // Or DH1
                'E05': 'DHA (or SSA)', // Usually DHA
                'E06': 'AA',
                'E07': 'ATT'
            };

            // Adjusting based on user snippet:
            // E02=CT1 (40), E03=CT2 (40), E04=DH1 (40), E05=DHA (40), E06=AA (20), E07=ATT (10)
            const userMapping = {
                'E02': { name: 'CT1', max: '40' },
                'E03': { name: 'CT2', max: '40' },
                'E04': { name: 'DH1', max: '40' },
                'E05': { name: 'DHA', max: '40' },
                'E06': { name: 'AA', max: '20' },
                'E07': { name: 'ATT', max: '10' }
            };

            const existingIds = new Set(headers.map(h => h.id));
            const uniqueIds = [...new Set(studentMarks.map(m => textOf(m.evaluationId)))].filter(Boolean).sort();

            uniqueIds.forEach(id => {
                const mapped = userMapping[id];
                const fallbackName = knownNames[id] || id;

                if (!existingIds.has(id)) {
                    // Append missing column
                    headers.push({
                        id: id,
                        name: mapped?.name || fallbackName,
                        maxMarks: mapped?.max || '?'
                    });
                } else {
                    // Update name/maxMarks for existing ID if strictly necessary (e.g. if name is just ID)
                    const h = headers.find(x => x.id === id);
                    if (h) {
                        if (h.name === id || !h.name) {
                            h.name = mapped?.name || fallbackName;
                        }
                        if (mapped?.max && (h.maxMarks === '?' || !h.maxMarks)) {
                            h.maxMarks = mapped.max;
                        }
                    }
                }
            });
        }

        return (
            <table className="w-full text-left text-sm text-neutral-400">
                <thead className="bg-neutral-950 text-neutral-200 uppercase tracking-wider font-medium">
                    <tr className="border-b border-neutral-800">
                        <th className="p-4">Roll No</th>
                        <th className="p-4">Name</th>
                        {headers.map(h => (
                            <th key={h.id} className="p-4" title={`Max: ${h.maxMarks}`}>
                                {h.name}
                                <span className="text-xs text-neutral-500 ml-1">({h.maxMarks})</span>
                            </th>
                        ))}
                        <th className="p-4 text-white">TOTAL</th>
                        <th className="p-4 text-white">GRADE</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                    <tr className="hover:bg-neutral-800/30 transition">
                        <td className="p-4 font-mono text-white">{studentRoll}</td>
                        <td className="p-4 font-medium text-white">
                            {student.name || `${student.first_name || ''} ${student.last_name || ''}`}
                        </td>
                        {headers.map(h => (
                            <td key={h.id} className="p-4">
                                {marksMap[h.id] || '-'}
                            </td>
                        ))}
                        <td className="p-4 font-bold text-white">{totalMarks || '-'}</td>
                        <td className="p-4 font-bold text-blue-400">{grade || '-'}</td>
                    </tr>
                </tbody>
            </table>
        );
    };

    // ─── RENDER ─────────────────────────────────────────────────────────────────
    return (
        <div className="p-6 md:p-8 w-full mx-auto">
            {/* Header */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                    <GraduationCap className="w-8 h-8 text-blue-400" />
                    Student Grades
                </h2>
                <p className="text-neutral-400">
                    View your marks from the central CMS system
                </p>
            </div>

            <div className="flex flex-col xl:flex-row gap-6 items-start">
                {/* ─── LEFT PANEL — Selection Controls ─────────────────────────── */}
                <div className="w-full xl:w-80 shrink-0 space-y-4">
                    {/* Status Indicator */}
                    {isLoading && (
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-center gap-3">
                            <Loader2 className="w-5 h-5 text-blue-400 animate-spin shrink-0" />
                            <p className="text-blue-200 text-sm font-medium">{loadingMessage}</p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-900/20 border border-red-900/50 rounded-xl p-4 flex flex-col gap-2 text-red-200">
                            <div className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5 shrink-0" />
                                <p className="font-semibold">Error</p>
                            </div>
                            <p className="text-sm opacity-90">{error}</p>
                        </div>
                    )}

                    {/* Semester Dropdown */}
                    {(step === STEPS.CHOOSE_SEMESTER || step === STEPS.FETCHING_COURSES ||
                        step === STEPS.CHOOSE_COURSE || step === STEPS.FETCHING_MARKS ||
                        step === STEPS.DONE) && (
                            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-300 mb-3">
                                    <BookOpen className="w-4 h-4 text-blue-400" />
                                    Choose Semester
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:border-blue-500 transition text-sm"
                                        value={selectedSemester ? semesters.indexOf(selectedSemester) : ''}
                                        onChange={(e) => handleSemesterChange(Number(e.target.value))}
                                        disabled={isLoading}
                                    >
                                        <option value="" disabled>— Select a semester —</option>
                                        {semesters.map((sem, i) => (
                                            <option key={i} value={i}>
                                                {semLabel(sem)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                                </div>
                            </div>
                        )}

                    {/* Course Dropdown */}
                    {(step === STEPS.CHOOSE_COURSE || step === STEPS.FETCHING_MARKS ||
                        step === STEPS.DONE) && courses.length > 0 && (
                            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5">
                                <label className="flex items-center gap-2 text-sm font-semibold text-neutral-300 mb-3">
                                    <FileText className="w-4 h-4 text-emerald-400" />
                                    Choose Course
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full bg-black border border-neutral-700 rounded-lg px-4 py-3 text-white appearance-none cursor-pointer focus:outline-none focus:border-emerald-500 transition text-sm"
                                        value={selectedCourse ? courses.findIndex(c => c.courseCode === selectedCourse.courseCode) : ''}
                                        onChange={(e) => handleCourseChange(Number(e.target.value))}
                                        disabled={isLoading}
                                    >
                                        <option value="" disabled>— Select a course —</option>
                                        {courses.map((c, i) => (
                                            <option key={i} value={i}>
                                                {courseLabel(c)}
                                            </option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500 pointer-events-none" />
                                </div>
                            </div>
                        )}

                    {/* Success badge */}
                    {step === STEPS.DONE && (
                        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 flex items-center gap-3">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                            <p className="text-emerald-200 text-sm font-medium">
                                Marks loaded for {selectedCourse?.courseCode}
                            </p>
                        </div>
                    )}
                </div>

                {/* ─── RIGHT PANEL — Results ───────────────────────────────────── */}
                <div className="flex-1 w-full min-w-0">
                    {isLoading && step === STEPS.FETCHING_MARKS && (
                        <div className="h-64 flex flex-col items-center justify-center bg-neutral-900 border border-neutral-800 rounded-xl mb-6">
                            <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                            <p className="text-neutral-400 font-medium">Fetching marks …</p>
                        </div>
                    )}

                    {marksData && step === STEPS.DONE && (
                        <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
                            <div className="p-4 border-b border-neutral-800 bg-neutral-800/50 flex justify-between items-center">
                                <h3 className="text-white font-medium flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                    Results for {selectedCourse?.courseCode}
                                    {selectedSemester && (
                                        <span className="text-neutral-500 text-sm ml-2">
                                            ({semLabel(selectedSemester)})
                                        </span>
                                    )}
                                </h3>
                            </div>

                            <div className="p-0 overflow-x-auto">
                                {renderMarksTable()}
                            </div>
                        </div>
                    )}

                    {!marksData && !isLoading && step !== STEPS.ERROR && (
                        <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-neutral-500 border-2 border-dashed border-neutral-800 rounded-xl bg-neutral-900/30">
                            <Search className="w-12 h-12 mb-2 opacity-20" />
                            <p>
                                {step === STEPS.IDLE || step === STEPS.LOGGING_IN || step === STEPS.FETCHING_SEMESTERS
                                    ? 'Initializing …'
                                    : step === STEPS.CHOOSE_SEMESTER
                                        ? 'Select a semester to continue'
                                        : step === STEPS.CHOOSE_COURSE
                                            ? 'Select a course to view marks'
                                            : 'Enter details to view marks'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Grades;
