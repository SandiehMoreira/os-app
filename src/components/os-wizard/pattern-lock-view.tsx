import { PATTERN_POSITIONS, PATTERN_SIZE, patternDotCenter } from "./pattern-lock";

export function PatternLockView({ value }: { value: number[] }) {
  return (
    <svg width={PATTERN_SIZE} height={PATTERN_SIZE}>
      {value.slice(1).map((dot, idx) => {
        const a = patternDotCenter(value[idx]);
        const b = patternDotCenter(dot);
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
      {PATTERN_POSITIONS.map((_, i) => {
        const c = patternDotCenter(i);
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
  );
}
