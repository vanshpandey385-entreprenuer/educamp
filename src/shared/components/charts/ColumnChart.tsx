"use client";

/**
 * A simple column (vertical bar) chart built with plain HTML and CSS.
 * No chart library is needed.
 *
 * Each item has a label (under the column) and a value. A value of `null` means
 * "no data for this item"; the chart then draws a faint stub instead of a column.
 */
export interface ColumnItem {
  label: string;
  /** Small text under the label, for example the date. */
  sub?: string;
  value: number | null;
  /** Text shown above the column. Defaults to the value. */
  display?: string;
}

export function ColumnChart({
  items,
  max = 100,
  height = 180,
  ariaLabel,
}: {
  items: ColumnItem[];
  /** The value that fills the full height of the chart. */
  max?: number;
  height?: number;
  ariaLabel: string;
}) {
  return (
    <div className="column-chart" role="img" aria-label={ariaLabel}>
      {items.map((item) => {
        const hasValue = item.value !== null;
        const percent = hasValue ? Math.max(0, Math.min(100, ((item.value as number) / max) * 100)) : 0;
        const shownText = hasValue ? (item.display ?? String(item.value)) : "—";

        return (
          <div key={`${item.label}-${item.sub ?? ""}`} className="column-chart-item">
            <span className="column-chart-value">{shownText}</span>
            <div className="column-chart-track" style={{ height }}>
              <span
                className={hasValue ? "column-chart-bar" : "column-chart-bar is-empty"}
                style={{ height: hasValue ? `${Math.max(percent, 3)}%` : "3%" }}
              />
            </div>
            <span className="column-chart-label">{item.label}</span>
            {item.sub && <span className="column-chart-sub">{item.sub}</span>}
          </div>
        );
      })}
    </div>
  );
}
