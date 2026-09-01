"use client";

import { useRef, useState } from "react";

export const PATTERN_POSITIONS: [number, number][] = [
  [0, 0], [1, 0], [2, 0],
  [0, 1], [1, 1], [2, 1],
  [0, 2], [1, 2], [2, 2],
];

export const PATTERN_SIZE = 240;
const PATTERN_PAD = 40;
const PATTERN_STEP = (PATTERN_SIZE - PATTERN_PAD * 2) / 2;
const HIT_RADIUS = 26;

export function patternDotCenter(i: number) {
  const [cx, cy] = PATTERN_POSITIONS[i];
  return { x: PATTERN_PAD + cx * PATTERN_STEP, y: PATTERN_PAD + cy * PATTERN_STEP };
}

const POSITIONS = PATTERN_POSITIONS;
const SIZE = PATTERN_SIZE;
const dotCenter = patternDotCenter;

const PATTERN_COLOR_START: [number, number, number] = [147, 197, 253]; // azul claro (início)
const PATTERN_COLOR_END: [number, number, number] = [21, 93, 252]; // azul escuro (fim)

export function patternColorAt(index: number, total: number): string {
  const t = total <= 1 ? 1 : index / (total - 1);
  const [r, g, b] = PATTERN_COLOR_START.map((start, i) =>
    Math.round(start + (PATTERN_COLOR_END[i] - start) * t),
  );
  return `rgb(${r}, ${g}, ${b})`;
}

function nearestDot(x: number, y: number): number | null {
  for (let i = 0; i < 9; i++) {
    const c = dotCenter(i);
    if (Math.hypot(c.x - x, c.y - y) < HIT_RADIUS) return i;
  }
  return null;
}

export function PatternLock({
  value,
  onChange,
}: {
  value: number[];
  onChange: (v: number[]) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null);

  function pointFromEvent(e: React.PointerEvent) {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent) {
    const { x, y } = pointFromEvent(e);
    const dot = nearestDot(x, y);
    setDragging(true);
    setPointer({ x, y });
    onChange(dot !== null ? [dot] : []);
  }

  function handlePointerMove(e: React.PointerEvent) {
    if (!dragging) return;
    const { x, y } = pointFromEvent(e);
    setPointer({ x, y });
    const dot = nearestDot(x, y);
    if (dot !== null && !value.includes(dot)) {
      onChange([...value, dot]);
    }
  }

  function handlePointerUp() {
    setDragging(false);
    setPointer(null);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        ref={containerRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        className="touch-none select-none"
        style={{ width: SIZE, height: SIZE }}
      >
        <svg width={SIZE} height={SIZE}>
          {value.slice(1).map((dot, idx) => {
            const a = dotCenter(value[idx]);
            const b = dotCenter(dot);
            return (
              <line
                key={idx}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={patternColorAt(idx + 1, value.length)}
                strokeWidth={4}
                strokeLinecap="round"
              />
            );
          })}
          {dragging && value.length > 0 && pointer && (
            <line
              x1={dotCenter(value[value.length - 1]).x}
              y1={dotCenter(value[value.length - 1]).y}
              x2={pointer.x}
              y2={pointer.y}
              stroke={patternColorAt(value.length - 1, value.length)}
              strokeWidth={4}
              strokeLinecap="round"
            />
          )}
          {POSITIONS.map((_, i) => {
            const c = dotCenter(i);
            const sequenceIndex = value.indexOf(i);
            const active = sequenceIndex !== -1;
            return (
              <circle
                key={i}
                cx={c.x}
                cy={c.y}
                r={active ? 14 : 10}
                fill={active ? patternColorAt(sequenceIndex, value.length) : "#9CA3AF"}
              />
            );
          })}
        </svg>
      </div>
      <button
        type="button"
        onClick={() => onChange([])}
        className="text-sm text-black/60 underline dark:text-white/60"
      >
        Limpar
      </button>
    </div>
  );
}
