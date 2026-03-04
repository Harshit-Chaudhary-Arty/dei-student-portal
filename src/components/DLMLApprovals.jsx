import React, { useState, useEffect } from 'react';
import { leaveService } from '../services/leaveService';
import { Button } from '@/components/ui/button';
import { CheckCircle2, AlertCircle, Eye, Clock, FileText, Send } from 'lucide-react';

const DLMLApprovals = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actioningId, setActioningId] = useState(null);

    // Track comments separately for each request mapped by request ID
    const [comments, setComments] = useState({});

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setIsLoading(true);
            const fetchedRequests = await leaveService.getAllLeaveRequests();
            setRequests(fetchedRequests);

            // Initialize comments state
            const initialComments = {};
            fetchedRequests.forEach(r => {
                initialComments[r.id] = r.teacher_comment || '';
            });
            setComments(initialComments);
        } catch (err) {
            console.error("Failed to load requests:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusUpdate = async (id, status) => {
        try {
            setActioningId(id);
            const commentToSave = comments[id] || '';

            await leaveService.updateLeaveRequestStatus(id, status, commentToSave);

            // Update local state instead of doing full reload for better feels
            setRequests(prev => prev.map(r =>
                r.id === id ? { ...r, status: status, teacher_comment: commentToSave } : r
            ));

        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Failed to update status. Please try again.");
        } finally {
            setActioningId(null);
        }
    };

    const handleCommentChange = (id, val) => {
        setComments(prev => ({ ...prev, [id]: val }));
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
        return <div className="p-8 text-center text-muted-foreground animate-pulse">Loading Leave Approvals...</div>;
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">DL/ML Approvals (Teacher Mode)</h2>
                <p className="text-muted-foreground mt-1">Review and action student DL and ML requests.</p>
            </div>

            {requests.length === 0 ? (
                <div className="bg-muted/20 border border-border/40 rounded-xl p-12 text-center text-muted-foreground text-sm flex flex-col items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 opacity-20 mb-3" />
                    No pending requests at the moment.
                </div>
            ) : (
                <div className="grid gap-4">
                    {requests.map(req => (
                        <div key={req.id} className="bg-card border border-border/40 rounded-xl p-5 shadow-sm hover:shadow transition-all relative overflow-hidden group">
                            {/* Colored left border based on status */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 ${req.status === 'Approved' ? 'bg-emerald-500' : req.status === 'Rejected' ? 'bg-red-500' : req.status === 'Review' ? 'bg-blue-500' : 'bg-yellow-500'}`} />

                            <div className="flex flex-col md:flex-row gap-6">

                                {/* Info Section */}
                                <div className="flex-1 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <span className="font-semibold text-lg">{req.student_name}</span>
                                            <span className="text-sm text-muted-foreground bg-secondary px-2 py-0.5 rounded">Roll: {req.roll_no}</span>
                                        </div>
                                        <div>{getStatusBadge(req.status)}</div>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-secondary/30 p-3 rounded-lg">
                                        <div>
                                            <span className="text-muted-foreground block text-xs mb-0.5">Type</span>
                                            <span className="font-medium">{req.leave_type}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block text-xs mb-0.5">Date</span>
                                            <span className="font-medium">{new Date(req.leave_date).toLocaleDateString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block text-xs mb-0.5">Submitted</span>
                                            <span className="font-medium">{new Date(req.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground block text-xs mb-0.5">Attachment</span>
                                            {req.attachment_url ? (
                                                <a href={req.attachment_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium flex items-center gap-1">
                                                    <FileText className="w-3.5 h-3.5" /> View Proof
                                                </a>
                                            ) : (
                                                <span className="text-muted-foreground/60 italic">None</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-2 text-sm">
                                        <span className="font-medium text-muted-foreground block mb-1">Reason:</span>
                                        <p className="bg-background border border-border/40 p-3 rounded-md text-foreground/90 whitespace-pre-wrap">
                                            {req.reason}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions Section */}
                                <div className="md:w-72 bg-secondary/10 p-4 rounded-lg border border-border/50 flex flex-col gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-muted-foreground flex items-center justify-between">
                                            Teacher Comment
                                            <span className="opacity-50 text-[10px]">(optional)</span>
                                        </label>
                                        <textarea
                                            className="flex w-full rounded-md border border-input bg-background/50 px-3 py-2 text-sm min-h-[80px] focus:bg-background transition-colors"
                                            placeholder="Add a remark before actioning..."
                                            value={comments[req.id] || ''}
                                            onChange={(e) => handleCommentChange(req.id, e.target.value)}
                                            disabled={actioningId === req.id}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mt-auto">
                                        {req.status !== 'Approved' && (
                                            <Button
                                                size="sm"
                                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                                disabled={actioningId === req.id}
                                                onClick={() => handleStatusUpdate(req.id, 'Approved')}
                                            >
                                                {actioningId === req.id ? '...' : 'Approve'}
                                            </Button>
                                        )}

                                        {req.status !== 'Rejected' && (
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                className="w-full"
                                                disabled={actioningId === req.id}
                                                onClick={() => handleStatusUpdate(req.id, 'Rejected')}
                                            >
                                                {actioningId === req.id ? '...' : 'Reject'}
                                            </Button>
                                        )}

                                        {req.status !== 'Review' && (
                                            <Button
                                                size="sm"
                                                variant="secondary"
                                                className="w-full col-span-full border-border/60 hover:bg-secondary/80"
                                                disabled={actioningId === req.id}
                                                onClick={() => handleStatusUpdate(req.id, 'Review')}
                                            >
                                                {actioningId === req.id ? '...' : 'Need Review'}
                                            </Button>
                                        )}
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DLMLApprovals;
