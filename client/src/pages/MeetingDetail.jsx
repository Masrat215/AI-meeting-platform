import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  CalendarClock,
  FileAudio,
  Info,
  ListChecks,
  MessageSquare,
  RotateCcw,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";
import api from "../api";
import Button from "../components/ui/Button";
import Skeleton from "../components/ui/Skeleton";
import ConfirmDialog from "../components/ConfirmDialog";
import PipelineStepper from "../components/PipelineStepper";
import SectionHeader from "../components/SectionHeader";
import SpeakerChips from "../components/SpeakerChips";
import StatusBadge from "../components/StatusBadge";
import {
  formatDate,
  formatTime,
  initialsOf,
  isFinished,
  splitSentences,
} from "../utils";
import { speakerColor, speakerDisplayName } from "../speakers";

const STUCK_AFTER_MS = 10 * 60 * 1000;
const PREVIEW_COUNT = 10;

function MeetingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [showAll, setShowAll] = useState(false);

  const loadMeeting = async () => {
    try {
      const response = await api.get(`/api/meetings/${id}`);
      setData(response.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || "Could not load this meeting.");
    }
  };

  useEffect(() => {
    loadMeeting();
  }, [id]);

  // While it is still processing, check again every 3 seconds
  useEffect(() => {
    if (!data || isFinished(data.meeting.status)) return;

    const timer = setInterval(loadMeeting, 3000);
    return () => clearInterval(timer);
  }, [data]);

  const handleRetry = async () => {
    try {
      setBusy(true);
      await api.post(`/api/meetings/${id}/retry`);
      toast.success("Retry started");
      await loadMeeting();
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not retry this meeting.");
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    try {
      setBusy(true);
      await api.delete(`/api/meetings/${id}`);
      toast.success("Meeting deleted");
      navigate("/app");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not delete this meeting.");
      setBusy(false);
      setConfirmDelete(false);
    }
  };

  const saveSpeakerName = async (label, name) => {
    try {
      const response = await api.patch(`/api/meetings/${id}/speakers`, {
        label,
        name,
      });
      setData((current) => ({ ...current, summary: response.data.summary }));
      toast.success(name ? "Speaker name saved" : "Speaker name removed");
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not save the name");
    }
  };

  if (!data) {
    if (error) {
      return (
        <div className="space-y-4">
          <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
            {error}
          </p>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
          >
            <ArrowLeft size={16} /> Back to dashboard
          </Link>
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  const { meeting, transcript, summary } = data;
  const speakers = summary?.speakers || [];
  const segments = transcript?.speakerSegments || [];
  const labels = [...new Set(segments.map((segment) => segment.speaker))].sort();
  const sentences = splitSentences(summary?.summaryText);
  const working = !isFinished(meeting.status);
  const stuck =
    working && Date.now() - new Date(meeting.updatedAt).getTime() > STUCK_AFTER_MS;
  const visibleSegments = showAll ? segments : segments.slice(0, PREVIEW_COUNT);

  return (
    <div className="space-y-6">
      <Link
        to="/app"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-ink"
      >
        <ArrowLeft size={16} /> Back to dashboard
      </Link>

      {/* Title and actions */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="break-words text-3xl">{meeting.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock size={15} /> {formatDate(meeting.createdAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <FileAudio size={15} /> {meeting.originalFileName}
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={meeting.status} />
          {meeting.status === "failed" && (
            <Button onClick={handleRetry} disabled={busy}>
              <RotateCcw size={15} /> Retry
            </Button>
          )}
          <Button
            variant="danger"
            onClick={() => setConfirmDelete(true)}
            disabled={busy}
          >
            <Trash2 size={15} /> Delete
          </Button>
        </div>
      </div>

      {/* Problems */}
      {meeting.status === "failed" && (
        <div className="flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          <Info size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Something went wrong</p>
            <p className="mt-0.5">
              {meeting.errorMessage || "This meeting could not be processed."}
            </p>
          </div>
        </div>
      )}

      {stuck && (
        <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          <Info size={18} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">This is taking longer than expected</p>
            <p className="mt-0.5">
              The server may have restarted while working on it. You can delete this
              meeting and upload the recording again.
            </p>
          </div>
        </div>
      )}

      {/* Progress */}
      {working && (
        <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
          <h2 className="mb-5 text-lg">Processing your recording</h2>
          <PipelineStepper status={meeting.status} />
          <p className="mt-5 text-sm text-muted">
            This page updates by itself. It usually takes a minute or two.
          </p>
        </section>
      )}

      {/* Summary */}
      {summary && (
        <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          <div className="h-1 bg-[linear-gradient(90deg,#1d4ed8,#22d3ee)]" />
          <div className="p-6">
            <SectionHeader
              icon={Sparkles}
              title="Summary"
              subtitle="What was discussed"
              tone="blue"
            />
            <ul className="space-y-3">
              {sentences.map((sentence, index) => (
                <motion.li
                  key={index}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="flex gap-3"
                >
                  <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-wave" />
                  <p
                    className={
                      index === 0
                        ? "text-lg font-semibold leading-snug"
                        : "leading-relaxed text-ink/90"
                    }
                  >
                    {sentence}
                  </p>
                </motion.li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Action items */}
      {summary && (
        <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          <div className="h-1 bg-[linear-gradient(90deg,#0d9488,#22d3ee)]" />
          <div className="p-6">
            <SectionHeader
              icon={ListChecks}
              title="Action items"
              subtitle="What needs to be done"
              tone="teal"
              count={summary.actionItems.length}
            />
            {summary.actionItems.length === 0 ? (
              <p className="rounded-xl bg-surface-2 px-4 py-6 text-center text-sm text-muted">
                No action items were found in this meeting.
              </p>
            ) : (
              <ul className="space-y-3">
                {summary.actionItems.map((item, index) => (
                  <motion.li
                    key={item._id || index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.07 }}
                    className="flex flex-col gap-3 rounded-xl border border-line bg-canvas p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-teal-100 text-xs font-bold text-teal-700 dark:bg-teal-500/20 dark:text-teal-200">
                        {index + 1}
                      </span>
                      <p className="font-medium leading-snug">{item.task}</p>
                    </div>
                    <div className="flex flex-wrap gap-2 sm:justify-end">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          item.assignee === "Unassigned"
                            ? "bg-surface-2 text-muted"
                            : "bg-blue-100 text-blue-800 dark:bg-blue-500/20 dark:text-blue-200"
                        }`}
                      >
                        <User size={13} /> {item.assignee}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                          item.deadline === "Not specified"
                            ? "bg-surface-2 text-muted"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200"
                        }`}
                      >
                        <CalendarClock size={13} /> {item.deadline}
                      </span>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {/* Transcript */}
      {transcript && (
        <section className="overflow-hidden rounded-2xl border border-line bg-surface shadow-sm">
          <div className="h-1 bg-[linear-gradient(90deg,#7c3aed,#22d3ee)]" />
          <div className="p-6">
            <SectionHeader
              icon={MessageSquare}
              title="Transcript"
              subtitle="Who said what"
              tone="violet"
              count={segments.length || undefined}
            />

            {labels.length > 0 && (
              <div className="mb-6">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted">
                  Speakers
                </p>
                <SpeakerChips
                  labels={labels}
                  speakers={speakers}
                  canEdit={Boolean(summary)}
                  onSave={saveSpeakerName}
                />
                {summary && (
                  <p className="mt-2 text-xs text-muted">
                    Click the pencil to give a speaker their real name.
                  </p>
                )}
              </div>
            )}

            {segments.length > 0 ? (
              <div className="space-y-4">
                {visibleSegments.map((segment, index) => {
                  const color = speakerColor(segment.speaker);
                  const known = speakers.find(
                    (speaker) => speaker.label === segment.speaker
                  )?.name;

                  return (
                    <motion.div
                      key={segment._id || index}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(index, 8) * 0.04 }}
                      className="flex gap-3"
                    >
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${color.dot}`}
                      >
                        {known ? initialsOf(known) : segment.speaker}
                      </div>
                      <div
                        className={`min-w-0 flex-1 rounded-2xl rounded-tl-sm px-4 py-3 ${color.bubble}`}
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-bold">
                            {speakerDisplayName(segment.speaker, speakers)}
                          </span>
                          <span className="text-muted">{formatTime(segment.start)}</span>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed">{segment.text}</p>
                      </div>
                    </motion.div>
                  );
                })}

                {segments.length > PREVIEW_COUNT && (
                  <div className="pt-2 text-center">
                    <Button variant="secondary" onClick={() => setShowAll((open) => !open)}>
                      {showAll
                        ? "Show less"
                        : `Show the full transcript (${segments.length - PREVIEW_COUNT} more)`}
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <p className="rounded-xl bg-surface-2 px-4 py-6 text-center text-sm text-muted">
                {transcript.fullText || "No speech was detected."}
              </p>
            )}
          </div>
        </section>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Delete this meeting?"
        message="The transcript, summary and action items will be removed. This cannot be undone."
        confirmLabel="Delete"
        danger
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
}

export default MeetingDetail;