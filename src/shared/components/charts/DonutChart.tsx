"use client";

import { ReactNode } from "react";

/**
 * A donut chart drawn with SVG circles.
 * Every slice is one circle whose visible part is set with stroke-dasharray.
 */
export interface DonutSlice {
  label: string;
  value: number;
  /** A CSS colour. Use design tokens, for example "var(--primary)". */
  color: string;
}

const SIZE = 160;
const STROKE = 20;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function DonutChart({
  slices,
  centerTop,
  centerBottom,
  ariaLabel,
}: {
  slices: DonutSlice[];
  /** Large text in the middle, for example "68%". */
  centerTop?: ReactNode;
  /** Small text under it, for example "collected". */
  centerBottom?: ReactNode;
  ariaLabel: string;
}) {
  const total = slices.reduce((sum, slice) => sum + slice.value, 0);

  // Work out where each slice starts, as a length along the circle.
  let used = 0;
  const arcs = slices.map((slice) => {
    const length = total ? (slice.value / total) * CIRCUMFERENCE : 0;
    const arc = { ...slice, length, offset: used };
    used += length;
    return arc;
  });

  return (
    <div className="donut" role="img" aria-label={ariaLabel}>
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE}>
        {/* The grey ring behind the slices */}
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          stroke="var(--line)"
          strokeWidth={STROKE}
        />
        {arcs.map((arc) => (
          <circle
            key={arc.label}
            cx={SIZE / 2}
            cy={SIZE / 2}
            r={RADIUS}
            fill="none"
            stroke={arc.color}
            strokeWidth={STROKE}
            strokeDasharray={`${arc.length} ${CIRCUMFERENCE - arc.length}`}
            strokeDashoffset={-arc.offset}
            transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
          />
        ))}
      </svg>
      <div className="donut-center">
        {centerTop && <strong>{centerTop}</strong>}
        {centerBottom && <small>{centerBottom}</small>}
      </div>
    </div>
  );
}
