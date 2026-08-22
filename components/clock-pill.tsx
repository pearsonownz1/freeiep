import { clockTone } from "@/lib/clocks";
import { daysUntil } from "@/lib/ids";
import { CLOCK_LABELS, type Clock } from "@/lib/types";

export function ClockPill({ clock }: { clock: Clock }) {
  const tone = clockTone(clock);
  const days = daysUntil(clock.dueOn);
  const styles =
    tone === "overdue"
      ? "bg-berry-soft text-berry"
      : tone === "due_soon"
        ? "bg-sun-soft text-sun"
        : tone === "done"
          ? "bg-meadow-soft text-meadow"
          : "bg-meadow-soft text-meadow";
  const word =
    tone === "overdue"
      ? "Overdue"
      : tone === "due_soon"
        ? days === 0
          ? "Due today"
          : `Due soon · ${days}d`
        : tone === "done"
          ? "Done"
          : days === 1
            ? "Tomorrow"
            : `${days} days`;
  return (
    <span className={`pill tabular ${styles}`}>
      {CLOCK_LABELS[clock.kind]} · {word}
    </span>
  );
}
