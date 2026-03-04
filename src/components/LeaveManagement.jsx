import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { leaveService } from '../services/leaveService';
import { Button } from '@/components/ui/button';
import { Upload, CheckCircle2, Clock, AlertCircle, Eye, FileText, Trash2 } from 'lucide-react';

const LeaveManagement = () => {
    const { student } = useOutletContext();
    const [teachers, setTeachers] = useState([]);
    const [requests, setRequests] = useState([]);

    // Form State
    const [teacherId, setTeacherId] = useState('');
    const [leaveDate, setLeaveDate] = useState('');
    const [leaveType, setLeaveType] = useState('DL');
    const [reason, setReason] = useState('');
    const [attachment, setAttachment] = useState(null);

    // UI State
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadInitialData();
    }, [student]);

    const loadInitialData = async () => {
        try {
            setIsLoading(true);
            const [fetchedTeachers, fetchedRequests] = await Promise.all([
                leaveService.getTeachers(),
                leaveService.getStudentLeaveRequests(student.enrollmentNo || student.id || "test-roll") // Fallback if no exact roll no
            ]);
            setTeachers(fetchedTeachers);
            setRequests(fetchedRequests);
        } catch (err) {
            console.error("Failed to load leave data:", err);
            setErrorMsg("Failed to load initial data.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setAttachment(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setMessage('');

        if (!teacherId || !leaveDate || !reason) {
            setErrorMsg("Please fill out all required fields.");
            return;
        }

        try {
            setIsSubmitting(true);

            let attachmentUrl = null;
            const rollNo = student.enrollmentNo || student.id || "test-roll";

            if (attachment) {
                attachmentUrl = await leaveService.uploadAttachment(attachment, rollNo);
            }

            await leaveService.createLeaveRequest({
                student_name: student.name,
                roll_no: rollNo,
                teacher_id: teacherId,
                leave_type: leaveType,
                leave_date: leaveDate,
                reason: reason,
                attachment_url: attachmentUrl,
                status: 'Pending'
            });

            setMessage("Request submitted successfully!");

            // Reset form
            setTeacherId('');
            setLeaveDate('');
            setReason('');
            setAttachment(null);
            // Reset file input element visually
            const fileInput = document.getElementById('file-upload');
            if (fileInput) fileInput.value = "";

            // Reload requests
            const freshRequests = await leaveService.getStudentLeaveRequests(rollNo);
            setRequests(freshRequests);

            // Clear success message after 3 seconds
            setTimeout(() => setMessage(''), 3000);

        } catch (err) {
            console.error("Submission failed:", err);
            setErrorMsg(err.message || "Failed to submit request.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Delete this leave request?")) {
            try {
                await leaveService.deleteLeaveRequest(id);
                const rollNo = student.enrollmentNo || student.id || "test-roll";
                const freshRequests = await leaveService.getStudentLeaveRequests(rollNo);
                setRequests(freshRequests);
            } catch (err) {
                console.error("Failed to delete request:", err);
                setErrorMsg(err.message || "Failed to delete request.");
            }
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'Approved':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"><CheckCircle2 className="w-3 h-3" /> Approved</span>;
            case 'Rejected':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-500 border border-red-500/20"><AlertCircle className="w-3 h-3" /> Rejected</span>;
            case 'Review':
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/10 text-blue-500 border border-blue-500/20"><Eye className="w-3 h-3" /> Reviewing</span>;
            default:
                return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-500 border border-yellow-500/20"><Clock className="w-3 h-3" /> Pending</span>;
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Leave Management...</div>;
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">Leave Management</h2>
                <p className="text-muted-foreground mt-1">Submit your Duty Leave (DL) or Medical Leave (ML) requests.</p>
            </div>

            <div>
                {message && (
                    <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-md text-sm flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4" /> {message}
                    </div>
                )}

                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-md text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> {errorMsg}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Select Teacher *</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                value={teacherId}
                                onChange={(e) => setTeacherId(e.target.value)}
                                required
                            >
                                <option value="">-- Choose Teacher --</option>
                                {teachers.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Date *</label>
                            <input
                                type="date"
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                value={leaveDate}
                                onChange={(e) => setLeaveDate(e.target.value)}
                                required
                            />
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Leave Type *</label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                value={leaveType}
                                onChange={(e) => setLeaveType(e.target.value)}
                            >
                                <option value="DL">Duty Leave (DL)</option>
                                <option value="ML">Medical Leave (ML)</option>
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium">Proof Attachment</label>
                            <div className="flex items-center gap-3">
                                <label className="flex h-10 w-full cursor-pointer items-center justify-center rounded-md border border-input bg-background px-3 py-2 text-sm hover:bg-muted/50 transition-colors">
                                    <Upload className="w-4 h-4 mr-2 opacity-70" />
                                    <span className="truncate opacity-70">{attachment ? attachment.name : 'Upload PDF/Image'}</span>
                                    <input
                                        id="file-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*,application/pdf"
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5 pt-2">
                        <label className="text-sm font-medium">Reason *</label>
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="Explain the reason for your leave..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            required
                        />
                    </div>

                    <div className="pt-2 flex justify-end">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Submitting...' : 'Submit Request'}
                        </Button>
                    </div>
                </form>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-medium mb-4">My Requests History</h3>

                {requests.length === 0 ? (
                    <div className="bg-muted/20 border border-border/40 rounded-xl p-8 text-center text-muted-foreground text-sm flex flex-col items-center justify-center">
                        <FileText className="w-8 h-8 opacity-20 mb-2" />
                        No leave requests found.
                    </div>
                ) : (
                    <div className="bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs uppercase bg-muted/50 text-muted-foreground">
                                    <tr>
                                        <th className="px-4 py-3 font-medium">Date</th>
                                        <th className="px-4 py-3 font-medium">Type</th>
                                        <th className="px-4 py-3 font-medium">Teacher</th>
                                        <th className="px-4 py-3 font-medium">Status</th>
                                        <th className="px-4 py-3 font-medium min-w-[200px]">Comments</th>
                                        <th className="px-4 py-3 font-medium">Proof</th>
                                        <th className="px-4 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40">
                                    {requests.map(req => (
                                        <tr key={req.id} className="hover:bg-muted/20 transition-colors">
                                            <td className="px-4 py-3 font-medium">{new Date(req.leave_date).toLocaleDateString()}</td>
                                            <td className="px-4 py-3">
                                                <span className="font-semibold">{req.leave_type}</span>
                                            </td>
                                            <td className="px-4 py-3">{req.teachers?.name || 'Unknown'}</td>
                                            <td className="px-4 py-3">{getStatusBadge(req.status)}</td>
                                            <td className="px-4 py-3">
                                                {req.teacher_comment ? (
                                                    <span className="text-muted-foreground italic truncate block max-w-[200px]" title={req.teacher_comment}>
                                                        "{req.teacher_comment}"
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground/40">-</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3">
                                                {req.attachment_url ? (
                                                    <a href={req.attachment_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
                                                        <FileText className="w-3 h-3" /> View
                                                    </a>
                                                ) : (
                                                    <span className="text-muted-foreground/40 text-xs">No file</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-right">
                                                <button
                                                    onClick={() => handleDelete(req.id)}
                                                    disabled={req.status === 'Approved' || req.status === 'Rejected'}
                                                    title={req.status === 'Approved' || req.status === 'Rejected' ? "Cannot delete processed requests" : "Delete request"}
                                                    className={`p-1.5 rounded-md transition-colors ${req.status === 'Approved' || req.status === 'Rejected'
                                                            ? 'text-muted-foreground/30 cursor-not-allowed'
                                                            : 'text-red-500/70 hover:text-red-600 hover:bg-red-500/10'
                                                        }`}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default LeaveManagement;
