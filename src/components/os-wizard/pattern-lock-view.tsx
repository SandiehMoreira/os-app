import { PATTERN_POSITIONS, PATTERN_SIZE, patternColorAt, patternDotCenter } from "./pattern-lock";

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
            stroke={patternColorAt(idx + 1, value.length)}
            strokeWidth={4}
            strokeLinecap="round"
          />
        );
      })}
      {PATTERN_POSITIONS.map((_, i) => {
        const c = patternDotCenter(i);
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
  );
}
