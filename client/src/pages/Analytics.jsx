import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AudioLines, Clock, ListChecks, TrendingUp, Users } from "lucide-react";
import api from "../api";
import CountUp from "../components/CountUp";
import SectionHeader from "../components/SectionHeader";
import { Donut, PersonBars, WeeklyBars } from "../components/charts";
import EmptyState from "../components/ui/EmptyState";
import LinkButton from "../components/ui/LinkButton";
import Skeleton from "../components/ui/Skeleton";
import { formatDuration } from "../utils";

function Analytics() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await api.get("/api/analytics", {
          // Lets the server group meetings into weeks in the user's own time zone
          params: { offset: -new Date().getTimezoneOffset() },
        });
        if (!cancelled) setData(response.data);
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.error ||
              "Could not load the analytics. The server may be waking up, so please try again in a minute."
          );
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const cards = data
    ? [
        {
          label: "Total meetings",
          value: data.totals.meetings,
          icon: AudioLines,
          tone: "bg-blue-500/15 text-blue-600 dark:text-blue-300",
        },
        {
          label: "Recorded time",
          value: data.totals.recordedMs,
          format: formatDuration,
          icon: Clock,
          tone: "bg-violet-500/15 text-violet-600 dark:text-violet-300",
        },
        {
          label: "Action items",
          value: data.tasks.total,
          icon: ListChecks,
          tone: "bg-amber-500/15 text-amber-600 dark:text-amber-300",
        },
        {
          label: "Tasks completed",
          value: data.tasks.rate,
          format: (number) => `${Math.round(number)}%`,
          icon: TrendingUp,
          tone: "bg-teal-500/15 text-teal-600 dark:text-teal-300",
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl">Analytics</h1>
        <p className="mt-1 text-muted">How your meetings and tasks are going.</p>
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      )}

      {!data && !error && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {data && data.totals.meetings === 0 && (
        <EmptyState
          title="No data yet"
          message="Upload a meeting and your numbers and charts will appear here."
          action={<LinkButton to="/app/meetings/new">Upload a meeting</LinkButton>}
        />
      )}

      {data && data.totals.meetings > 0 && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {cards.map(({ label, value, format, icon: Icon, tone }, index) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-5 shadow-sm"
              >
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${tone}`}
                >
                  <Icon size={22} />
                </div>
                <div className="min-w-0">
                  <p className="font-display text-2xl font-extrabold leading-none">
                    <CountUp value={value} format={format} />
                  </p>
                  <p className="mt-1 truncate text-sm text-muted">{label}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
            <SectionHeader
              icon={TrendingUp}
              title="Meetings per week"
              subtitle="The last 8 weeks"
              tone="blue"
            />
            <WeeklyBars weeks={data.weeks} />
            {data.totals.averageMs > 0 && (
              <p className="mt-5 text-sm text-muted">
                Your average meeting is{" "}
                <span className="font-semibold text-ink">
                  {formatDuration(data.totals.averageMs)}
                </span>{" "}
                long.
              </p>
            )}
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
              <SectionHeader
                icon={ListChecks}
                title="Tasks: done and open"
                subtitle="All action items"
                tone="teal"
              />
              {data.tasks.total === 0 ? (
                <p className="rounded-xl bg-surface-2 px-4 py-6 text-center text-sm text-muted">
                  No action items yet.
                </p>
              ) : (
                <Donut done={data.tasks.done} open={data.tasks.open} />
              )}
            </section>

            <section className="rounded-2xl border border-line bg-surface p-6 shadow-sm">
              <SectionHeader
                icon={Users}
                title="Tasks per person"
                subtitle="Who has the most work"
                tone="violet"
              />
              {data.people.length === 0 ? (
                <p className="rounded-xl bg-surface-2 px-4 py-6 text-center text-sm text-muted">
                  No action items yet.
                </p>
              ) : (
                <PersonBars people={data.people} />
              )}
            </section>
          </div>
        </>
      )}
    </div>
  );
}

export default Analytics;
