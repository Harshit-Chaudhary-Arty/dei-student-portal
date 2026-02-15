import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createAnnouncement } from '../services/announcements';
import { AlertCircle } from 'lucide-react';

const LABELS = [
  { name: 'DHA', color: 'blue' },
  { name: 'CA', color: 'amber' },
  { name: 'AA', color: 'emerald' },
  { name: 'Notice', color: 'purple' },
];

const labelStyles = {
  blue: {
    active: 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/40',
    inactive: 'bg-secondary/30 text-muted-foreground hover:bg-blue-500/10 hover:text-blue-400',
  },
  amber: {
    active: 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40',
    inactive: 'bg-secondary/30 text-muted-foreground hover:bg-amber-500/10 hover:text-amber-400',
  },
  emerald: {
    active: 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40',
    inactive: 'bg-secondary/30 text-muted-foreground hover:bg-emerald-500/10 hover:text-emerald-400',
  },
  purple: {
    active: 'bg-purple-500/20 text-purple-400 ring-1 ring-purple-500/40',
    inactive: 'bg-secondary/30 text-muted-foreground hover:bg-purple-500/10 hover:text-purple-400',
  },
};

const MakeAnnouncementPage = () => {
  const { student } = useOutletContext();
  const isAdmin = student?.admin === true;
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedLabel, setSelectedLabel] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!title.trim() || !description.trim() || !selectedLabel) return;

    if (!isAdmin) {
      setSuccessMsg('You can\'t make announcements. Please contact your class CR or administrator to enable announcement permissions.');
      setTimeout(() => setSuccessMsg(''), 4000);
      return;
    }

    setSubmitting(true);
    const { error } = await createAnnouncement(
      title.trim(),
      description.trim(),
      selectedLabel
    );
    setSubmitting(false);

    if (error) {
      setSuccessMsg('Failed to post announcement.');
      setTimeout(() => setSuccessMsg(''), 3000);
      return;
    }

    setTitle('');
    setDescription('');
    setSelectedLabel(null);
    setSuccessMsg('Announcement posted successfully!');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Make Announcement
        </h1>
        <p className="text-sm text-muted-foreground/80">
          Create a new announcement for students
        </p>
      </div>

      {/* Form Container */}
      <div className="max-w-2xl space-y-8">

        {/* Title */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/90">Title</label>
          <Input
            type="text"
            placeholder="Enter announcement title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="bg-secondary/20 border-border/30 focus:border-primary/50 h-11"
          />
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground/90">Description</label>
          <textarea
            placeholder="Write announcement details"
            rows={5}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex w-full rounded-md border border-border/30 bg-secondary/20 px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-colors resize-none"
          />
        </div>

        {/* Label Selector */}
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground/90">Label</label>
          <div className="flex flex-wrap gap-2">
            {LABELS.map((label) => {
              const isActive = selectedLabel === label.name;
              const styles = labelStyles[label.color];
              return (
                <button
                  key={label.name}
                  type="button"
                  onClick={() => setSelectedLabel(label.name)}
                  className={`
                    px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 cursor-pointer
                    ${isActive ? styles.active : styles.inactive}
                  `}
                >
                  {label.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Submit Button + Success Message */}
        <div className="flex items-center justify-end gap-4 pt-2">
          {successMsg && (
            <p className={`text-sm font-medium animate-in fade-in duration-300 ${successMsg.includes('can\'t') ? 'text-amber-400' : successMsg.includes('Failed') ? 'text-red-400' : 'text-emerald-400'}`}>
              {successMsg}
            </p>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!title.trim() || !description.trim() || !selectedLabel || submitting}
            className="px-6 h-10 text-sm font-medium"
          >
            {submitting ? 'Posting...' : 'Post Announcement'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MakeAnnouncementPage;
