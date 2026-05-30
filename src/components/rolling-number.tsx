"use client";

import { useEffect, useState } from "react";

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
// 平滑的减速曲线（easeOutExpo 近似），翻滚丝滑、收尾平稳
const EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

/** 单个数位的纵向翻滚（类似日历 / 里程表）：从 0 滚到目标数字。 */
function DigitRoller({ target, duration, delay }: { target: number; duration: number; delay: number }) {
  const [pos, setPos] = useState(0);

  useEffect(() => {
    // 等挂载后下一帧再设目标值，触发 CSS transition
    const id = requestAnimationFrame(() => setPos(target));
    return () => cancelAnimationFrame(id);
  }, [target]);

  return (
    <span style={{ display: "inline-block", height: "1em", overflow: "hidden", lineHeight: 1 }}>
      <span
        style={{
          display: "flex",
          flexDirection: "column",
          transform: `translateY(-${pos * 10}%)`,
          transition: `transform ${duration}ms ${EASE} ${delay}ms`,
        }}
      >
        {DIGITS.map((d) => (
          <span key={d} style={{ height: "1em", lineHeight: 1 }}>
            {d}
          </span>
        ))}
      </span>
    </span>
  );
}

/** 数字翻滚动画：按数位渲染，每位独立纵向滚动到位（GPU 加速，丝滑流畅）。 */
export function RollingNumber({
  value,
  duration = 1100,
  className,
  style,
}: {
  value: number;
  duration?: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const digits = String(Math.max(0, Math.floor(value))).split("").map(Number);
  return (
    <span className={className} style={{ ...style, display: "inline-flex" }}>
      {digits.map((d, i) => (
        // key 含位数，保证位数变化时重新挂载并重新滚动
        <DigitRoller
          key={`${digits.length}-${i}`}
          target={d}
          duration={duration}
          delay={i * 90}
        />
      ))}
    </span>
  );
}
