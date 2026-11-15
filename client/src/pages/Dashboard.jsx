import { useEffect, useState } from "react";
import { Link } from "react-router";
import { motion } from "motion/react";
import {
  AudioLines,
  ChevronRight,
  Clock,
  ListChecks,
  Plus,
  Search,
  X,
} from "lucide-react";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import StatusBadge from "../components/StatusBadge";
import Button from "../components/ui/Button";
import LinkButton from "../components/ui/LinkButton";
import Skeleton from "../components/ui/Skeleton";
import EmptyState from "../components/ui/EmptyState";
import { formatDate, greeting, isFinished } from "../utils";

const PAGE_SIZE = 10;

const listVariants = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const itemVariants = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } };

const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "title", label: "Title A to Z" },
];

const FIELD =
  "rounded-xl border border-line bg-surface px-3 py-2.5 text-sm text-ink outline-none transition-colors focus:border-brand-text focus:ring-2 focus:ring-brand-text/20 dark:[color-scheme:dark]";

// "2026-11-05" -> the very start / very end of that day on this computer
const startOfDay = (day) => (day ? new Date(`${day}T00:00:00`).toISOString() : undefined);
const endOfDay = (day) => (day ? new Date(`${day}T23:59:59.999`).toISOString() : undefined);

function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshTick, setRefreshTick] = useState(0);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [limit, setLimit] = useState(PAGE_SIZE);

  // Wait until the user stops typing before searching
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setLimit(PAGE_SIZE);
    }, 350);
    return () => clearTimeout(timer);
  }, [search]);

  // Load the meetings again whenever the search, a filter or the page size changes
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await api.get("/api/meetings", {
          params: {
            q: debouncedSearch || undefined,
            status: status === "all" ? undefined : status,
            sort,
            limit,
            from: startOfDay(from),
            to: endOfDay(to),
          },
        });
        if (cancelled) return;
        setData(response.data);
        setError("");
      } catch (err) {
        if (cancelled) return;
        setError(
          err.response?.data?.error ||
            "Could not load your meetings. The server may be waking up, so please try again in a minute."
        );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [debouncedSearch, status, sort, from, to, limit, refreshTick]);

  // While any meeting is still processing, refresh every 5 seconds
  useEffect(() => {
    if (!data || !data.meetings.some((meeting) => !isFinished(meeting.status))) return;

    const timer = setInterval(() => setRefreshTick((tick) => tick + 1), 5000);
    return () => clearInterval(timer);
  }, [data]);

  // Changing a filter always starts again from the first page
  const changeFilter = (setter) => (value) => {
    setter(value);
    setLimit(PAGE_SIZE);
  };

  const filtersActive = Boolean(debouncedSearch || status !== "all" || from || to);

  const clearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setStatus("all");
    setFrom("");
    setTo("");
    setLimit(PAGE_SIZE);
  };

  const meetings = data?.meetings || [];
  const stats = data?.stats || { total: 0, done: 0, processing: 0, failed: 0 };

  const statCards = [
    {
      label: "Total meetings",
      value: stats.total,
      icon: AudioLines,
      tone: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200",
    },
    {
      label: "Completed",
      value: stats.done,
      icon: ListChecks,
      tone: "bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-200",
    },
    {
      label: "In progress",
      value: stats.processing,
      icon: Clock,
      tone: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-200",
    },
  ];

  const chips = [
    { key: "all", label: "All", count: stats.total },
    { key: "done", label: "Done", count: stats.done },
    { key: "processing", label: "In progress", count: stats.processing },
    { key: "failed", label: "Failed", count: stats.failed },
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
        {statCards.map(({ label, value, icon: Icon, tone }, index) => (
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

      {/* Search and filters (shown once the user has at least one meeting) */}
      {stats.total > 0 && (
        <section className="space-y-4 rounded-2xl border border-line bg-surface p-4 shadow-sm">
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted"
            />
            <input
              type="search"
              aria-label="Search meetings"
              placeholder="Search by title or file name"
              value={search}
              maxLength={100}
              onChange={(event) => setSearch(event.target.value)}
              className={`${FIELD} w-full pl-10 pr-10 [&::-webkit-search-cancel-button]:hidden`}
            />
            {search && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted hover:bg-surface-2 hover:text-ink"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="inline-flex flex-wrap rounded-xl bg-surface-2 p-1">
              {chips.map(({ key, label, count }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => changeFilter(setStatus)(key)}
                  className={`relative rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                    status === key ? "text-ink" : "text-muted hover:text-ink"
                  }`}
                >
                  {status === key && (
                    <motion.span
                      layoutId="status-chip"
                      className="absolute inset-0 rounded-lg bg-surface shadow-sm"
                      transition={{ type: "spring", stiffness: 400, damping: 32 }}
                    />
                  )}
                  <span className="relative">
                    {label}
                    <span className="ml-1.5 text-xs opacity-70">{count}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 text-sm">
              <label htmlFor="date-from" className="font-medium text-muted">
                From
              </label>
              <input
                id="date-from"
                type="date"
                value={from}
                max={to || undefined}
                onChange={(event) => changeFilter(setFrom)(event.target.value)}
                className={FIELD}
              />
              <label htmlFor="date-to" className="font-medium text-muted">
                To
              </label>
              <input
                id="date-to"
                type="date"
                value={to}
                min={from || undefined}
                onChange={(event) => changeFilter(setTo)(event.target.value)}
                className={FIELD}
              />
            </div>

            <div className="flex items-center gap-2 text-sm sm:ml-auto">
              <label htmlFor="sort" className="font-medium text-muted">
                Sort
              </label>
              <select
                id="sort"
                value={sort}
                onChange={(event) => changeFilter(setSort)(event.target.value)}
                className={FIELD}
              >
                {SORTS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {filtersActive && (
            <div className="flex items-center justify-between gap-3 text-sm">
              <p className="text-muted">
                Showing {meetings.length} of {data?.total ?? 0} matching meetings
              </p>
              <button
                type="button"
                onClick={clearFilters}
                className="font-semibold text-brand-text hover:underline"
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      )}

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : stats.total === 0 ? (
        !error && (
          <EmptyState
            title="No meetings yet"
            message="Upload your first recording and ScribWave will write the transcript, summary and action items."
            action={
              <LinkButton to="/app/meetings/new">Upload your first recording</LinkButton>
            }
          />
        )
      ) : meetings.length === 0 ? (
        !error && (
          <EmptyState
            title="No meetings match"
            message="Try a different word, or remove a filter to see more of your meetings."
            action={
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            }
          />
        )
      ) : (
        <>
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

          {data?.hasMore && (
            <div className="text-center">
              <Button
                variant="secondary"
                onClick={() => setLimit((current) => current + PAGE_SIZE)}
              >
                Load more ({data.total - meetings.length} more)
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Dashboard;
