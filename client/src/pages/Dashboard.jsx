import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import { AudioLines, ChevronRight, Clock, ListChecks, Plus } from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import LinkButton from "../components/ui/LinkButton";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { formatDate, greeting, isFinished } from "../utils";

const listVariants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

function Dashboard() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMeetings = async () => {
    try {
      const response = await api.get("/api/meetings");
      setMeetings(response.data);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Could not load your meetings. The server may be waking up, so please try again in a minute."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMeetings();
  }, []);

  // While any meeting is still processing, refresh every 5 seconds
  useEffect(() => {
    const stillWorking = meetings.some((meeting) => !isFinished(meeting.status));
    if (!stillWorking) return;

    const timer = setInterval(loadMeetings, 5000);
    return () => clearInterval(timer);
  }, [meetings]);

  const stats = [
    {
      label: "Total meetings",
      value: meetings.length,
      icon: AudioLines,
      tone: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
    },
    {
      label: "Completed",
      value: meetings.filter((meeting) => meeting.status === "done").length,
      icon: ListChecks,
      tone: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200",
    },
    {
      label: "In progress",
      value: meetings.filter((meeting) => !isFinished(meeting.status)).length,
      icon: Clock,
      tone: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-brand-text">
            {greeting()}
          </p>
          <h1 className="mt-1 text-3xl">
            {user?.name?.split(" ")[0] || "There"}, here are your meetings
          </h1>
        </div>
        <LinkButton to="/app/meetings/new">
          <Plus size={16} /> New meeting
        </LinkButton>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, value, icon: Icon, tone }, index) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.08 }}
            className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm"
          >
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${tone}`}>
              <Icon size={22} />
            </div>
            <div>
              <p className="font-display text-3xl font-extrabold leading-none">{value}</p>
              <p className="mt-1 text-sm text-muted">{label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : meetings.length === 0 ? (
        !error && (
          <EmptyState
            title="No meetings yet"
            message="Upload your first recording and ScribWave will write the transcript, summary and action items."
            action={
              <LinkButton to="/app/meetings/new">Upload your first recording</LinkButton>
            }
          />
        )
      ) : (
        <motion.ul
          variants={listVariants}
          initial="hidden"
          animate="show"
          className="space-y-3"
        >
          {meetings.map((meeting) => (
            <motion.li key={meeting._id} variants={itemVariants} whileHover={{ y: -3 }}>
              <Link
                to={`/app/meetings/${meeting._id}`}
                className="group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 shadow-sm transition-colors hover:border-brand-text/50"
              >
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-brand-text">
                  <AudioLines size={22} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg font-bold">{meeting.title}</p>
                  <p className="truncate text-sm text-muted">
                    {formatDate(meeting.createdAt)}
                  </p>
                </div>
                <StatusBadge status={meeting.status} />
                <ChevronRight
                  size={18}
                  className="hidden text-muted transition-transform group-hover:translate-x-1 sm:block"
                />
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </div>
  );
}

export default Dashboard;