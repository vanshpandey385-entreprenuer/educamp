"use client";

/**
 * One horizontal bar split into coloured parts, with a legend underneath.
 * Used for "how is this group divided", for example staff present / absent / on leave.
 */
export interface StackedPart {
  label: string;
  value: number;
  /** A CSS colour. Use design tokens, for example "var(--primary)". */
  color: string;
}

export function StackedBar({ parts, ariaLabel }: { parts: StackedPart[]; ariaLabel: string }) {
  const total = parts.reduce((sum, part) => sum + part.value, 0);

  return (
    <div>
      <div className="stacked-bar" role="img" aria-label={ariaLabel}>
        {parts
          .filter((part) => part.value > 0)
          .map((part) => (
            <span
              key={part.label}
              title={`${part.label}: ${part.value}`}
              style={{ width: `${(part.value / total) * 100}%`, background: part.color }}
            />
          ))}
      </div>
      <ChartLegend items={parts.map((p) => ({ label: p.label, value: p.value, color: p.color }))} />
    </div>
  );
}

/** A list of coloured dots with a label and a number. Also used next to the donut chart. */
export function ChartLegend({
  items,
}: {
  items: { label: string; value: string | number; color: string }[];
}) {
  return (
    <ul className="chart-legend">
      {items.map((item) => (
        <li key={item.label}>
          <i style={{ background: item.color }} />
          <span>{item.label}</span>
          <b>{item.value}</b>
        </li>
      ))}
    </ul>
  );
}
