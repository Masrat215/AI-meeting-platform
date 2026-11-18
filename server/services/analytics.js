const DAY = 24 * 60 * 60 * 1000;
const WEEKS = 8;

// The Monday of the week that contains `time`, in the user's own time zone.
// The result is a number (milliseconds) that is used only for comparing weeks.
const weekStartOf = (time, offsetMin) => {
  const local = new Date(time + offsetMin * 60 * 1000);
  const sinceMonday = (local.getUTCDay() + 6) % 7;
  return Date.UTC(
    local.getUTCFullYear(),
    local.getUTCMonth(),
    local.getUTCDate() - sinceMonday
  );
};

const toDateText = (ms) => new Date(ms).toISOString().slice(0, 10);

// Turns the user's meetings and action items into the numbers for the analytics page.
//   meetings:          [{ _id, status, createdAt, durationMs }]
//   summaries:         [{ actionItems: [{ assignee, completed }] }]
//   fallbackDurations: { meetingId: milliseconds } for older meetings without a saved length
//   offsetMin:         the user's time zone, in minutes east of UTC (India is 330)
const buildAnalytics = ({
  meetings,
  summaries,
  fallbackDurations = {},
  offsetMin = 0,
  now = Date.now(),
}) => {
  let done = 0;
  let failed = 0;
  let processing = 0;
  let recordedMs = 0;
  let doneWithLength = 0;
  let doneLengthSum = 0;

  // The last 8 weeks, oldest first, all starting at zero
  const currentWeek = weekStartOf(now, offsetMin);
  const weeks = [];
  const weekIndex = new Map();
  for (let i = WEEKS - 1; i >= 0; i -= 1) {
    const start = currentWeek - i * 7 * DAY;
    weekIndex.set(start, weeks.length);
    weeks.push({ weekStart: toDateText(start), count: 0 });
  }

  for (const meeting of meetings) {
    const length = meeting.durationMs || fallbackDurations[String(meeting._id)] || 0;
    recordedMs += length;

    if (meeting.status === "done") {
      done += 1;
      if (length > 0) {
        doneWithLength += 1;
        doneLengthSum += length;
      }
    } else if (meeting.status === "failed") {
      failed += 1;
    } else {
      processing += 1;
    }

    const index = weekIndex.get(
      weekStartOf(new Date(meeting.createdAt).getTime(), offsetMin)
    );
    if (index !== undefined) weeks[index].count += 1;
  }

  // Action items, grouped by the person they are assigned to
  const people = new Map();
  let tasksDone = 0;
  let tasksOpen = 0;

  for (const summary of summaries) {
    for (const item of summary.actionItems || []) {
      const name = String(item.assignee || "").trim() || "Unassigned";
      const key = name.toLowerCase();
      if (!people.has(key)) people.set(key, { name, done: 0, open: 0 });

      const person = people.get(key);
      if (item.completed) {
        person.done += 1;
        tasksDone += 1;
      } else {
        person.open += 1;
        tasksOpen += 1;
      }
    }
  }

  const topPeople = [...people.values()]
    .sort(
      (a, b) =>
        b.done + b.open - (a.done + a.open) || a.name.localeCompare(b.name)
    )
    .slice(0, 6);

  const tasksTotal = tasksDone + tasksOpen;

  return {
    totals: {
      meetings: meetings.length,
      done,
      failed,
      processing,
      recordedMs,
      averageMs: doneWithLength > 0 ? Math.round(doneLengthSum / doneWithLength) : 0,
    },
    tasks: {
      total: tasksTotal,
      done: tasksDone,
      open: tasksOpen,
      rate: tasksTotal > 0 ? Math.round((tasksDone / tasksTotal) * 100) : 0,
    },
    weeks,
    people: topPeople,
  };
};

module.exports = { buildAnalytics, weekStartOf };
