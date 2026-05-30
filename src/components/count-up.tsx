"use client";

import { useEffect, useRef, useState } from "react";

/** 数字滚动动画：挂载或 value 变化时，从当前值缓动到目标值（easeOutCubic）。 */
export function CountUp({
  value,
  duration = 1800,
  className,
  style,
}: {
  value: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [display, setDisplay] = useState(0);
  const fromRef = useRef(0);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    let raf = 0;
    let startTs = 0;
    const step = (ts: number) => {
      if (!startTs) startTs = ts;
      const t = Math.min(1, (ts - startTs) / duration);
      // easeOutQuad：减速更平缓，计数在整段时长里均匀推进，避免提前到位后“停顿”
      const eased = 1 - (1 - t) * (1 - t);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) {
        raf = requestAnimationFrame(step);
      } else {
        fromRef.current = to;
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return (
    <span className={className} style={style}>
      {display}
    </span>
  );
}
