"use client";

import { useRef, useState } from "react";

const POSITIONS: [number, number][] = [
  [0, 0], [1, 0], [2, 0],
  [0, 1], [1, 1], [2, 1],
  [0, 2], [1, 2], [2, 2],
];

const SIZE = 240;
const PAD = 40;
const STEP = (SIZE - PAD * 2) / 2;
const HIT_RADIUS = 26;

function dotCenter(i: number) {
  const [cx, cy] = POSITIONS[i];
  return { x: PAD + cx * STEP, y: PAD + cy * STEP };
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
                stroke="#155DFC"
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
              stroke="#155DFC"
              strokeWidth={4}
              strokeLinecap="round"
            />
          )}
          {POSITIONS.map((_, i) => {
            const c = dotCenter(i);
            const active = value.includes(i);
            return (
              <circle
                key={i}
                cx={c.x}
                cy={c.y}
                r={active ? 14 : 10}
                fill={active ? "#155DFC" : "#9CA3AF"}
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
