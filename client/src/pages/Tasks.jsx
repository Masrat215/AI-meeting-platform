import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import api from "../api";
import ActionItemCard from "../components/ActionItemCard";
import ProgressBar from "../components/ProgressBar";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import LinkButton from "../components/ui/LinkButton";

const TABS = [
  { key: "open", label: "Open" },
  { key: "done", label: "Done" },
  { key: "all", label: "All" },
];

const EMPTY_TEXT = {
  open: {
    title: "Nothing left to do",
    message: "Every action item is ticked off. Nice work.",
  },
  done: {
    title: "No finished tasks yet",
    message: "Tick an action item and it will show up here.",
  },
};

// Open tasks first, then the newest meeting first
const openFirst = (a, b) => {
  if (a.completed !== b.completed) return a.completed ? 1 : -1;
  return new Date(b.meetingDate) - new Date(a.meetingDate);
};

function Tasks() {
  const [tasks, setTasks] = useState(null);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("open");
  const pending = useRef(new Set());

  useEffect(() => {
    const load = async () => {
      try {
        const response = await api.get("/api/tasks", {
          params: { status: "all" },
        });
        setTasks(response.data.tasks);
      } catch (err) {
        setError(
          err.response?.data?.error ||
            "Could not load your tasks. The server may be waking up, so please try again in a minute."
        );
      }
    };
    load();
  }, []);

  const toggleTask = async (task) => {
    if (pending.current.has(task.id)) return;
    pending.current.add(task.id);

    const next = !task.completed;
    const setCompleted = (value) =>
      setTasks((current) =>
        current
          .map((t) => (t.id === task.id ? { ...t, completed: value } : t))
          .sort(openFirst)
      );

    // Show the change at once, and undo it if the server says no
    setCompleted(next);
    try {
      await api.patch(`/api/meetings/${task.meetingId}/actions/${task.id}`, {
        completed: next,
      });
    } catch (err) {
      setCompleted(!next);
      toast.error(err.response?.data?.error || "Could not update this task.");
    } finally {
      pending.current.delete(task.id);
    }
  };

  const total = tasks ? tasks.length : 0;
  const doneCount = tasks ? tasks.filter((t) => t.completed).length : 0;
  const counts = { open: total - doneCount, done: doneCount, all: total };
  const visible = tasks
    ? tasks.filter((t) =>
        tab === "all" ? true : tab === "done" ? t.completed : !t.completed
      )
    : [];

  return (
    <div>
      <h1 className="text-3xl">Tasks</h1>
      <p className="mt-1 text-muted">
        Every action item from all of your meetings, in one place.
      </p>

      {error && (
        <p className="mt-6 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      {!tasks && !error && (
        <div className="mt-6 space-y-3">
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {tasks && (
        <div className="mt-6 space-y-5">
          <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <ProgressBar done={doneCount} total={total} />

            <div className="mb-5 inline-flex rounded-xl bg-surface-2 p-1">
              {TABS.map(({ key, label }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`relative rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors ${
                    tab === key ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {tab === key && (
                    <motion.span
                      layoutId="task-tab"
                      className="absolute inset-0 rounded-lg bg-surface shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">
                    {label}
                    <span className="ml-1.5 text-xs opacity-70">{counts[key]}</span>
                  </span>
                </button>
              ))}
            </div>

            {visible.length === 0 ? (
              total === 0 ? (
                <EmptyState
                  title="No tasks yet"
                  message="Upload a meeting and ScribWave will find the action items for you."
                  action={
                    <LinkButton to="/app/meetings/new">Upload a meeting</LinkButton>
                  }
                />
              ) : (
                <EmptyState
                  title={EMPTY_TEXT[tab].title}
                  message={EMPTY_TEXT[tab].message}
                />
              )
            ) : (
              <ul key={tab} className="space-y-3">
                <AnimatePresence>
                  {visible.map((task, index) => (
                    <ActionItemCard
                      key={task.id}
                      item={task}
                      index={index}
                      meeting={{ id: task.meetingId, title: task.meetingTitle }}
                      onToggle={() => toggleTask(task)}
                    />
                  ))}
                </AnimatePresence>
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}

export default Tasks;
